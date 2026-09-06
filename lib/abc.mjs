// Polite, read-only client for Virginia ABC's public endpoints.
//
// These endpoints are undocumented and unsupported. We identify ourselves
// honestly, space our requests out, and stop the moment we're asked to.
// There is no evasion here and there must never be: no spoofed User-Agent,
// no proxy rotation, no challenge solving. See ARCHITECTURE.md, "Posture".

export const BASE = 'https://www.abc.virginia.gov';
export const STORES_URL =
  'https://services9.arcgis.com/6EuFgO4fLTqfNOhu/arcgis/rest/services/Virginia_ABC_Stores/FeatureServer/0/query';

export const USER_AGENT =
  'abc-guide (personal in-store lookup; +https://github.com/MindspiderPrime/abc-guide)';

/** Minimum gap between outbound requests, in ms. */
const MIN_INTERVAL = 300;
const MAX_RETRIES = 2;

let lastRequestAt = 0;
let blockedUntil = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Thrown when upstream signals a block. Callers should stop, not retry harder. */
export class RateLimited extends Error {
  constructor(retryAfterMs) {
    super('Virginia ABC is rate-limiting or challenging us');
    this.name = 'RateLimited';
    this.retryAfterMs = retryAfterMs;
  }
}

/** Thrown when the response parses but isn't the shape we expect. */
export class SchemaDrift extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'SchemaDrift';
  }
}

function isChallenge(status, text) {
  if (status !== 403 && status !== 503) return false;
  const b = text.toLowerCase();
  return (
    b.includes('just a moment') ||
    b.includes('cf-challenge') ||
    b.includes('/cdn-cgi/') ||
    b.includes('attention required')
  );
}

async function throttle() {
  const now = Date.now();
  if (blockedUntil > now) throw new RateLimited(blockedUntil - now);
  const wait = lastRequestAt + MIN_INTERVAL - now;
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();
}

async function request(url, init = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    await throttle();

    let res, text;
    try {
      res = await fetch(url, {
        ...init,
        headers: {
          Accept: 'application/json',
          'User-Agent': USER_AGENT,
          ...(init.body ? { 'Content-Type': 'application/json' } : {}),
          ...init.headers,
        },
        signal: AbortSignal.timeout(15000),
      });
      text = await res.text();
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_RETRIES) {
        await sleep(200 * 2 ** attempt);
        continue;
      }
      throw err;
    }

    if (res.status === 429 || isChallenge(res.status, text)) {
      const header = Number(res.headers.get('retry-after'));
      const retryAfterMs = (Number.isFinite(header) && header > 0 ? header : 60) * 1000;
      blockedUntil = Date.now() + retryAfterMs;
      throw new RateLimited(retryAfterMs);
    }

    if (res.status === 400) throw new SchemaDrift(`400 from ${url}: ${text.slice(0, 200)}`);

    if (res.status >= 500) {
      lastErr = new Error(`upstream ${res.status}`);
      if (attempt < MAX_RETRIES) {
        await sleep(200 * 2 ** attempt);
        continue;
      }
      throw lastErr;
    }

    if (!res.ok) throw new Error(`unexpected status ${res.status} from ${url}`);

    try {
      return JSON.parse(text);
    } catch {
      throw new SchemaDrift(`could not parse JSON from ${url}`);
    }
  }
  throw lastErr;
}

/** Product codes are six digits, zero-padded. `10807` is not `010807` upstream. */
export const pad6 = (code) => String(code).trim().padStart(6, '0');

// --- Coveo search index -----------------------------------------------------
//
// Coveo encodes non-alphanumerics in field names: z32x=space, z95x=underscore,
// z120x=x, z122x=z. So `_product_sku_ids` becomes `z95xproductz32xskuz32xids`.
// These are the fields we actually read.

export const F = {
  labelId: 'productz32xlabelz32xid',
  labelName: 'productz32xlabelz32xname',
  category: 'hierarchyz32xcategory',
  type: 'hierarchyz32xtype',
  proof: 'proofmin',
  skus: 'z95xproductz32xskuz32xids',
  sizes: 'z95xproductz32xsiz122xe',
  prices: 'z95xproductz32xprice',
  duplicate: 'z95xproductz32xlabelz32xduplicate',
  lottery: 'z95xproductz32xlottery',
  limited: 'z95xproductz32xlimitedz32xavailability',
  hasStoreInventory: 'z95xproductz32xhasz32xstorez32xinventory',
};

/** Coveo returns scalars, arrays, or nulls interchangeably. Normalize both ways. */
export const one = (v) => {
  if (Array.isArray(v)) return v.length ? one(v[0]) : '';
  return v == null ? '' : String(v).trim();
};
export const many = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

/**
 * One page of the search index for a category.
 * Returns raw Coveo results; exploding them into bottles is the caller's job.
 *
 * OFFLINE ONLY — this runs in scripts/build-catalog.mjs at a desk, never in the
 * deployed app. It goes out over curl rather than Node's fetch because
 * Cloudflare currently serves a challenge to undici's TLS fingerprint on this
 * one route. That is a change of HTTP client, not a disguise: same honest
 * User-Agent, same throttle, no challenge solving, no browser impersonation.
 * If curl starts getting challenged too, we stop here and seed the catalog from
 * ABC's officially published quarterly price list instead. We do not escalate.
 */
export async function searchCategory(category, { limit = 100, offset = 0, type } = {}) {
  // Bourbon and rye are not categories — the index files all 4,393 of them under
  // "Whiskey" and splits them with hierarchy_type. So a shelf like "Bourbon"
  // needs both clauses.
  const aq = type
    ? `@${F.category}=="${category}" @${F.type}=="${type}"`
    : `@${F.category}=="${category}"`;
  const body = {
    q: '',
    aq,
    numberOfResults: limit,
    firstResult: offset,
  };
  const data = await curlPostJson(`${BASE}/coveo/rest/search/v2`, body);
  if (!Array.isArray(data?.results)) throw new SchemaDrift('search: no results array');
  return { total: data.totalCount ?? 0, results: data.results };
}

/** POST JSON via curl. Same throttle and challenge posture as request(). */
async function curlPostJson(url, body) {
  const { spawn } = await import('node:child_process');

  await throttle();
  const args = [
    '-s', '-S', '--max-time', '25',
    '-w', '\n%{http_code}',
    '-X', 'POST',
    '-H', 'Content-Type: application/json',
    '-H', 'Accept: application/json',
    '-H', `User-Agent: ${USER_AGENT}`,
    '--data-binary', '@-', // body arrives on stdin, written below
    url,
  ];

  const stdout = await new Promise((resolve, reject) => {
    const child = spawn('curl', args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0 ? resolve(out) : reject(new Error(`curl exited ${code}: ${err.trim()}`))
    );
    child.stdin.on('error', reject);
    child.stdin.end(JSON.stringify(body));
  });

  const cut = stdout.lastIndexOf('\n');
  const status = Number(stdout.slice(cut + 1).trim());
  const text = stdout.slice(0, cut);

  if (status === 429 || isChallenge(status, text)) {
    blockedUntil = Date.now() + 60000;
    throw new RateLimited(60000);
  }
  if (status !== 200) throw new Error(`unexpected status ${status} from ${url}`);
  try {
    return JSON.parse(text);
  } catch {
    throw new SchemaDrift(`could not parse JSON from ${url}`);
  }
}

// --- Inventory --------------------------------------------------------------

/**
 * Stock of one product at one store.
 *
 * The parameter names are plural but the server accepts exactly one value each;
 * comma-separated lists return a 400. There is no bulk variant — this is why
 * the app ranks locally first and only then asks about a bounded candidate set.
 *
 * Returns null when there is no inventory record at all (distinct from qty 0).
 */
export async function stockAt(storeNumber, productCode) {
  const code = pad6(productCode);
  const url = `${BASE}/webapi/inventory/mystore?storeNumbers=${Number(storeNumber)}&productCodes=${code}`;
  const data = await request(url);
  const p = data?.products?.[0];
  if (!p) return null;
  return { code, storeId: p.storeInfo?.storeId ?? Number(storeNumber), quantity: p.storeInfo?.quantity ?? 0 };
}

/**
 * Stock at an anchor store plus nearby stores that carry it, in one request.
 * Same cost as stockAt — this is what makes "who else nearby has it" nearly free.
 */
export async function stockNearby(storeNumber, productCode) {
  const code = pad6(productCode);
  const url = `${BASE}/webapi/inventory/storeNearby?storeNumber=${Number(storeNumber)}&productCode=${code}`;
  const data = await request(url);
  const p = data?.products?.[0];
  if (!p) return null;
  const shape = (s) => ({
    storeId: s.storeId,
    quantity: s.quantity ?? 0,
    distance: s.distance ?? null,
    address: s.address ?? s.address1 ?? '',
    city: s.city ?? '',
    zip: s.zip ?? '',
    hours: s.hours ?? '',
  });
  return {
    code,
    store: shape(p.storeInfo ?? {}),
    nearby: (p.nearbyStores ?? []).map(shape),
  };
}

// --- Store locator (official VGIN open data) --------------------------------

/** All Virginia ABC retail locations. Official open data, not a scrape. */
export async function allStores() {
  const url =
    `${STORES_URL}?where=1%3D1&outFields=*&f=json&returnGeometry=false&resultRecordCount=2000`;
  const data = await request(url);
  if (!Array.isArray(data?.features)) throw new SchemaDrift('stores: no features array');
  return data.features
    .map((f) => f.attributes)
    .map((a) => ({
      storeNumber: Number(String(a.LandmkName ?? '').replace(/\D+/g, '')) || null,
      address: String(a.Address ?? '').trim(),
      city: String(a.City ?? '').trim(),
      state: String(a.State ?? '').trim(),
      zip: String(a.Zip ?? '').trim(),
      // The feed double-encodes UTF-8 in Phone; strip the mojibake non-breaking space.
      phone: String(a.Phone ?? '').replace(/Â | /g, ' ').trim(),
      county: String(a.FIPSname ?? '').trim(),
      lat: Number(a.Y),
      lng: Number(a.X),
    }))
    .filter((s) => s.storeNumber && Number.isFinite(s.lat) && Number.isFinite(s.lng));
}

/** Great-circle miles between two points. */
export function milesBetween(aLat, aLng, bLat, bLng) {
  const R = 3958.7613;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
