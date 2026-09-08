// Continues Bourbon into the $60-100 bucket (still 203 unrated after the
// original $60-100 gap fill only covered 30 of them). Picks distinct,
// recognizable bottles, skipping the dozens of near-duplicate private-barrel
// variants of an already-rated base (Penelope, Oak & Eden, Thomas S. Moore,
// Yellowstone, Filibuster, Redwood Empire, River City, Buzzards Roost each
// have several functionally-identical finishes here).
//
// Run: node scripts/add-ratings-bourbon-60-100-2.mjs
// Then rebuild: node scripts/merge-shelf.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const ratings = JSON.parse(readFileSync('data/ratings.json', 'utf8'));

const additions = [
  { id: '19061', name: 'Wild Turkey Kentucky Spirit ( Barrel Program )', score: 8, style: 'traditional',
    note: 'A single-store pick of the well-regarded Kentucky Spirit program. Consistently excellent.' },
  { id: '23639', name: 'Angels Envy Cask Strength Bottled In Bond', score: 8.5, style: 'barrel-proof',
    note: "Angel's Envy at full barrel-entry proof, bottled in bond. More intensity than their standard finished bourbons." },
  { id: '16823', name: "Maker's Mark 46 Cask Strength", score: 8, style: 'wheated',
    note: 'The French-oak-finished 46 recipe at cask strength. More depth and intensity than the standard 46.' },
  { id: '25085', name: 'Willett Pot Still Reserve Cask Strength', score: 8, style: 'barrel-proof',
    note: "Willett's distinctive pot-still character at full proof. Well-regarded among collectors." },
  { id: '24058', name: 'Woodford Reserve Personal Selection (bo)', score: 7.5, style: 'traditional',
    note: "A single-store pick of Woodford Reserve. Reliable, well-balanced." },
  { id: '19631', name: 'Few Bottled In Bond Single Barrel Whiskey', score: 7, style: 'bottled-in-bond',
    note: 'A well-regarded Illinois craft distillery\'s bottled-in-bond single barrel.' },
  { id: '22215', name: 'Bakers High Rye Bourbon', score: 7.5, style: 'high-rye',
    note: 'Part of the Beam small-batch collection, higher rye content than standard Baker\'s.' },
  { id: '22430', name: 'Chicken Cock Small Batch Bourbon', score: 6.5, style: 'traditional',
    note: 'A revived historic brand, solid and unremarkable.' },
  { id: '12492', name: "Jefferson's Reserve Pritchard Hill Bourbon", score: 7, style: 'traditional',
    note: 'Finished in wine casks from the Pritchard Hill vineyard. A distinctive, fruit-forward twist.' },
  { id: '23596', name: 'New Riff 8 Year Old Bourbon', score: 8, style: 'traditional',
    note: 'A well-regarded craft distillery\'s aged expression. Consistently strong.' },
  { id: '16366', name: 'Old Ezra Brooks 7 Year Barrel Strength', score: 7.5, style: 'barrel-proof',
    note: 'A well-aged, full-proof value bourbon. Consistently good.' },
  { id: '22269', name: 'Pinhook True Small Batch Bourbon', score: 7, style: 'traditional',
    note: "Pinhook's flagship small batch, well-chosen sourced juice." },
  { id: '21651', name: 'Stagg Single Barrel Select', score: 8.5, style: 'barrel-proof',
    note: 'A single-barrel pick of the cult-favorite Stagg. Intense and excellent.' },
  { id: '21652', name: 'Weller Full Proof Single Barrel Select', score: 8, style: 'wheated',
    note: 'A single-barrel pick of the well-regarded Weller Full Proof. Consistently excellent.' },
  { id: '21303', name: 'Woodinville Straight Bourbon Single Barrel Program', score: 8, style: 'traditional',
    note: "A single-barrel pick of Woodinville's already well-regarded bourbon." },
  { id: '20314', name: 'Wyoming Whiskey Double Cask', score: 7, style: 'traditional',
    note: 'A finished variant of the well-regarded Wyoming Whiskey base. Solid.' },
  { id: '21649', name: 'Eh Taylor Jr. Single Barrel Select', score: 8.5, style: 'traditional',
    note: 'Part of the well-regarded Taylor lineup. Consistently excellent single-barrel picks.' },
  { id: '20739', name: 'Elijah Craig Private Barrel - Barrel Proof Bourbon', score: 8.5, style: 'barrel-proof',
    note: "A single-store pick of Elijah Craig's cult barrel-proof program. Consistently excellent." },
  { id: '15940', name: 'Rabbit Hole Dareringer Px Sherry Cask', score: 8, style: 'traditional',
    note: 'PX sherry-cask finish gives it real richness. A well-regarded Louisville craft release.' },
  { id: '22977', name: 'Whistlepig 10 Year Snout To Tail Bourbon', score: 7.5, style: 'traditional',
    note: "Whistlepig's bourbon-focused release, less famous than their rye but well made." },
  { id: '21186', name: 'Noahs Mill Straight Bourbon', score: 7.5, style: 'barrel-proof',
    note: 'A Willett-owned, high-proof sourced bourbon. Well-regarded among value cask-strength drinkers.' },
  { id: '19557', name: 'Angels Envy Private Selection Sgl Barrel Bourbon', score: 8, style: 'traditional',
    note: "A single-barrel pick of Angel's Envy's port-finished flagship. Consistently rich and well-made." },
  { id: '16362', name: 'Barrell Bourbon Dovetail Whiskey', score: 7.5, style: 'traditional',
    note: 'A well-regarded independent blender, sourcing and finishing distinctive whiskeys.' },
  { id: '21712', name: 'Old Charter Oak French Oak', score: 7, style: 'traditional',
    note: "Buffalo Trace's experimental wood-type series. Interesting for the different oak character alone." },
  { id: '23136', name: 'Old Ezra 7yr Single Barrel Straight Bourbon', score: 7.5, style: 'traditional',
    note: 'A well-aged single barrel, consistent with the reliable Old Ezra line.' },
  { id: '24618', name: 'Willett Family Estate 4 Year Small Batch Bourbon', score: 8, style: 'traditional',
    note: "Willett's distinctive pot-still character, well-regarded among collectors despite the young age." },
  { id: '18582', name: 'Garrison Brothers Texas Honeydew Straight Bourbon', score: 7, style: 'flavored',
    note: 'Honey-finished Texas bourbon, sweet and distinctive from the hot-climate base.' },
  { id: '15914', name: 'Horse Soldier Barrel Strength Bourbon', score: 7, style: 'barrel-proof',
    note: "Horse Soldier's full-proof expression, more intensity than their standard bottles." },
  { id: '24952', name: 'Knob Creek 12 Year Cask Strength', score: 8.5, style: 'barrel-proof',
    note: 'Full barrel proof on the well-aged 12 Year. A genuine step up in intensity.' },
  { id: '21646', name: 'Blantons Sazerac Barrel Select', score: 9, style: 'traditional',
    note: "A single-barrel Blanton's pick. Excellent whenever found near a fair price." },
  { id: '24904', name: 'Elmer T Lee Single Barrel Select', score: 8.5, style: 'traditional',
    note: 'A single-store pick of the classic Elmer T. Lee. Consistently excellent.' },
  { id: '17902', name: 'I W Harper 15 Year Bourbon', score: 8, style: 'traditional',
    note: 'A revived historic brand with a genuine 15-year age statement. Well-aged and well-regarded.' },
  { id: '16122', name: 'Jefferson\'s Ocean Aged At Sea Cask Strength', score: 8, style: 'traditional',
    note: 'The aged-at-sea gimmick at full barrel proof. More intensity than the standard Ocean bottle.' },
  { id: '20251', name: 'Peerless Double Oak Straight Bourbon Whiskey', score: 8, style: 'traditional',
    note: 'A well-regarded Louisville craft distillery, double-oaked for extra depth.' },
  { id: '24446', name: 'Rebel 10 Year Single Barrel', score: 7.5, style: 'traditional',
    note: "A genuine age-stated step up from Rebel's usual younger expressions." },
  { id: '23693', name: 'Woodford Reserve Double Oaked Barrel Proofbtb( Bo)', score: 8, style: 'barrel-proof',
    note: 'The well-regarded Double Oaked recipe at full barrel proof. More intensity and richness.' },
  { id: '20146', name: 'Calumet Farm 10 Yr Bourbon', score: 6.5, style: 'traditional',
    note: 'A revived historic Kentucky brand, decent but unremarkable at this price.' },
  { id: '19595', name: 'Redemption Straight Bourbon Cognac Cask Finish', score: 6.5, style: 'flavored',
    note: 'Cognac-cask finish adds fruit and floral notes to the sourced Redemption base.' },
  { id: '16646', name: 'Laws Whiskey House Straight Bourbon', score: 7.5, style: 'traditional',
    note: 'A well-regarded Colorado craft distillery, grain-to-glass and well-made.' },
  { id: '20438', name: 'Brothers Bond Cask Strength Whiskey', score: 7, style: 'barrel-proof',
    note: 'Full-proof version of the actors\' Brothers Bond bourbon. More intensity than the standard bottle.' },
  { id: '23635', name: 'Sam Houston Small Batch Reserve Bourbon', score: 6.5, style: 'traditional',
    note: 'A decent, unremarkable Texas-branded bourbon.' },
  { id: '24845', name: 'Frey Ranch Single Barrel Straight Bourbon', score: 7.5, style: 'traditional',
    note: 'A well-regarded Nevada grain-to-glass distillery, single-barrel expression.' },
  { id: '19872', name: 'Filibuster Triple Cask Bourbon', score: 7, style: 'traditional',
    note: "Virginia's Filibuster distillery, triple-cask blending for extra complexity." },
  { id: '22111', name: 'Barrell Bourbon Batch 36 Cask Strength', score: 7.5, style: 'barrel-proof',
    note: 'A well-regarded independent blender\'s cask-strength batch release.' },
];

let added = 0, skipped = 0;
for (const { id, name, score, style, note } of additions) {
  if (ratings[id]) { console.log(`SKIP ${id} (${name}) — already rated`); skipped++; continue; }
  ratings[id] = { name, score, style, note, source: 'draft' };
  added++;
}

writeFileSync('data/ratings.json', JSON.stringify(ratings, null, 2) + '\n');
console.log(`Bourbon 60-100 round 2: added ${added}, skipped ${skipped}.`);
