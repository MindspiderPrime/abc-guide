// GET /api/stock?store=270&codes=028866,030421,015512
//   -> { asOf, store, stock: { "028866": 5, "030421": 0 }, missing: [], stale: false }
//
// Why this exists: browsers can't read Virginia ABC's responses directly (no
// CORS header), and there is no bulk "what's in this store" endpoint upstream —
// each product costs one request. So this function fans out, with a cache and a
// concurrency cap in front of it, and is the only place that talks to ABC.

const BASE = 'https://www.abc.virginia.gov';
const USER_AGENT =
  'abc-guide (personal in-store lookup; +https://github.com/MindspiderPrime/abc-guide)';

const CACHE_TTL_MS = 10 * 60 * 1000; // store counts don't move fast enough to matter
const MAX_CODES = 30;                // bounded fan-out; the page ranks before it asks
const CONCURRENCY = 4;
const GAP_MS = 120;                  // spacing between outbound requests

/** Survives across warm invocations on the same instance. Best-effort, not durable. */
const cache = new Map(); // "store:code" -> { quantity, at }

let blockedUntil = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isChallenge(status, text) {
  if (status !== 403 && status !== 503) return false;
  const b = text.toLowerCase();
  return b.includes('just a moment') || b.includes('cf-challenge') || b.includes('/cdn-cgi/');
}

async function fetchOne(store, code) {
  const url = `${BASE}/webapi/inventory/mystore?storeNumbers=${store}&productCodes=${code}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(8000),
  });
  const text = await res.text();

  if (res.status === 429 || isChallenge(res.status, text)) {
    const hdr = Number(res.headers.get('retry-after'));
    blockedUntil = Date.now() + (Number.isFinite(hdr) && hdr > 0 ? hdr : 60) * 1000;
    const err = new Error('rate-limited');
    err.code = 'RATE_LIMITED';
    throw err;
  }
  if (!res.ok) {
    const err = new Error(`upstream ${res.status}`);
    err.code = 'UPSTREAM';
    throw err;
  }

  const data = JSON.parse(text);
  const p = data?.products?.[0];
  // No record is different from "zero on hand" — report it as unknown, not as 0.
  return p ? (p.storeInfo?.quantity ?? 0) : null;
}

export default async function handler(req, res) {
  const store = Number(req.query.store);
  const codes = String(req.query.codes || '')
    .split(',')
    .map((c) => c.trim().padStart(6, '0'))
    .filter((c) => /^\d{6}$/.test(c))
    .slice(0, MAX_CODES);

  if (!Number.isInteger(store) || store <= 0) {
    return res.status(400).json({ error: 'bad_store', message: 'store must be a store number' });
  }
  if (!codes.length) {
    return res.status(400).json({ error: 'no_codes', message: 'codes must be product codes' });
  }

  // The page asks for the same ranked candidate set every time for a given
  // category+price+store, so this URL is worth caching at the edge too.
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900');

  const now = Date.now();
  const stock = {};
  const missing = [];
  const pending = [];

  for (const code of codes) {
    const hit = cache.get(`${store}:${code}`);
    if (hit && now - hit.at < CACHE_TTL_MS) {
      if (hit.quantity === null) missing.push(code);
      else stock[code] = hit.quantity;
    } else {
      pending.push(code);
    }
  }

  if (pending.length && blockedUntil > now) {
    return res.status(503).json({
      error: 'rate_limited',
      message: 'Virginia ABC asked us to slow down. Try again in a moment.',
      retryAfterMs: blockedUntil - now,
      asOf: new Date().toISOString(),
      store,
      stock,          // whatever we already had cached is still good
      missing,
      partial: true,
    });
  }

  let failed = 0;
  const queue = [...pending];

  async function worker() {
    while (queue.length) {
      const code = queue.shift();
      try {
        const quantity = await fetchOne(store, code);
        cache.set(`${store}:${code}`, { quantity, at: Date.now() });
        if (quantity === null) missing.push(code);
        else stock[code] = quantity;
      } catch (err) {
        failed++;
        if (err.code === 'RATE_LIMITED') {
          queue.length = 0; // stop the whole fan-out immediately, don't retry harder
          return;
        }
      }
      await sleep(GAP_MS);
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));

  const rateLimited = blockedUntil > Date.now();
  return res.status(200).json({
    asOf: new Date().toISOString(),
    store,
    stock,
    missing,
    partial: failed > 0,
    ...(rateLimited ? { note: 'rate_limited', retryAfterMs: blockedUntil - Date.now() } : {}),
  });
}
