// Rates most of the Irish whiskey category up to $150 (was 17/105). Skips
// the ultra-luxury tail above that (Redbreast 18/21/27, Bushmills 21, Red
// Spot, etc.) as not realistic shopping decisions for a price-ceiling tool.
//
// ABC's own "type" field is just "Irish" for everything -- not meaningful,
// so an explicit style is introduced here (no prior precedent in this file):
// blended / single-malt / single-pot-still / single-grain / cask-finish.
//
// Run: node scripts/add-ratings-irish.mjs
// Then rebuild: node scripts/merge-shelf.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const ratings = JSON.parse(readFileSync('data/ratings.json', 'utf8'));

const additions = [
  { id: '20316', name: 'The Busker Triple Cask Irish Whiskey', score: 6.5, style: 'blended',
    note: 'A well-priced, approachable blend. A fair everyday Irish whiskey.' },
  { id: '8851', name: '2 Gingers Irish Whiskey', score: 6, style: 'blended',
    note: 'Straightforward and easy-drinking, a fine mixer or shot.' },
  { id: '15273', name: "Paddy's Old Irish Whiskey", score: 6, style: 'blended',
    note: 'Light and easy, one of the older Irish whiskey brands still on the shelf.' },
  { id: '20202', name: 'Proper No. Twelve Irish Apple', score: 5.5, style: 'blended',
    note: "Conor McGregor's brand, apple-flavored variant. Sweet and simple." },
  { id: '10851', name: 'Hell Cat Maggie Irish Whiskey', score: 6, style: 'blended',
    note: 'A decent budget-tier blend, unremarkable but fine for mixing.' },
  { id: '11757', name: 'Bushmills Irish Whiskey', score: 7, style: 'blended',
    note: "The standard Bushmills blend. Light, honeyed, a reliable everyday Irish whiskey." },
  { id: '18563', name: 'Jameson Orange', score: 5.5, style: 'blended',
    note: 'A flavored twist on the world\'s best-known Irish whiskey. Fine, not essential.' },
  { id: '12325', name: 'Kilbeggan Irish Whiskey', score: 6.5, style: 'blended',
    note: "A genuinely solid budget blend from Ireland's oldest licensed distillery." },
  { id: '16171', name: 'Jameson Cold Brew', score: 5.5, style: 'blended',
    note: 'Coffee-infused Jameson. Sweet and easy, works well in a cocktail.' },
  { id: '21374', name: 'Tullamore Dew Irish Whiskey - Honey', score: 6, style: 'blended',
    note: 'A honeyed variant on the standard Tullamore Dew. Sweet and approachable.' },
  { id: '19544', name: 'Bushmills Peaky Blinders Irish Whiskey', score: 6.5, style: 'blended',
    note: 'A TV tie-in bottling of standard-tier Bushmills. Decent whiskey riding a licensing deal.' },
  { id: '22563', name: 'Jameson Triple Triple', score: 6.5, style: 'blended',
    note: 'Triple distilled, triple cask matured -- a genuine step up from standard Jameson.' },
  { id: '20950', name: 'Powers Rye Irish Whiskey', score: 7, style: 'single-pot-still',
    note: 'A rye-heavy pot-still whiskey, spicier and more distinctive than a standard blend.' },
  { id: '17416', name: 'Roe And Co Irish Whiskey', score: 6.5, style: 'blended',
    note: "Diageo's modern Irish blend. Well-made and approachable, from the old Guinness distillery site." },
  { id: '10999', name: 'The Quiet Man Traditional Irish Whiskey', score: 6.5, style: 'blended',
    note: 'A solid, traditional-style blend. Unremarkable but competent.' },
  { id: '13083', name: 'Jameson Caskmates Ipa Irish Whiskey', score: 6.5, style: 'cask-finish',
    note: 'Finished in IPA beer casks -- a genuinely distinctive, hoppy twist on standard Jameson.' },
  { id: '17320', name: 'Jameson Caskmates Stout Irish Whiskey', score: 7, style: 'cask-finish',
    note: 'Finished in stout casks, richer and more distinctive than the IPA version.' },
  { id: '9190', name: 'Teeling Small Batch Irish Whiskey', score: 7.5, style: 'blended',
    note: 'Rum-cask finished, one of the best-regarded modern Irish blends. Distinctive and well-balanced.' },
  { id: '20022', name: 'The Sexton Irish Whiskey', score: 6.5, style: 'single-malt',
    note: 'Sherry-cask matured single malt, smooth and approachable.' },
  { id: '11984', name: 'Jameson Black Barrel Irish Whiskey', score: 7.5, style: 'blended',
    note: "Jameson's premium small-batch expression. Richer and more complex than the standard bottle." },
  { id: '13017', name: "Writers' Tears Copper Pot Irish Whiskey", score: 7.5, style: 'single-pot-still',
    note: 'A blend of pot-still and single malt whiskeys. Well-regarded and distinctive.' },
  { id: '23794', name: 'Mcconnells Sherry Cask Finished Irish Whiskey', score: 6.5, style: 'cask-finish',
    note: "A revived historic Belfast brand. Solid sherry-finished blend." },
  { id: '19392', name: 'Knappogue Castle 12 Year Single Malt Irish Whiskey', score: 7.5, style: 'single-malt',
    note: 'A genuinely well-aged single malt at a fair price for the category.' },
  { id: '16433', name: 'Powers Three Swallow Irish Whiskey', score: 7, style: 'single-pot-still',
    note: 'Powers\' entry-level pot-still expression. Spicy and characterful.' },
  { id: '16093', name: 'The Dead Rabbit Irish Whiskey', score: 7, style: 'blended',
    note: 'A blend created with the acclaimed NYC bar of the same name. Well-balanced and cocktail-friendly.' },
  { id: '13494', name: 'Bushmills 10 Year Irish Malt Whiskey', score: 7.5, style: 'single-malt',
    note: "Bushmills' entry-level age-stated single malt. A genuine step up from the standard blend." },
  { id: '19391', name: 'The Irishman Single Malt Irish Whiskey', score: 7, style: 'single-malt',
    note: 'A solid, well-reviewed single malt from a smaller Irish producer.' },
  { id: '19394', name: 'Bushmills 12 Year Single Malt Irish Whiskey', score: 8, style: 'single-malt',
    note: 'More sherry-cask depth than the 10 Year. One of the better values in aged Irish single malt.' },
  { id: '17541', name: 'Connemara Peated Irish Whiskey', score: 7.5, style: 'single-malt',
    note: 'A rare peated Irish whiskey -- genuinely distinctive if you like Scotch but want something different.' },
  { id: '17412', name: 'Drumshanbo Single Pot Still Irish Whiskey', score: 7.5, style: 'single-pot-still',
    note: 'From the Gunpowder Gin distillery. Well-regarded, spicy pot-still character.' },
  { id: '19390', name: 'Tullamore Dew 12 Irish Whiskey', score: 7.5, style: 'blended',
    note: "Tullamore Dew's aged premium expression. More depth and complexity than the standard bottle." },
  { id: '20854', name: 'Writers Tears Red Head', score: 7.5, style: 'single-pot-still',
    note: 'Sherry-cask matured, richer and fruitier than the standard Copper Pot.' },
  { id: '20915', name: 'J J Corry The Gael Irish Whiskey', score: 7, style: 'blended',
    note: 'An independent bottler blend, well-regarded among Irish whiskey enthusiasts.' },
  { id: '24172', name: 'Redbreast Lustau Edition Irish Whiskey', score: 8.5, style: 'single-pot-still',
    note: 'Redbreast finished in genuine Lustau sherry casks. One of the best pot-still whiskeys available at any price.' },
  { id: '22805', name: 'Teeling Single Malt Irish Whiskey Tequila Cask', score: 7, style: 'single-malt',
    note: 'An unusual tequila-cask finish on a well-regarded single malt base. Distinctive.' },
];

let added = 0, skipped = 0;
for (const { id, name, score, style, note } of additions) {
  if (ratings[id]) { console.log(`SKIP ${id} (${name}) — already rated`); skipped++; continue; }
  ratings[id] = { name, score, style, note, source: 'draft' };
  added++;
}

writeFileSync('data/ratings.json', JSON.stringify(ratings, null, 2) + '\n');
console.log(`Irish: added ${added}, skipped ${skipped}.`);
