// Continues Tequila into the $60-150 range (110 unrated bottles there),
// including the legendary Del Maguey single-village mezcals and several
// well-regarded ultra-premium tequilas. Style omitted throughout -- ABC's
// type field (Silver/Reposado/Anejo/Mezcal/Gold) is the vocabulary here.
//
// Run: node scripts/add-ratings-tequila-60-150.mjs
// Then rebuild: node scripts/merge-shelf.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const ratings = JSON.parse(readFileSync('data/ratings.json', 'utf8'));

const additions = [
  { id: '18970', name: 'Xicaru Pechuga Mole Mezcal', score: 7,
    note: 'A traditional pechuga-style mezcal with a mole-spice infusion. Distinctive and complex.' },
  { id: '19747', name: 'Codigo 1530 Mezcal Artesenal Joven', score: 7,
    note: "Codigo's mezcal extension, well-made and traditional." },
  { id: '21428', name: 'Adictivo Reposado Doble Tequila', score: 6.5,
    note: 'Double-barreled reposado, more oak influence than a standard reposado.' },
  { id: '16556', name: 'Yola Mezcal', score: 6.5,
    note: 'A solid, traditional mezcal at a fair price for the category.' },
  { id: '24518', name: 'Casa Maestri Anejo 250 Anniversary', score: 6.5,
    note: 'A commemorative anejo bottling, decent and unremarkable beyond the packaging.' },
  { id: '24448', name: 'Corazon Expresiones Reposado Stagg', score: 7.5,
    note: 'Finished in barrels from the cult-favorite Stagg bourbon. A genuinely distinctive crossover.' },
  { id: '14829', name: 'Los Amantes Mezcal Anejo', score: 7,
    note: 'A well-regarded, traditional aged mezcal.' },
  { id: '22393', name: 'Tromba Anejo Tequila', score: 7,
    note: "Tromba's aged expression, consistent with their well-regarded reposado and blanco." },
  { id: '17581', name: 'Marca Negra Mezcal Espadin', score: 8,
    note: 'A well-regarded artisanal mezcal producer. Traditional, smoky, and complex.' },
  { id: '11887', name: 'El Mayor Tequila Extra Anejo', score: 7,
    note: 'A genuinely well-aged extra anejo at a fair price for the category.' },
  { id: '23588', name: 'Mijenta Maestra Selection No. 2', score: 7.5,
    note: 'A sustainability-focused premium brand with real quality behind the story.' },
  { id: '16977', name: '1921 Tequila Anejo Reserva Especial', score: 6.5,
    note: 'A decent, mid-tier anejo, unremarkable but solid.' },
  { id: '22960', name: 'Corazon Expresiones Anejo Elmer T. Lee', score: 7.5,
    note: 'Finished in Elmer T. Lee bourbon barrels -- a distinctive bourbon-tequila crossover.' },
  { id: '17230', name: 'Corazon William Larue Weller Anejo', score: 7.5,
    note: 'Finished in Weller barrels. Real wheated-bourbon sweetness layered onto the agave.' },
  { id: '18022', name: 'Don Julio Reposado Primavera Tequila', score: 7.5,
    note: 'A well-regarded seasonal limited release from a consistently excellent house.' },
  { id: '19188', name: 'El Tequileno Anejo Gran Reserva', score: 7.5,
    note: 'A well-regarded artisanal anejo, real depth and agave character.' },
  { id: '21392', name: 'Tromba Reposado Tequila Single Barrel Cask Select', score: 7,
    note: 'A single-barrel pick of the well-regarded Tromba reposado.' },
  { id: '24861', name: 'Escalon Seleccion Tahona Blanco', score: 7.5,
    note: 'Crushed using the traditional stone tahona wheel rather than modern mills -- genuine old-world character.' },
  { id: '24977', name: 'Escalon Seleccion Tahona Reposado', score: 7.5,
    note: 'Same traditional tahona process as their Blanco, aged for more roundness.' },
  { id: '23082', name: 'Mijenta Tequila Reposado Cristalino', score: 7.5,
    note: "Mijenta's filtered cristalino expression, smooth and well-made." },
  { id: '25033', name: 'Corazon Expresiones Anejo George T. Stagg', score: 8,
    note: 'Finished in George T. Stagg barrels -- one of the more distinctive bourbon-cask tequila crossovers available.' },
  { id: '18664', name: 'Corralejo 3 Year Extra Anejo', score: 7,
    note: 'A genuine three-year extra anejo, well-aged for the price.' },
  { id: '16408', name: 'Cincoro Reposado Tequila', score: 7,
    note: 'The NBA-owners-group brand\'s aged expression. Well-made.' },
  { id: '21297', name: 'Don Julio Alma Miel Tequila', score: 7.5,
    note: 'A limited, unique blend from Don Julio. Well-regarded and distinctive within their lineup.' },
  { id: '19937', name: 'Herradura Legend Anejo Tequila', score: 7.5,
    note: "Herradura's premium anejo line, more depth than their standard Reposado and Anejo." },
  { id: '19766', name: 'Mezcal De Leyendas Oaxaca Tobala', score: 8,
    note: 'A rare wild-agave mezcal from a well-regarded producer. Complex and traditional.' },
  { id: '22065', name: 'Adictivo Extra Anejo Tequila', score: 7,
    note: 'A well-aged extra anejo, rich and oak-forward.' },
  { id: '18260', name: 'Tequila Komos Reposado Rosa', score: 7.5,
    note: 'Wine-cask finished in the ornate Komos bottle. Well-regarded, genuine complexity behind the packaging.' },
  { id: '24085', name: 'Casa Dragones 200 Copas Anejo Cristalino', score: 7.5,
    note: 'A well-regarded ultra-premium brand\'s cristalino anejo. Smooth and refined.' },
  { id: '16410', name: 'Cincoro Anejo Tequila', score: 7,
    note: "Cincoro's aged expression, consistent with the rest of their well-made lineup." },
  { id: '20895', name: 'Del Maguey San Pablo Ameya', score: 8.5,
    note: 'A single-village mezcal from the legendary Del Maguey portfolio. Complex and traditional.' },
  { id: '17091', name: 'Del Maguey Tepexate Mezcal', score: 8.5,
    note: 'A rare wild-agave expression from Del Maguey. Distinctive, worth seeking out.' },
  { id: '3487', name: 'Del Maguey Tobala', score: 9,
    note: "Del Maguey's most iconic bottling, made from rare wild tobala agave. Excellent and highly regarded." },
  { id: '19898', name: 'Montelobos Pechuga Mezcal', score: 8,
    note: 'A traditional pechuga-style mezcal, distilled with fruit and raw chicken breast for a distinctive richness.' },
  { id: '18259', name: 'Tequila Komos Anejo Cristalino', score: 7.5,
    note: "The top of the Komos line. Smooth, refined, and well-regarded." },
  { id: '16583', name: 'Skelly Tequila Anejo', score: 6.5,
    note: 'A decent, unremarkable aged tequila at a premium price.' },
  { id: '25201', name: 'Cincoro Anejo Tequila Reserva', score: 7.5,
    note: "Cincoro's top-tier reserve anejo, more depth than their standard Anejo." },
  { id: '16958', name: 'Gran Centenario Leyenda', score: 7.5,
    note: "Gran Centenario's premium expression, real depth and complexity beyond their standard line." },
  { id: '23522', name: 'Jose Cuervo Reserva De La Familia Anejo Cristalino', score: 8,
    note: "Cuervo's iconic annual top-shelf release. Genuinely excellent, a world away from their standard bottles." },
  { id: '16957', name: 'Maestro Dobel 50 Cristalino', score: 8,
    note: "A 50th-anniversary ultra-premium release. Well-regarded and refined." },
  { id: '21360', name: 'Patron El Alto', score: 7.5,
    note: "Patron's ultra-premium blend of anejo, extra anejo, and reposado. Rich and well-balanced." },
  { id: '20750', name: 'Tequila Komos Anejo Reserva', score: 8,
    note: 'The top of the Komos anejo line. Excellent, though the ornate bottle carries some of the price.' },
];

let added = 0, skipped = 0;
for (const { id, name, score, note } of additions) {
  if (ratings[id]) { console.log(`SKIP ${id} (${name}) — already rated`); skipped++; continue; }
  ratings[id] = { name, score, note, source: 'draft' };
  added++;
}

writeFileSync('data/ratings.json', JSON.stringify(ratings, null, 2) + '\n');
console.log(`Tequila 60-150: added ${added}, skipped ${skipped}.`);
