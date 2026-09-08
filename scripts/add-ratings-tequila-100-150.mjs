// Completes Tequila's $100-150 bracket -- all 14 unrated bottles there.
// Style omitted throughout -- ABC's type field (Anejo/Gold/Mezcal/Reposado)
// is the vocabulary here.
//
// Run: node scripts/add-ratings-tequila-100-150.mjs
// Then rebuild: node scripts/merge-shelf.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const ratings = JSON.parse(readFileSync('data/ratings.json', 'utf8'));

const additions = [
  { id: '16986', name: 'Codigo 1530 Anejo Tequila', score: 7.5,
    note: "Codigo's aged expression, consistent with their well-regarded reposado." },
  { id: '20555', name: 'Grand Mayan Extra Aged Anejo', score: 7,
    note: 'The decorative bottle carries some of the price, but the extra-aged liquid is genuinely decent.' },
  { id: '20516', name: 'Casa Azul Organic Tequila Anejo', score: 7,
    note: 'A well-made organic anejo, solid but unremarkable at this price.' },
  { id: '17193', name: 'Grand Cava De Oro Extra Anejo', score: 6.5,
    note: 'A decent, unremarkable extra anejo.' },
  { id: '17022', name: 'Hacienda De Chihuahua H5 Extra Tequila Anejo', score: 7,
    note: 'From a distillery better known for sotol -- a distinctive, well-aged anejo.' },
  { id: '17582', name: 'Marca Negra Mezcal Tobala', score: 8.5,
    note: 'A rare wild tobala agave expression from a well-regarded artisanal producer. Complex and traditional.' },
  { id: '21389', name: 'El Tesoro Anejo Mundial Tequila Laphroaig Ed.', score: 8,
    note: 'El Tesoro finished in Laphroaig Scotch casks -- a genuinely distinctive smoky crossover on a well-regarded base.' },
  { id: '19286', name: 'El Mayor Extra Anejo Port Finish Tequila', score: 7.5,
    note: 'Port-cask finish adds real fruit depth to the well-aged El Mayor base.' },
  { id: '19126', name: 'Pluma Negra Tobala', score: 8,
    note: 'A rare wild-agave mezcal, complex and traditional.' },
  { id: '20640', name: 'El Mayor Extra Anejo 25th Anniversary Bourbon Aged', score: 7.5,
    note: 'Finished in bourbon barrels for a commemorative edition. A genuine step up from the standard Extra Anejo.' },
  { id: '17060', name: 'Number Juan Tequila Extra Anejo', score: 7,
    note: 'A well-aged extra anejo, solid and unremarkable.' },
  { id: '19149', name: 'Pluma Negra Tepeztate', score: 8,
    note: 'A rare wild tepeztate agave, distinctive and traditional.' },
  { id: '20824', name: 'Convite Tepextate Mezcal', score: 8,
    note: 'Another well-regarded wild-agave tepextate mezcal, complex and worth seeking out.' },
  { id: '21142', name: 'Casa Dragones Reposado Mizunara', score: 8,
    note: 'Finished in Japanese mizunara oak -- a distinctive, well-regarded ultra-premium release.' },
];

let added = 0, skipped = 0;
for (const { id, name, score, note } of additions) {
  if (ratings[id]) { console.log(`SKIP ${id} (${name}) — already rated`); skipped++; continue; }
  ratings[id] = { name, score, note, source: 'draft' };
  added++;
}

writeFileSync('data/ratings.json', JSON.stringify(ratings, null, 2) + '\n');
console.log(`Tequila 100-150: added ${added}, skipped ${skipped}.`);
