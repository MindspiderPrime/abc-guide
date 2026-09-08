// Second Tequila expansion pass, continuing through $30-70 (still 272
// unrated 750ml bottles there after the first expansion pass). Picks
// recognizable brands and skips near-duplicate gift-set/glassware bundles
// of an already-rated base bottle. Style omitted throughout -- ABC's type
// field (Silver/Reposado/Anejo/Mezcal/Gold) is the vocabulary here.
//
// Run: node scripts/add-ratings-tequila-expand2.mjs
// Then rebuild: node scripts/merge-shelf.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const ratings = JSON.parse(readFileSync('data/ratings.json', 'utf8'));

const additions = [
  { id: '24151', name: 'Hornitos Anejo Reserve', score: 6.5,
    note: "Hornitos' aged expression, a fair step up from their standard Plata." },
  { id: '19828', name: 'Jose Cuervo Tradicional Cristalino', score: 6.5,
    note: 'A filtered, smoother take on the genuinely good Tradicional line.' },
  { id: '20195', name: 'Corazon Tequila Anejo Single Barrel', score: 7,
    note: 'A single-barrel pick from the well-regarded Corazon line, more character than the standard Anejo.' },
  { id: '6536', name: 'Don Ramon Reposado', score: 6,
    note: 'A basic, mid-tier reposado. Fine for mixing.' },
  { id: '17081', name: 'Tanteo Chipotle Tequila', score: 6.5,
    note: 'Smoky heat rather than the sharp burn of their Habanero. A well-regarded cocktail ingredient.' },
  { id: '16271', name: 'Tanteo Blanco Tequila', score: 6.5,
    note: 'The clean base behind the well-regarded Tanteo flavored line.' },
  { id: '19083', name: 'Teremana Anejo Tequila', score: 6.5,
    note: "Dwayne Johnson's brand. Genuinely well-regarded, smooth agave character." },
  { id: '18928', name: 'Tromba Reposado Tequila', score: 7,
    note: 'A well-regarded, agave-forward reposado at a fair price.' },
  { id: '16971', name: 'Avion Tequila Reposado', score: 6.5,
    note: 'A reliable, well-known mid-tier reposado.' },
  { id: '11325', name: '1800 Tequila Anejo', score: 6.5,
    note: 'A dependable, widely available anejo.' },
  { id: '11835', name: 'Corralejo Tequila Anejo', score: 6.5,
    note: 'A solid anejo from a well-known hacienda-style brand.' },
  { id: '11885', name: 'El Mayor Tequila Anejo', score: 6.5,
    note: "El Mayor's aged expression, consistent quality with their Blanco and Reposado." },
  { id: '19632', name: 'Flecha Azul Blanco Tequila', score: 6.5,
    note: 'The celebrity-backed brand\'s base blanco -- decent, riding partly on the name.' },
  { id: '17054', name: 'Maestro Dobel Tequila Reposado', score: 7,
    note: "From the maker of the well-regarded Dobel Diamond. Smooth and reliable." },
  { id: '12746', name: 'Tres Agaves Tequila Reposado', score: 6.5,
    note: 'A solid, additive-free reposado at a fair price.' },
  { id: '15878', name: 'Villa One Silver', score: 6.5,
    note: "Nick Jonas's tequila brand. Decent, unremarkable beyond the celebrity name." },
  { id: '18274', name: 'Tres Generaciones Reposado', score: 6.5,
    note: 'A dependable, mid-tier reposado from a long-established brand.' },
  { id: '8601', name: 'Casamigos Tequila Reposado', score: 7.5,
    note: "George Clooney's brand backs up the hype -- genuinely smooth and well-made." },
  { id: '10617', name: 'Casa Noble Crystal Tequila', score: 7,
    note: 'An organic, well-regarded tequila house. Clean and refined.' },
  { id: '11872', name: 'Don Julio Tequila Blanco', score: 7.5,
    note: 'An iconic, excellent blanco. Smooth enough to sip, versatile enough to mix.' },
  { id: '16079', name: 'El Tesoro Blanco', score: 7.5,
    note: 'A well-regarded artisanal tequila, full agave character.' },
  { id: '2106', name: 'Milagro Anejo Tequila', score: 6.5,
    note: 'A reliable, well-balanced anejo from a consistently good brand.' },
  { id: '10609', name: 'Patron Silver Tequila', score: 7,
    note: 'The tequila that built the premium category. Smooth and reliable, if not the most complex blanco available.' },
  { id: '7381', name: 'Tequila Ocho Plata', score: 8,
    note: 'Single-estate, vintage-dated agave. One of the most respected blancos among tequila enthusiasts.' },
  { id: '17099', name: 'Ilegal Mezcal Reposado', score: 7.5,
    note: 'A well-regarded mezcal brand, aged for extra roundness without losing the smoke.' },
  { id: '6236', name: 'Herradura Silver Tequila', score: 7,
    note: 'A classic, well-regarded blanco with real agave depth.' },
  { id: '11873', name: 'Don Julio Tequila Reposado', score: 7.5,
    note: 'One of the most reliably excellent reposados available at any price.' },
  { id: '21657', name: 'Patron Reposado Tequila', score: 7,
    note: "Patron's aged expression, smooth and dependable." },
  { id: '14711', name: 'Casamigos Tequila Anejo', score: 7.5,
    note: 'More depth than the Reposado, consistent with the well-regarded Casamigos quality.' },
  { id: '16985', name: 'Codigo 1530 Reposado Tequila', score: 7,
    note: 'A well-regarded, wine-cask-aged reposado with real character.' },
  { id: '5478', name: 'Corzo Reposado', score: 6.5,
    note: 'A fine, unremarkable reposado.' },
  { id: '1364', name: 'Herradura Reposado Tequila', score: 7,
    note: "A classic reposado, consistent with Herradura's dependable quality." },
  { id: '16979', name: 'Casa Noble Anejo Tequila', score: 7,
    note: "Casa Noble's aged expression, organic and well-regarded." },
  { id: '13444', name: 'Casamigos Mezcal Joven', score: 7,
    note: "Casamigos' mezcal extension. Well-made, smokier than their tequila line." },
  { id: '6677', name: 'Milagro Select Barrel Reserve Silver Tequila', score: 7,
    note: "Milagro's premium silver expression, more depth than their standard Silver." },
  { id: '19148', name: 'Maestro Dobel Anejo', score: 7,
    note: 'A well-aged, well-regarded anejo from a respected house.' },
  { id: '11874', name: 'Don Julio Tequila Anejo', score: 7.5,
    note: 'Rich and well-aged, consistent with the excellent Don Julio lineup.' },
  { id: '7880', name: 'El Tesoro Reposado', score: 7.5,
    note: 'A well-regarded artisanal reposado, full agave character with real barrel depth.' },
  { id: '21658', name: 'Patron Anejo Tequila', score: 7.5,
    note: "Patron's aged expression, smooth and well-rounded." },
  { id: '15035', name: 'Tequila Ocho Reposado', score: 8,
    note: 'Single-estate, vintage-dated agave aged in bourbon barrels. Highly regarded among tequila enthusiasts.' },
  { id: '17100', name: 'Ilegal Mezcal Anejo', score: 7.5,
    note: "Ilegal's aged mezcal expression, rounder and more complex than their Joven." },
  { id: '20035', name: 'Espolon Cristalino Tequila', score: 6.5,
    note: 'The distinctive skull-bottle brand\'s filtered cristalino expression.' },
  { id: '11803', name: 'Chamucos Tequila Blanco', score: 6.5,
    note: 'A solid, mid-tier blanco with a distinctive skull-and-devil branding.' },
  { id: '16409', name: 'Cincoro Blanco Tequila', score: 7,
    note: 'An NBA-owners-group brand. Genuinely well-made, riding partly on the celebrity backing.' },
  { id: '16087', name: 'Del Maguey Las Milpas', score: 8,
    note: 'From the legendary single-village mezcal house. Complex and traditional.' },
  { id: '9464', name: 'Del Maquey Santo Domingo Albarradas Mezcal', score: 8,
    note: 'Another single-village expression from the highly-regarded Del Maguey portfolio.' },
  { id: '20585', name: 'Don Fulano Reposado', score: 7.5,
    note: 'A well-regarded artisanal reposado with genuine agave complexity.' },
  { id: '11804', name: 'Chamucos Tequila Anejo', score: 7,
    note: "Chamucos' aged expression, more depth than their Blanco." },
  { id: '21702', name: 'Volcan Reposado Tequila', score: 6.5,
    note: 'A solid, well-packaged reposado, decent but unremarkable.' },
  { id: '17057', name: 'Milagro Select Barrel Reserve Tequila Anejo', score: 7.5,
    note: "Milagro's premium anejo expression, real depth and complexity." },
];

let added = 0, skipped = 0;
for (const { id, name, score, note } of additions) {
  if (ratings[id]) { console.log(`SKIP ${id} (${name}) — already rated`); skipped++; continue; }
  ratings[id] = { name, score, note, source: 'draft' };
  added++;
}

writeFileSync('data/ratings.json', JSON.stringify(ratings, null, 2) + '\n');
console.log(`Tequila expand 2: added ${added}, skipped ${skipped}.`);
