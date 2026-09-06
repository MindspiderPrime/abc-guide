// Builds data/stores.json — the ABC stores within a radius of the home store.
//
// Source is the VGIN ArcGIS layer (official Virginia open data). One request.
// Run: node scripts/build-stores.mjs [radiusMiles]

import { writeFileSync, mkdirSync } from 'node:fs';
import { allStores, milesBetween } from '../lib/abc.mjs';

const HOME_STORE = 270; // 809 E Parham Rd, Richmond
const RADIUS_MILES = Number(process.argv[2]) || 20;

const stores = await allStores();
console.log(`ABC stores statewide: ${stores.length}`);

const home = stores.find((s) => s.storeNumber === HOME_STORE);
if (!home) throw new Error(`home store ${HOME_STORE} not found in the VGIN layer`);
console.log(`home: #${home.storeNumber} ${home.address}, ${home.city} (${home.county})`);

const nearby = stores
  .map((s) => ({ ...s, miles: Math.round(milesBetween(home.lat, home.lng, s.lat, s.lng) * 10) / 10 }))
  .filter((s) => s.miles <= RADIUS_MILES)
  .sort((a, b) => a.miles - b.miles);

mkdirSync('data', { recursive: true });
writeFileSync(
  'data/stores.json',
  JSON.stringify({ homeStore: HOME_STORE, radiusMiles: RADIUS_MILES, builtAt: new Date().toISOString(), stores: nearby }, null, 2)
);

console.log(`\nwithin ${RADIUS_MILES} mi: ${nearby.length} stores`);
for (const s of nearby) {
  console.log(`  ${String(s.miles).padStart(5)} mi  #${String(s.storeNumber).padEnd(4)} ${s.address}, ${s.city} ${s.zip.slice(0, 5)}`);
}
console.log('\nwrote data/stores.json');
