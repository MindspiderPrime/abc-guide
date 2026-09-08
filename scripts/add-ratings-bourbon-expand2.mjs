// Second Bourbon expansion pass, continuing through the $30-60 bucket
// (still 249 unrated after the first expansion pass) plus more of $60-100.
// Same approach: distinct, recognizable bottles, skipping near-duplicate
// private-barrel/finish variants of an already-rated base line.
//
// Run: node scripts/add-ratings-bourbon-expand2.mjs
// Then rebuild: node scripts/merge-shelf.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const ratings = JSON.parse(readFileSync('data/ratings.json', 'utf8'));

const additions = [
  // ── $30-60 ──
  { id: '21647', name: 'Buffalo Trace Bourbon Sazerac Barrel Select', score: 7.5, style: 'traditional',
    note: 'A single-barrel pick of the reliable Buffalo Trace flagship. Consistently good.' },
  { id: '21643', name: '1792 Small Batch Sazerac Barrel Select', score: 7.5, style: 'traditional',
    note: 'A single-barrel pick of the well-liked 1792 Small Batch. More variation and character than the standard blend.' },
  { id: '21691', name: 'Ezra Brooks Port Cask Finish', score: 6.5, style: 'flavored',
    note: 'Real port-cask fruitiness on the reliable Ezra Brooks base.' },
  { id: '12334', name: 'Knob Creek Smoked Maple Bourbon', score: 6.5, style: 'flavored',
    note: 'Maple sweetness with a smoked edge -- a distinctive twist on standard Knob Creek.' },
  { id: '19647', name: 'Ragged Branch Wheated Bourbon Bib', score: 7, style: 'wheated',
    note: "Virginia's bottled-in-bond wheated bourbon. Well-made, grain-to-glass." },
  { id: '15314', name: 'Tarnished Truth High Rye Bourbon', score: 6.5, style: 'high-rye',
    note: 'Virginia craft, spicier than a standard bourbon from the high rye content.' },
  { id: '23153', name: '1792 Cognac Cask Finish', score: 7, style: 'flavored',
    note: 'Cognac-cask finish adds real fruit and floral notes to the 1792 base.' },
  { id: '20928', name: 'Solera Style Whiskey', score: 6, style: 'traditional',
    note: 'Aged using a fractional solera blending system, distinctive from a standard single-batch bourbon.' },
  { id: '21425', name: '2xo American Oak Bourbon', score: 6.5, style: 'traditional',
    note: 'A solid, unremarkable American oak-matured bourbon.' },
  { id: '24383', name: 'Hirsch Bourbon The Single Barrel White Whiskey', score: 6.5, style: 'traditional',
    note: 'The historic Hirsch name revived. Decent, if trading partly on the legacy.' },
  { id: '18909', name: 'Stellum Black Bourbon', score: 7, style: 'barrel-proof',
    note: 'A well-regarded independent blender\'s higher-proof line. More intensity than their standard Bourbon.' },
  { id: '24044', name: 'Evan Williams Single Barrel America 250 Comm. Ed.', score: 8, style: 'traditional',
    note: 'The same excellent Evan Williams Single Barrel program in commemorative packaging.' },
  { id: '21640', name: '1792 Bottle In Bond Sazerac Barrel Select', score: 7.5, style: 'bottled-in-bond',
    note: 'A single-barrel pick of the well-regarded 1792 bottled-in-bond expression.' },
  { id: '22286', name: 'Frey Ranch Straight Bourbon Whiskey', score: 7, style: 'traditional',
    note: 'Nevada grain-to-glass craft bourbon. Well-regarded among craft distillery enthusiasts.' },
  { id: '15521', name: '1792 Single Barrel Bourbon', score: 7.5, style: 'traditional',
    note: 'More intensity and variation than the flagship Small Batch, from a single barrel.' },
  { id: '20738', name: 'Ezra Brooks Distillers Collection Bourbon', score: 6.5, style: 'traditional',
    note: "Ezra Brooks' step-up line, a fair improvement over their standard bottle." },
  { id: '12285', name: 'Old Forester 1897 Craft Bourbon', score: 7.5, style: 'bottled-in-bond',
    note: "Part of Old Forester's Whiskey Row historic series, bottled in bond at a higher proof than their standard line." },
  { id: '14564', name: 'Legent', score: 7.5, style: 'traditional',
    note: 'A Jim Beam and Suntory collaboration, finished in wine and sherry casks. Distinctive and well-regarded.' },
  { id: '22471', name: 'Pendleton 1910 Bourbon', score: 6.5, style: 'traditional',
    note: "The Canadian whisky brand's bourbon entry. Decent, unremarkable." },
  { id: '21131', name: 'Yellowstone Special Finishes - Toasted Bourbon', score: 6.5, style: 'flavored',
    note: 'An extra-toasted barrel finish on the reliable Yellowstone base.' },
  { id: '21693', name: 'Yellowstone Special Finishes Rum Cask', score: 6.5, style: 'flavored',
    note: 'Rum-cask finish adds real sweetness and fruit character to standard Yellowstone.' },
  { id: '23959', name: 'Tincup 10 Year Old Bourbon', score: 7, style: 'traditional',
    note: "Tincup's aged expression, more depth than their standard blend." },
  { id: '20776', name: 'Bib & Tucker Double Char Bourbon', score: 7, style: 'traditional',
    note: 'Twice-charred barrel for extra caramelization -- a fair step up in richness.' },
  { id: '15593', name: 'Horse Soldier Straight Bourbon', score: 6.5, style: 'traditional',
    note: "Horse Soldier's bourbon-specific line, similar tier to their Small Batch." },
  { id: '24190', name: 'Whiskey Row Bottled In Bond Bourbon', score: 6.5, style: 'bottled-in-bond',
    note: 'A fair, unremarkable bottled-in-bond bourbon.' },
  { id: '20722', name: 'Kentucky Vintage Straight Bourbon', score: 6.5, style: 'traditional',
    note: 'A Willett-owned sourced brand, solid and dependable for the price.' },
  { id: '11679', name: "Angel's Envy Port Barrel Bourbon", score: 8, style: 'traditional',
    note: "Angel's Envy's original, well-regarded flagship -- finished in port casks for real fruit depth." },
  { id: '18278', name: 'Balcones Brimstone', score: 7, style: 'flavored',
    note: 'Texas craft bourbon smoked over Texas scrub oak. Genuinely distinctive, unlike anything else on this shelf.' },
  { id: '19110', name: 'Basil Hayden Subtle Smoke Bourbon', score: 6.5, style: 'flavored',
    note: 'A mesquite-finished twist on Basil Hayden. Lightly smoky, still easy-drinking.' },
  { id: '17287', name: 'Blackened Whiskey', score: 7, style: 'traditional',
    note: "Metallica's whiskey brand, finished in wine casks. Genuinely well-made beyond the band tie-in." },
  { id: '13094', name: 'Blade And Bow Bourbon', score: 7, style: 'traditional',
    note: 'Ties back to the old Stitzel-Weller lineage via a solera system. Well-regarded and distinctive.' },
  { id: '9323', name: 'Breckenridge Bourbon', score: 7, style: 'traditional',
    note: 'A well-regarded Colorado craft bourbon, high-elevation aging gives it a distinctive character.' },
  { id: '13184', name: 'Few Bourbon Whiskey', score: 7, style: 'traditional',
    note: 'A well-regarded Illinois craft distillery. Solid, characterful bourbon.' },
  { id: '22865', name: 'Four Roses Single Barrel Bourbon Oesk', score: 8, style: 'traditional',
    note: 'Another of Four Roses\' ten distinct recipes, single-barrel bottled. Consistently excellent.' },
  { id: '23055', name: 'New Riff Single Barrel Bourbon', score: 8, style: 'traditional',
    note: 'A well-regarded craft distillery\'s single-barrel bourbon. Consistently strong.' },
  { id: '19229', name: 'Wilderness Trail Bib Small Batch Wheated Bourbon', score: 7.5, style: 'wheated',
    note: 'A well-regarded craft wheated bourbon, bottled in bond.' },
  { id: '21188', name: 'Pure Kentucky X. O. Straight Bourbon', score: 7, style: 'traditional',
    note: 'A Willett-owned sourced brand, higher proof and well-regarded for the price.' },
  { id: '20902', name: 'Clyde Mays Single Barrel 5 Year Old Bourbon', score: 7, style: 'traditional',
    note: "Clyde May's aged single-barrel expression, more depth than the standard bottle." },
  { id: '12284', name: 'Old Forester 1920 Craft Bourbon', score: 8, style: 'barrel-proof',
    note: "Part of Old Forester's historic Whiskey Row series, bottled at barrel-entry proof. Rich and intense." },
  { id: '24688', name: 'Rabbit Hole Cavehill Four Grain', score: 7.5, style: 'traditional',
    note: 'A well-regarded Louisville craft distillery, four-grain mashbill gives it real complexity.' },
  { id: '21189', name: "Rowans Creek Straight Bourbon", score: 7, style: 'traditional',
    note: 'A Willett-owned sourced brand, higher proof and well-regarded among value bourbon drinkers.' },

  // ── $60-100 ──
  { id: '19050', name: 'George Dickel Single Barrel 9yr', score: 7.5, style: 'traditional',
    note: "Tennessee whiskey, charcoal-mellowed. Dickel's single-barrel program is well-regarded, distinct from Kentucky bourbon." },
  { id: '17134', name: 'Bulleit Bourbon Single Barrel', score: 7.5, style: 'traditional',
    note: 'More variation and intensity than standard Bulleit, from a single barrel.' },
  { id: '16367', name: 'Larceny Barrel Proof', score: 8.5, style: 'wheated',
    note: 'A cult favorite among wheated bourbon drinkers -- full barrel proof, genuine intensity.' },
  { id: '17049', name: 'Weller Single Barrel', score: 8, style: 'wheated',
    note: 'A single-barrel pick of the well-regarded Weller line. Consistently excellent.' },
  { id: '21536', name: 'Knob Creek Bourbon Single Barrel', score: 8, style: 'barrel-proof',
    note: 'Single-barrel Knob Creek at a higher proof. A genuine step up from the standard 9 Year.' },
];

let added = 0, skipped = 0;
for (const { id, name, score, style, note } of additions) {
  if (ratings[id]) { console.log(`SKIP ${id} (${name}) — already rated`); skipped++; continue; }
  ratings[id] = { name, score, style, note, source: 'draft' };
  added++;
}

writeFileSync('data/ratings.json', JSON.stringify(ratings, null, 2) + '\n');
console.log(`Bourbon expand 2: added ${added}, skipped ${skipped}.`);
