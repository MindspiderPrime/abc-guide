// One-off: add $30+ 750ml ratings for Gin, Bourbon, Rye — the three categories
// that were rated back when this app was scoped to "Best Under $30" and never
// revisited when the price ceiling expanded to $150. See conversation / bug
// report: those three categories had zero rated 750ml bottles above $29.99.
//
// Run once: node scripts/add-ratings-30plus.mjs
// Then rebuild: node scripts/merge-shelf.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const ratings = JSON.parse(readFileSync('data/ratings.json', 'utf8'));

const additions = [
  // ── Gin ────────────────────────────────────────────────────────────────
  { id: '14084', name: 'Roku Gin', score: 7.5, style: 'contemporary',
    note: 'Japanese, six botanicals including sakura and yuzu. Delicate and floral, a real change of pace.' },
  { id: '3393', name: "Hendrick's Gin", score: 8, style: 'contemporary',
    note: 'Cucumber and rose. The gin that convinced a generation gin was not just juniper.' },
  { id: '11480', name: 'Sipsmith Dry London Gin', score: 8, style: 'london-dry',
    note: 'Small-batch, pot-stilled London dry done properly. Excellent balance of juniper and citrus.' },
  { id: '2891', name: 'Tanqueray No. 10', score: 8.5, style: 'contemporary',
    note: "Tanqueray's top shelf, whole fresh citrus in the still. Noticeably better than the standard bottle." },
  { id: '2398', name: 'Plymouth Gin', score: 7.5, style: 'london-dry',
    note: 'Earthier and less juniper-forward than a London dry. Its own protected style, worth trying once.' },
  { id: '16403', name: 'Brockmans Gin', score: 6.5, style: 'contemporary',
    note: 'Blueberry and blackberry up front, juniper way in back. More liqueur than gin to purists.' },
  { id: '7797', name: 'No. 3 London Dry Gin', score: 8, style: 'london-dry',
    note: 'Berry Bros bottling. Six botanicals, nothing wasted, textbook London dry.' },
  { id: '13425', name: 'Gin Mare', score: 7.5, style: 'contemporary',
    note: 'Spanish, arbequina olive and rosemary. Savory rather than sweet — built for a dirty martini.' },
  { id: '18246', name: 'Empress 1908 Gin', score: 7, style: 'contemporary',
    note: 'Butterfly pea flower turns it violet-blue; a splash of tonic turns it pink. Gimmick aside, the juniper holds up.' },
  { id: '15537', name: 'Barr Hill Gin', score: 7, style: 'contemporary',
    note: 'Vermont, raw honey added after distillation. Soft and rounded, unlike anything else on this list.' },
  { id: '20959', name: 'London No. 1 Gin', score: 6.5, style: 'contemporary',
    note: 'The blue bottle gin. Juniper-forward and better than the novelty packaging suggests.' },
  { id: '24297', name: 'Boatyard Gin', score: 6.5, style: 'contemporary',
    note: 'Irish, botanicals foraged from the Erne estuary. Competent, not essential.' },
  { id: '23350', name: 'Opihr Spiced London Dry Gin', score: 7, style: 'london-dry',
    note: 'Cardamom, cubeb pepper, black pepper. Warm and spiced — a good winter gin.' },
  { id: '21064', name: 'Empress 1908 Elderflower Rose Gin', score: 6, style: 'flavored',
    note: 'Empress with elderflower and rose folded in. Pleasant, but a niche pour next to the original.' },
  { id: '16713', name: 'Thomas Dakin Gin', score: 7.5, style: 'london-dry',
    note: 'Manchester dry gin revived from an 1800s recipe. Bergamot and orris root, well balanced.' },
  { id: '16453', name: 'Edinburgh Classic Gin', score: 7, style: 'london-dry',
    note: 'Traditional Scottish dry gin, heather honey among the botanicals. Solid, unshowy.' },
  { id: '15693', name: "Uncle Val's Botanical Gin", score: 6.5, style: 'contemporary',
    note: 'Cucumber and lavender. Nice bottle, nice gin, priced like it knows both.' },
  { id: '16491', name: 'Plymouth Navy Strength Gin', score: 7.5, style: 'navy-strength',
    note: "Plymouth at 57%. More backbone than the standard bottle, still recognizably Plymouth." },
  { id: '11734', name: 'Bluecoat Barrel Finish Gin', score: 7, style: 'barrel-aged',
    note: 'American gin finished in used bourbon barrels. Vanilla and oak layered over juniper — different, and it works.' },
  { id: '24797', name: 'Waterloo Barrel Aged Gin', score: 6.5, style: 'barrel-aged',
    note: 'Texas gin rested in oak. Amber-colored, whiskey-adjacent — a gin for whiskey drinkers.' },
  { id: '16236', name: 'Conniption American Dry Gin', score: 6.5, style: 'contemporary',
    note: 'Durham, NC. Approachable and citrus-forward, a safe crowd-pleaser.' },
  { id: '22417', name: 'Uncle Vals Zested Gin', score: 6, style: 'flavored',
    note: 'Uncle Val\'s with extra citrus zest. Fine in a gin and tonic, unremarkable neat.' },
  { id: '24576', name: 'Atheling Gin', score: 6, style: 'contemporary',
    note: 'Virginia craft gin. Drinkable, not distinctive against the bigger contemporary bottles here.' },
  { id: '12179', name: 'Vitae Spirits Modern Gin', score: 6.5, style: 'contemporary',
    note: 'Charlottesville. A well-made modern gin, worth a look if buying Virginia matters to you.' },
  { id: '17738', name: 'Great Falls Gin', score: 6, style: 'contemporary',
    note: 'Virginia craft gin. Competent and unremarkable — buy it for the Virginia flag, not to seek it out.' },

  // ── Bourbon ────────────────────────────────────────────────────────────
  { id: '1958', name: "Maker's Mark Bourbon", score: 7.5, style: 'wheated',
    note: 'The red wax bottle. Soft, sweet, wheated — reliably good and always in stock.' },
  { id: '3248', name: 'Woodford Reserve Bourbon', score: 7.5, style: 'traditional',
    note: 'The default "nicer" bourbon at a bar. Well balanced, a fair step up from the well pours above.' },
  { id: '21864', name: 'Basil Hayden Bourbon', score: 6.5, style: 'traditional',
    note: 'Light-bodied and low proof for the price. Easy to drink, easy to outgrow.' },
  { id: '5737', name: 'Four Roses Small Batch Bourbon', score: 8, style: 'traditional',
    note: 'Four of the ten Four Roses recipes blended. Fruity and spicy — excellent for the price.' },
  { id: '12327', name: 'Knob Creek Bourbon', score: 8, style: 'traditional',
    note: 'Nine years old, 100 proof, unapologetically oaky. A lot of bourbon for the money.' },
  { id: '454', name: 'Bulleit Bourbon', score: 7, style: 'high-rye',
    note: 'High-rye mashbill, spicier than most bourbons at this price. Reliable well pour.' },
  { id: '15065', name: 'Elijah Craig Small Batch Bourbon', score: 8, style: 'traditional',
    note: 'No age statement now, but the barrel selection is still doing real work. Great value in this tier.' },
  { id: '11904', name: 'Evan Williams Single Barrel Bourbon', score: 8.5, style: 'traditional',
    note: 'Vintage-dated single barrels at a Heaven Hill price. Punches well above its cost.' },
  { id: '22590', name: 'New Riff Bottled In Bond Bourbon', score: 8.5, style: 'bottled-in-bond',
    note: 'High-rye, no chill filtration, bottled in bond. The cult favorite on this list for a reason.' },
  { id: '10608', name: 'Jim Beam Single Barrel Bourbon', score: 7, style: 'traditional',
    note: 'A real step up from standard Beam — single barrel, more character, still a fair price.' },
  { id: '9303', name: "Maker's Mark 46 Bourbon", score: 8, style: 'wheated',
    note: 'Standard Maker\'s finished with seared French oak staves. More vanilla and spice, worth the upgrade.' },
  { id: '16947', name: "Maker's Mark 101", score: 8, style: 'wheated',
    note: '101 proof Maker\'s. Same wheated recipe with more punch and more flavor to back it up.' },
  { id: '11572', name: 'Eagle Rare 10 Year Bourbon', score: 9, style: 'traditional',
    note: 'Ten years old, Buffalo Trace juice, at a price that has not caught up to the rest of that lineup yet. Buy it while that lasts.' },
  { id: '5736', name: 'Four Roses Single Barrel Bourbon', score: 8.5, style: 'traditional',
    note: 'One recipe, one barrel, more intense than the Small Batch. The better bottle if you can spend a bit more.' },
  { id: '18323', name: 'Basil Hayden Toast Bourbon', score: 6.5, style: 'flavored',
    note: 'Finished for extra sweetness. Pleasant dessert pour, not a serious sipping upgrade.' },
  { id: '20480', name: 'Heaven Hill Bottled In Bond Bourbon', score: 8, style: 'bottled-in-bond',
    note: '100 proof, 4 years minimum, government-audited. About as much bourbon as you can buy per dollar.' },
  { id: '20581', name: 'Woodinville Straight Bourbon Whiskey', score: 7.5, style: 'traditional',
    note: 'Washington state, grain grown and distilled on-site. Genuinely well made, not just a marketing story.' },
  { id: '21803', name: 'Ragged Branch Signature Bourbon Bottled In Bond', score: 7.5, style: 'bottled-in-bond',
    note: "Virginia's bottled-in-bond entry. Grain-to-glass, solid, and the Virginia flag is a real bonus here." },
  { id: '22657', name: 'Penelope Wheated Bourbon', score: 7, style: 'wheated',
    note: 'Soft and approachable, sourced juice with Penelope\'s finishing touch. A gentler wheater than Maker\'s.' },
  { id: '19825', name: 'Pinhook Kentucky Straight Bourbon', score: 7, style: 'traditional',
    note: 'Sourced but well chosen and consistently bottled. A safe pick in the thirty-five dollar range.' },
  { id: '17765', name: 'Noble Oak Double Oak Bourbon', score: 6.5, style: 'traditional',
    note: 'Finished in a second, heavily charred barrel. Extra oak, not extra complexity.' },
  { id: '13493', name: '1792 Bottled In Bond Kentucky Straight Bourbon', score: 8, style: 'bottled-in-bond',
    note: '1792\'s high-rye recipe at bottled-in-bond proof. More structure than the flagship Small Batch.' },
  { id: '10844', name: '1792 Sweet Wheat Bourbon', score: 7, style: 'wheated',
    note: 'Wheated variant of 1792. Softer and rounder than the rye-forward flagship.' },
  { id: '20856', name: 'Cutwater Black Skimmer Bourbon', score: 6.5, style: 'traditional',
    note: 'San Diego craft, sourced Midwest juice. Fine, unremarkable, priced like it knows that too.' },
  { id: '21356', name: '10-42: End Of Watch Bourbon Whiskey', score: 6.5, style: 'traditional',
    note: 'Virginia, law-enforcement themed with a charitable angle. Decent bourbon, buy it for the cause as much as the pour.' },

  // ── Rye ────────────────────────────────────────────────────────────────
  { id: '11749', name: 'Bulleit Rye Whiskey', score: 7.5, style: 'high-rye',
    note: '95% rye mashbill, spicy and assertive. The rye equivalent of Bulleit Bourbon — a cocktail workhorse.' },
  { id: '7911', name: "Jefferson's Rye", score: 7, style: 'kentucky-rye',
    note: 'Canadian-sourced, blended for smoothness rather than rye spice. Approachable if Bulleit is too sharp.' },
  { id: '22120', name: 'Sagamore Small Batch Rye Whiskey', score: 7.5, style: 'kentucky-rye',
    note: 'Maryland-style, a blend of high- and low-rye mashbills. Well regarded, balanced spice.' },
  { id: '13598', name: 'Woodford Reserve Kentucky Straight Rye Whiskey', score: 7.5, style: 'kentucky-rye',
    note: 'Woodford\'s rye, same polish as the bourbon. Softer spice than Bulleit, more finish.' },
  { id: '7660', name: 'Knob Creek Rye', score: 8, style: 'kentucky-rye',
    note: '100 proof, same house style as Knob Creek Bourbon. Bold and a genuine step up in this price range.' },
  { id: '22628', name: 'New Riff Bottled In Bond Rye', score: 8.5, style: 'bottled-in-bond',
    note: 'Same distillery, same integrity as their bourbon. One of the best ryes on the shelf at any price.' },
  { id: '20583', name: 'Woodinville Straight Rye Whiskey', score: 8, style: 'high-rye',
    note: '100% rye mashbill, grain-to-glass in Washington. Big, spicy, well made.' },
  { id: '12712', name: '1792 High Rye Whiskey', score: 7, style: 'high-rye',
    note: 'Higher rye content than the flagship 1792, filed here for the mashbill. Spicier, still recognizably 1792.' },
  { id: '13552', name: "Russell's Reserve Rye", score: 8, style: 'kentucky-rye',
    note: 'Six years old, Wild Turkey pedigree. Well-aged rye at a price that undercuts most of this list.' },
  { id: '21863', name: 'Basil Hayden Dark Rye', score: 6.5, style: 'kentucky-rye',
    note: 'Blended with port and California red wine. Sweet and polarizing rather than a straight rye.' },
  { id: '24220', name: 'Basil Hayden Golden Rye', score: 6.5, style: 'kentucky-rye',
    note: 'Finished with a touch of corn whiskey for sweetness. Same polarizing sweetness as Dark Rye.' },
  { id: '15938', name: 'Rabbit Hole Heigold High Rye', score: 7.5, style: 'high-rye',
    note: 'Louisville craft, high-rye mashbill. More refined than most in this price band.' },
  { id: '20032', name: 'Uncle Nearest Straight Rye Whiskey', score: 7.5, style: 'kentucky-rye',
    note: 'From the team that built Uncle Nearest 1856. Well-made, well-reviewed, worth the price.' },
  { id: '21102', name: 'Bardstown Bourbon Company Origin Series - Rye', score: 7.5, style: 'kentucky-rye',
    note: "Bardstown's house style applied to rye. Solid, consistent, a fair every-day pour." },
  { id: '9845', name: "Michter's Us1 Single Barrel Straight Rye", score: 8.5, style: 'kentucky-rye',
    note: 'Michter\'s reliable single-barrel program, applied to rye. Smooth for a rye at this proof.' },
  { id: '19400', name: 'Whistlepig 6 Year Piggyback Rye Whiskey', score: 8, style: 'high-rye',
    note: '100% rye, Vermont-finished. Younger and cheaper than the 10 Year, most of the character intact.' },
  { id: '19374', name: 'Pikesville 110 Proof Rye Whiskey', score: 8.5, style: 'kentucky-rye',
    note: 'Maryland-style, bottled at 110 proof. A cult favorite that still shows up on shelves at a fair price.' },
  { id: '10455', name: 'High West Whiskey Rendezvous Rye', score: 8, style: 'kentucky-rye',
    note: 'A blend of two straight ryes, one young and spicy, one older and rounder. Well-balanced, well-regarded.' },
  { id: '19543', name: 'Wild Turkey Rare Breed Rye', score: 8.5, style: 'barrel-proof',
    note: 'Barrel-proof, no two batches identical. Excellent value for cask-strength rye.' },
  { id: '15135', name: 'Catoctin Creek Roundstone Rye Whisky', score: 7, style: 'kentucky-rye',
    note: 'Virginia, 100% rye and organic. Smoother than the mashbill suggests — a genuine local standout.' },
];

let added = 0;
let skipped = 0;
for (const { id, name, score, style, note } of additions) {
  if (ratings[id]) {
    console.log(`SKIP ${id} (${name}) — already rated`);
    skipped++;
    continue;
  }
  ratings[id] = { name, score, style, note, source: 'draft' };
  added++;
}

writeFileSync('data/ratings.json', JSON.stringify(ratings, null, 2) + '\n');
console.log(`Added ${added}, skipped ${skipped} (already present).`);
