// Builds what the phone downloads.
//
//   public/shelf.json          rated bottles only + stores + categories.
//                              Small, cached, loaded on every visit.
//   public/shelf/<cat>.json    every bottle in one category, rated or not.
//                              Fetched only when you tap "show everything".
//
// The split exists because the rated set is a few hundred rows and the full
// catalog is tens of thousands. Shipping the whole thing on every page load
// would break the one property that matters in a store: the ranked list appears
// before any network request finishes.
//
// Ratings key on labelId, not product code: "Tanqueray Gin" is one opinion that
// applies to all five of its bottle sizes.
//
// Run: node scripts/merge-shelf.mjs

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';

const catalog = JSON.parse(readFileSync('data/catalog.json', 'utf8'));
const ratings = existsSync('data/ratings.json')
  ? JSON.parse(readFileSync('data/ratings.json', 'utf8'))
  : {};
const stores = JSON.parse(readFileSync('data/stores.json', 'utf8'));

/**
 * The VGIN feed writes addresses out longhand and repeats the street-number
 * range ("809 East Parham Road, 809-823"). On a phone that overflows the
 * picker, so trim it to what you'd actually say out loud.
 */
function shortAddress(a) {
  return a
    // Everything after the first comma is a street-number range or a suite
    // ("809 East Parham Road, 809-823"; "3450 Pump Rd, 3450-3452 Suites 21 and 22").
    .split(',')[0]
    .replace(/\s+(Suite|Ste\.?|Unit)\s+.*$/i, '')
    .replace(/\bEast\b/g, 'E').replace(/\bWest\b/g, 'W')
    .replace(/\bNorth\b/g, 'N').replace(/\bSouth\b/g, 'S')
    .replace(/\bRoad\b/g, 'Rd').replace(/\bStreet\b/g, 'St')
    .replace(/\bAvenue\b/g, 'Ave').replace(/\bDrive\b/g, 'Dr')
    .replace(/\bBoulevard\b/g, 'Blvd').replace(/\bTurnpike\b/g, 'Tpke')
    .replace(/\bParkway\b/g, 'Pkwy').replace(/\bHighway\b/g, 'Hwy')
    .replace(/\bPlaza\b/g, 'Plz').replace(/\s+/g, ' ')
    .trim();
}

/** The VGIN feed shouts some city names ("RICHMOND"). Settle them down. */
const titleCase = (s) =>
  s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());

const slug = (c) => c.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/**
 * Where a category has no hand-authored style tags, fall back to ABC's own type
 * field — Silver/Reposado/Anejo for tequila, Fruit/Cream/Herbal for cordials.
 * It's already a real style vocabulary there. It is not for gin ("Regular") or
 * bourbon ("Bourbon"), which is why those are hand-authored in ratings.json.
 */
const styleFor = (p, rating) =>
  rating?.style || (p.type && p.type !== p.category ? p.type.toLowerCase() : '');

/** One product row, trimmed to what the page actually reads. */
function row(p, rating) {
  const r = {
    c: p.code,
    // The label this bottle belongs to. Ratings key on it, so one opinion
    // covers every size — and so does an opinion you type on the phone.
    l: p.labelId,
    n: rating?.name || p.name,
    cat: p.category,
    ml: p.ml,
    p: p.price,
    // price normalized to a 750 ml equivalent, so a 1.75 L handle can be
    // compared honestly against a standard bottle
    p750: Math.round(p.perMl * 750 * 100) / 100,
    pf: p.proof,
    st: styleFor(p, rating),
  };
  if (p.virginia) r.va = 1;
  if (rating) {
    r.s = rating.score;
    r.note = rating.note || '';
    r.src = rating.source || 'draft';
  }
  return r;
}

const rated = [];
const byCategory = new Map();
const unrated = new Map(); // labelId -> name, for the "what still needs rating" report

for (const p of catalog.products) {
  if (p.allocated) continue; // lottery/allocated bottles aren't a shelf you can shop
  const rating = ratings[p.labelId];

  if (!byCategory.has(p.category)) byCategory.set(p.category, []);
  byCategory.get(p.category).push(row(p, rating));

  if (rating) rated.push(row(p, rating));
  else if (!unrated.has(p.labelId)) unrated.set(p.labelId, `${p.category} · ${p.name}`);
}

rated.sort((a, b) => b.s - a.s || a.p - b.p);

// Categories the picker offers, ordered by how much rated depth they have —
// a shelf with two ratings shouldn't sit above one with sixty.
const categories = [...byCategory.keys()]
  .map((cat) => ({
    cat,
    rated: rated.filter((r) => r.cat === cat).length,
    total: byCategory.get(cat).length,
  }))
  .sort((a, b) => b.rated - a.rated || a.cat.localeCompare(b.cat));

// Rebuild the directory from scratch so a renamed or dropped shelf doesn't
// leave a stale file behind that the page could still fetch.
rmSync('public/shelf', { recursive: true, force: true });
mkdirSync('public/shelf', { recursive: true });

for (const [cat, products] of byCategory) {
  products.sort((a, b) => (b.s ?? -1) - (a.s ?? -1) || a.p - b.p);
  writeFileSync(`public/shelf/${slug(cat)}.json`, JSON.stringify({ cat, products }));
}

const shelf = {
  builtAt: new Date().toISOString(),
  catalogBuiltAt: catalog.builtAt,
  homeStore: stores.homeStore,
  // lat/lng ride along so the phone can work out which store you're standing
  // in without asking anything over the network. 39 pairs of numbers is under
  // a kilobyte, and it keeps "find my store" working in a dead spot.
  stores: stores.stores.map((s) => ({
    id: s.storeNumber,
    label: `#${s.storeNumber} · ${shortAddress(s.address)}, ${titleCase(s.city)}`,
    miles: s.miles,
    lat: s.lat,
    lng: s.lng,
  })),
  categories,
  products: rated,
};

writeFileSync('public/shelf.json', JSON.stringify(shelf));

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log(`rated bottles   ${rated.length}  of ${catalog.products.length} in the catalog`);
console.log(`  confirmed by you ${rated.filter((r) => r.src === 'jeff').length}  (rest are my drafts)`);
console.log(`stores          ${shelf.stores.length}`);
console.log(`\nshelf.json      ${kb(JSON.stringify(shelf).length)}  <- every visit`);

console.log('\ncategory                rated / total   file');
for (const c of categories) {
  const size = JSON.stringify({ cat: c.cat, products: byCategory.get(c.cat) }).length;
  console.log(
    `  ${c.cat.padEnd(20)} ${String(c.rated).padStart(5)} / ${String(c.total).padEnd(6)} ${kb(size).padStart(9)}`
  );
}

console.log(`\n${unrated.size} labels still unrated (they appear only under "show everything")`);
