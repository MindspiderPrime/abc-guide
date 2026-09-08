// Expands Tequila coverage, closing the remaining under-$30 gap (40 unrated
// bottles -- the only real "cheap end" hole left in this category, since
// Gin/Bourbon/Rye already got that treatment) plus a chunk of the $30-50
// range. Style omitted throughout -- ABC's own type field (Silver/Reposado/
// Anejo/Mezcal/Gold) is already the meaningful vocabulary for this category,
// matching every existing Tequila rating in this file.
//
// Run: node scripts/add-ratings-tequila-expand.mjs
// Then rebuild: node scripts/merge-shelf.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const ratings = JSON.parse(readFileSync('data/ratings.json', 'utf8'));

const additions = [
  // ── Under $30 ──
  { id: '22112', name: 'Jose Cuervo Devils Reserve', score: 6,
    note: 'A step up from standard Cuervo Especial, smoother agave character.' },
  { id: '6902', name: 'Monte Alban Reposado Tequila', score: 5,
    note: 'A basic, budget-tier reposado. Fine for mixing, not for sipping.' },
  { id: '6904', name: 'Monte Alban Silver', score: 5,
    note: 'Same budget tier as their Reposado -- a mixing tequila.' },
  { id: '4533', name: 'El Charro Tequila Silver', score: 5,
    note: 'A bottom-shelf blanco, thin agave character.' },
  { id: '22949', name: 'Hornitos Pineapple', score: 5.5,
    note: 'A flavored twist on the reliable Hornitos base. Real pineapple sweetness.' },
  { id: '12761', name: 'Sauza Anos 100 Tequila Reposado', score: 5.5,
    note: 'A mid-tier Sauza expression, smoother than their standard Silver.' },
  { id: '2901', name: 'Tarantula Azul', score: 5,
    note: 'A novelty-branded budget blanco. Unremarkable.' },
  { id: '24226', name: 'Peligroso Reposado Tequila', score: 6,
    note: 'A solid mid-tier reposado, real agave flavor for the price.' },
  { id: '17070', name: 'Peligroso Silver Tequila', score: 6,
    note: 'Clean and mixable, a fair step up from the bottom shelf.' },
  { id: '22824', name: 'Bandido De Amores Reposado Tequila', score: 6,
    note: 'A fair budget-mid reposado, unremarkable but decent.' },
  { id: '23331', name: 'Cuervo Tradicional Reposado W/ Agave Nectar', score: 6.5,
    note: 'Standard Jose Cuervo Tradicional -- one of Cuervo\'s genuinely well-regarded lines -- with an agave nectar included.' },
  { id: '23390', name: 'Jose Cuervo Tradicional Blanco With Agave Syrup', score: 6.5,
    note: 'The Tradicional line is a real step up from standard Cuervo. Comes bundled with syrup for margaritas.' },
  { id: '17595', name: 'Bribon Blanco Tequila', score: 5.5,
    note: 'A basic blanco, fine for mixing.' },
  { id: '24789', name: 'Cazadores Tequila Pineapple', score: 5.5,
    note: 'Flavored variant on the reliable Cazadores base.' },
  { id: '17013', name: 'Dulce Vida Lime Tequila', score: 6,
    note: 'Organic tequila with real lime character rather than syrup sweetness.' },
  { id: '17014', name: 'Dulce Vida Pineapple Jalapeno Tequila', score: 6,
    note: 'Real heat behind the pineapple. One of the more interesting flavored tequilas at this price.' },
  { id: '13159', name: 'Dulce Vida Tequila Grapefruit', score: 6,
    note: 'Tart grapefruit on an organic base, refreshing.' },
  { id: '23177', name: 'Misto Tequila Blackberry & Rosemary', score: 5.5,
    note: 'An herbal-fruit flavor combination, distinctive if a bit gimmicky.' },
  { id: '23178', name: 'Misto Tequila Blood Orange & Hibiscus', score: 5.5,
    note: 'Floral and citrus, similar tier to their Blackberry & Rosemary.' },
  { id: '17028', name: 'Libelula Tequila', score: 5.5,
    note: 'A fair budget gold tequila, unremarkable.' },
  { id: '8007', name: 'Cazadores Reposado With Glass', score: 6.5,
    note: 'A well-regarded mid-tier reposado, smooth and reliable.' },
  { id: '11961', name: "Hornito's Lime Shot Tequila", score: 5.5,
    note: 'Pre-flavored for a shot format. Fine for the party occasion it is built for.' },
  { id: '20502', name: 'Astral Tequila Anejo', score: 7,
    note: "Astral's anejo expression -- the same well-regarded brand as their blanco, aged for more depth." },
  { id: '7690', name: '1800 Coconut Tequila', score: 5.5,
    note: 'Sweet coconut flavor on the reliable 1800 base.' },
  { id: '11883', name: 'El Jimador Tequila Anejo', score: 6.5,
    note: 'A reliable, widely available anejo. Good value for the aging.' },
  { id: '16590', name: '21 Seeds Cucumber Jalapeno Tequila', score: 6,
    note: 'A women-founded brand with genuine fresh-flavor infusions rather than syrup.' },
  { id: '16591', name: '21 Seeds Grapefruit Hibiscus Tequila', score: 6,
    note: 'Real fruit and floral character, similar quality tier to their Cucumber Jalapeno.' },
  { id: '16589', name: '21 Seeds Valencia Orange Tequila', score: 6,
    note: 'Bright citrus infusion on a clean tequila base.' },
  { id: '18567', name: '818 Tequila Reposado', score: 6,
    note: "Kendall Jenner's brand. Decent tequila riding more on celebrity than distinction." },
  { id: '14592', name: 'Corazon Tequila Reposado Single Barrel', score: 7,
    note: 'A well-regarded single-barrel reposado, more character than the standard Corazon line.' },
  { id: '17500', name: 'Deleon Reposado Tequila', score: 6.5,
    note: 'A premium-positioned reposado, smooth and well-made.' },
  { id: '21695', name: 'Lunazul Tequila Cristalino Primero', score: 6.5,
    note: 'A filtered, smoother expression of the reliable Lunazul brand.' },

  // ── $30-50 ──
  { id: '14438', name: 'Corazon Tequila Anejo', score: 7,
    note: 'Well-aged and well-regarded, consistent with the rest of the Corazon line.' },
  { id: '4592', name: 'El Mayor Blanco Tequila', score: 6.5,
    note: 'A clean, agave-forward blanco at a fair price.' },
  { id: '16450', name: 'Jose Cuervo Tradicional Anejo', score: 6.5,
    note: 'The aged expression of Cuervo\'s genuinely good Tradicional line.' },
  { id: '12358', name: 'Lunazul Tequila Anejo', score: 6.5,
    note: 'A reliable, well-aged expression from a consistently good value brand.' },
  { id: '11762', name: 'Cabo Wabo Tequila Reposado', score: 6.5,
    note: "Sammy Hagar's brand. Decent tequila, the name carries some of the price." },
  { id: '7465', name: 'DeLeon Anejo Tequila', score: 6.5,
    note: "DeLeon's aged expression, smooth and premium-positioned." },
  { id: '4593', name: 'El Mayor Reposado Tequila', score: 6.5,
    note: 'A fair step up from their Blanco, more roundness from the barrel time.' },
  { id: '17082', name: 'Tanteo Habanero Tequila', score: 6.5,
    note: 'Genuine, well-balanced heat rather than a gimmick. A real favorite for a spicy margarita.' },
  { id: '7497', name: 'Tanteo Jalapeno Tequila', score: 6.5,
    note: 'Similar quality to their Habanero, milder heat. A well-regarded cocktail ingredient.' },
  { id: '17062', name: 'Olmeca Altos Tequila Anejo', score: 7,
    note: "Olmeca Altos' agave-forward quality carries through to their anejo expression." },
  { id: '17019', name: 'Gran Centenario Tequila Anejo', score: 6.5,
    note: 'A solid mid-tier anejo, reliable and unremarkable.' },
  { id: '11327', name: 'Cabo Wabo Tequila Anejo', score: 7,
    note: 'More depth than the Reposado, a fair step up.' },
  { id: '20531', name: 'Cutwater Blanco Tequila', score: 6.5,
    note: "Cutwater's tequila base, the same one behind their popular canned margaritas -- clean and well-made on its own." },
  { id: '20278', name: 'Familia Camarena Anejo Tequila', score: 6.5,
    note: 'A reliable, well-regarded value brand. Good aging for the price.' },
];

let added = 0, skipped = 0;
for (const { id, name, score, note } of additions) {
  if (ratings[id]) { console.log(`SKIP ${id} (${name}) — already rated`); skipped++; continue; }
  ratings[id] = { name, score, note, source: 'draft' };
  added++;
}

writeFileSync('data/ratings.json', JSON.stringify(ratings, null, 2) + '\n');
console.log(`Tequila expand: added ${added}, skipped ${skipped}.`);
