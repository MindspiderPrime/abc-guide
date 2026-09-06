// Builds data/catalog.json — every bottle ABC sells in the given categories.
//
// Pages the site's search index, then expands each product *label* into one row
// per bottle. A label like "Tanqueray Gin" carries index-aligned lists:
//
//   sizes  ['50 ml', '375 ml', '750 ml', '1 L',   '1.75 L']
//   prices ['2.79',  '15.99',  '28.99',  '38.99', '44.79' ]
//   skus   ['028861','028864', '028866', '028867','028868']
//
// Same position = same bottle. Taking only the first entry (as the vabc
// reference client does) would file a 50 ml airplane bottle at $2.79 under
// "Tanqueray Gin" — see ARCHITECTURE.md, Finding 4.
//
// Shelves are named "Category" or "Category:Type". Bourbon and rye are not
// categories upstream — the index files them under "Whiskey" and splits them
// with hierarchy_type — so they're requested as Whiskey:Bourbon / Whiskey:Rye
// and stored under the name people actually use.
//
// Run: node scripts/build-catalog.mjs [Shelf ...]     (default: Gin)

import { writeFileSync, mkdirSync } from 'node:fs';
import { searchCategory, F, one, many, pad6 } from '../lib/abc.mjs';

// The full shelf list. Whiskey splits into separate shelves because bourbon and
// scotch are different shopping trips; everything else stays one shelf and uses
// ABC's own type field as its style vocabulary (Silver/Reposado/Anejo for
// tequila, Fruit/Cream/Herbal for cordials). Non-drink categories — Mixers,
// Rimmers, Gift Bag/Box, Reusable Bag — are deliberately absent.
const ALL_SHELVES = [
  'Whiskey:Bourbon', 'Whiskey:Rye', 'Whiskey:Scotch', 'Whiskey:Irish',
  'Whiskey:Tennessee', 'Whiskey:Canadian', 'Whiskey:Japanese', 'Whiskey:Blended',
  'Whiskey:Moonshine',
  'Gin', 'Vodka', 'Tequila', 'Rum', 'Brandy',
  'Cordials', 'Vermouth', 'Schnapps', 'Cocktails',
];

const argv = process.argv.slice(2);
const requested = argv.includes('--all') ? ALL_SHELVES : argv.length ? argv : ['Gin'];

const SHELVES = requested.map((arg) => {
  const [category, type] = arg.split(':');
  return { category, type, name: type || category }; // "Whiskey:Bourbon" shelves as "Bourbon"
});
const PAGE = 100;

/** "1.75 L" -> 1750, "750 ml" -> 750. Returns null if unparseable. */
function toMl(size) {
  const m = String(size).trim().match(/^([\d.]+)\s*(ml|l)$/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n)) return null;
  return Math.round(m[2].toLowerCase() === 'l' ? n * 1000 : n);
}

const rows = [];
const seen = new Set();
const stats = { labels: 0, noSkus: 0, mismatched: 0, badSize: 0, dupeCodes: 0 };

for (const shelf of SHELVES) {
  const { category, type: shelfType, name: shelfName } = shelf;
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const { total: t, results } = await searchCategory(category, { limit: PAGE, offset, type: shelfType });
    total = t;
    if (!results.length) break;
    process.stdout.write(`\r${shelfName}: ${Math.min(offset + results.length, total)}/${total} labels`);

    for (const r of results) {
      const raw = r.raw ?? {};
      stats.labels++;

      const skus = many(raw[F.skus]);
      const sizes = many(raw[F.sizes]);
      const prices = many(raw[F.prices]);

      // Duplicate label rows come back with a null sku list. Drop them.
      if (!skus.length) {
        stats.noSkus++;
        continue;
      }
      // If the lists ever fall out of alignment the position-matching above is
      // unsafe, so refuse to guess rather than emit a wrong price.
      if (skus.length !== sizes.length || skus.length !== prices.length) {
        stats.mismatched++;
        continue;
      }

      const labelId = one(raw[F.labelId]);
      const name = one(raw[F.labelName]) || one(raw['pagez32xtitle']);
      const proof = Number(one(raw[F.proof])) || null;
      const type = one(raw[F.type]);
      const allocated =
        one(raw[F.lottery]) === '1' || one(raw[F.limited]) === '1';
      const virginia = one(raw[F.virginia]) === '1';

      // "Combo" is ABC's marker for gift sets and multi-bottle packs. They are
      // not a bottle you can compare on price, so they never reach the shelf.
      if (type === 'Combo') continue;

      for (let i = 0; i < skus.length; i++) {
        const code = pad6(one(skus[i]));
        if (!code || code === '000000') continue;
        if (seen.has(code)) {
          stats.dupeCodes++;
          continue;
        }
        const ml = toMl(one(sizes[i]));
        if (ml == null) {
          stats.badSize++;
          continue;
        }
        const price = parseFloat(one(prices[i]));
        if (!Number.isFinite(price)) continue;

        seen.add(code);
        rows.push({
          code,
          labelId,
          name,
          category: shelfName,
          type,
          ml,
          size: one(sizes[i]),
          price: Math.round(price * 100) / 100,
          perMl: Math.round((price / ml) * 100000) / 100000,
          proof,
          allocated,
          virginia,
        });
      }
    }

    offset += results.length;
    if (results.length < PAGE) break;
  }
  process.stdout.write('\n');
}

rows.sort((a, b) => a.name.localeCompare(b.name) || a.ml - b.ml);

mkdirSync('data', { recursive: true });
writeFileSync(
  'data/catalog.json',
  JSON.stringify(
    { categories: SHELVES.map((s) => s.name), builtAt: new Date().toISOString(), count: rows.length, products: rows },
    null,
    2
  )
);

const labels = new Set(rows.map((r) => r.labelId)).size;
console.log(`\nlabels seen        ${stats.labels}`);
console.log(`  dropped (no sku) ${stats.noSkus}   <- duplicate label rows, expected`);
console.log(`  dropped (misalign) ${stats.mismatched} <- must stay 0; see Finding 4`);
console.log(`  dropped (size)   ${stats.badSize}`);
console.log(`  skipped (dupe code) ${stats.dupeCodes}`);
console.log(`\nbottles ${rows.length}  across ${labels} distinct labels`);

const c750 = rows.filter((r) => r.ml === 750);
console.log(`750 ml: ${c750.length}   of those under $30: ${c750.filter((r) => r.price <= 30).length}`);
console.log('\nwrote data/catalog.json');
