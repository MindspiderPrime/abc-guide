// Builds public/shelf.json — the single file the phone downloads.
//
// catalog.json (generated, disposable) + ratings.json (Jeff's, irreplaceable)
//   -> one flat list of rated bottles, smallest useful shape.
//
// Ratings key on labelId, not product code: "Tanqueray Gin" is one opinion that
// applies to all five of its bottle sizes. Rating each code separately would be
// triple the work and would silently go stale whenever ABC changes the lineup.
//
// Run: node scripts/merge-shelf.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

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

const rated = [];
const unrated = new Map(); // labelId -> name, for the "what still needs rating" report

for (const p of catalog.products) {
  const r = ratings[p.labelId];
  if (!r) {
    if (!unrated.has(p.labelId)) unrated.set(p.labelId, p.name);
    continue;
  }
  if (p.allocated) continue; // lottery/allocated bottles aren't a shelf you can shop

  rated.push({
    c: p.code,
    n: r.name || p.name,
    cat: p.category,
    ml: p.ml,
    p: p.price,
    // price normalized to a 750 ml equivalent, so a 1.75 L handle can be
    // compared honestly against a standard bottle
    p750: Math.round(p.perMl * 750 * 100) / 100,
    pf: p.proof,
    s: r.score,
    st: r.style,
    note: r.note || '',
    src: r.source || 'draft',
  });
}

rated.sort((a, b) => b.s - a.s || a.p - b.p);

const shelf = {
  builtAt: new Date().toISOString(),
  catalogBuiltAt: catalog.builtAt,
  homeStore: stores.homeStore,
  stores: stores.stores.map((s) => ({
    id: s.storeNumber,
    label: `#${s.storeNumber} · ${shortAddress(s.address)}, ${titleCase(s.city)}`,
    miles: s.miles,
  })),
  styles: [...new Set(rated.map((r) => r.st))].filter(Boolean).sort(),
  categories: [...new Set(rated.map((r) => r.cat))].sort(),
  products: rated,
};

mkdirSync('public', { recursive: true });
writeFileSync('public/shelf.json', JSON.stringify(shelf));

const kb = (JSON.stringify(shelf).length / 1024).toFixed(1);
console.log(`rated bottles   ${rated.length}`);
console.log(`  750 ml        ${rated.filter((r) => r.ml === 750).length}`);
console.log(`  confirmed by you ${rated.filter((r) => r.src === 'jeff').length}  (rest are my drafts)`);
console.log(`stores          ${shelf.stores.length}`);
console.log(`styles          ${shelf.styles.join(', ') || '(none)'}`);
console.log(`\nwrote public/shelf.json  (${kb} KB — this is what the phone downloads)`);

if (unrated.size) {
  console.log(`\n${unrated.size} labels in the catalog have no rating yet:`);
  for (const [id, name] of [...unrated].slice(0, 15)) console.log(`  ${id}  ${name}`);
  if (unrated.size > 15) console.log(`  ... and ${unrated.size - 15} more`);
}
