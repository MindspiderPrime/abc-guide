// Expands Bourbon coverage in its biggest remaining bucket, $30-60 (was
// 291 unrated 750ml bottles there -- by far the largest gap left in the
// category). Picks distinct, recognizable bottles rather than every
// private-barrel variant of the same base line (many Four Roses OB--
// recipes, Oak & Eden finishes, Rebel picks, etc. are functionally
// duplicates of one already-rated sibling).
//
// Run: node scripts/add-ratings-bourbon-expand.mjs
// Then rebuild: node scripts/merge-shelf.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const ratings = JSON.parse(readFileSync('data/ratings.json', 'utf8'));

const additions = [
  { id: '21653', name: 'Weller Reserve Single Barrel Select', score: 7.5, style: 'wheated',
    note: 'A single-barrel pick of the Weller Special Reserve recipe. Reliable wheated character.' },
  { id: '12307', name: "Clyde May's Straight Bourbon", score: 6.5, style: 'traditional',
    note: 'Alabama-style, finished with a touch of apple brandy influence. Distinctive among the mass Kentucky brands.' },
  { id: '17430', name: 'Redemption Bourbon', score: 6.5, style: 'traditional',
    note: 'Sourced MGP juice, a fair everyday bottle at this price.' },
  { id: '17322', name: 'Redemption High Rye Bourbon', score: 6.5, style: 'high-rye',
    note: 'Same sourced base as standard Redemption with more rye spice.' },
  { id: '15287', name: 'Ragged Branch Straight Bourbon Wheated', score: 7, style: 'wheated',
    note: "Virginia's own wheated bourbon. Grain-to-glass and well-made." },
  { id: '18325', name: 'Reverend Spirits Bourbon', score: 6.5, style: 'traditional',
    note: 'Virginia craft bourbon, solid and unremarkable.' },
  { id: '19521', name: 'Tarnished Truth Discretion St Bourbon Whiskey', score: 6.5, style: 'traditional',
    note: 'A Virginia Beach craft distillery. Competent, worth trying for the local angle.' },
  { id: '23966', name: 'Chattanooga Whiskey 91', score: 6.5, style: 'traditional',
    note: 'A high-malt-content mashbill gives it a distinct grainy sweetness from standard bourbon.' },
  { id: '18470', name: 'Brothers Bond Straight Bourbon Whiskey', score: 6.5, style: 'traditional',
    note: 'Actors Ian Somerhalder and Paul Wesley\'s brand. Genuinely decent, not just a celebrity label.' },
  { id: '19572', name: 'High West Bourbon', score: 7, style: 'traditional',
    note: 'A sourced blend, but High West\'s blending skill shows -- well-balanced and reliable.' },
  { id: '15359', name: 'Wild Turkey Longbranch Small Batch Bourbon', score: 7, style: 'traditional',
    note: "Matthew McConaughey's collaboration, charcoal-mellowed Texas style. Smoother than standard Wild Turkey 101." },
  { id: '17821', name: 'Wyoming Whiskey Small Batch', score: 7, style: 'traditional',
    note: 'Grain-to-glass craft bourbon from Wyoming. Well-regarded among craft distillery fans.' },
  { id: '17437', name: 'Smooth Ambler Contradiction Bourbon', score: 7, style: 'traditional',
    note: 'A blend of their own distillate with sourced juice. Well-balanced and consistently good.' },
  { id: '22937', name: 'Jeffersons Bourbon', score: 7, style: 'traditional',
    note: "Jefferson's flagship small-batch blend. A reliable, well-regarded everyday bourbon." },
  { id: '20709', name: 'Remus Straight Bourbon Whiskey', score: 6.5, style: 'traditional',
    note: "MGP's own-label bourbon, named for Prohibition-era bootlegger George Remus. Solid and fairly priced." },
  { id: '21634', name: 'Templeton Bourbon Whiskey', score: 6.5, style: 'traditional',
    note: "Templeton's bourbon entry, better known for their rye. Fine, unremarkable." },
  { id: '248', name: "Baker's Bourbon", score: 7.5, style: 'barrel-proof',
    note: "Part of the Beam small-batch collection alongside Booker's and Basil Hayden. Higher proof, well-regarded." },
  { id: '21121', name: 'Bardstown Bourbon Company Origin Series - Bourbon', score: 7, style: 'traditional',
    note: 'A well-regarded newer Kentucky distillery. Their own-distilled juice, solid quality.' },
  { id: '16725', name: 'Elijah Craig Toasted Barrel', score: 7, style: 'traditional',
    note: 'Finished in an extra-toasted barrel for more vanilla and caramel. A fair step up from the standard Small Batch.' },
  { id: '13557', name: "Russell's Reserve 10 Year Bourbon", score: 8, style: 'traditional',
    note: "Wild Turkey's premium age-stated line. Well-aged and consistently excellent for the price." },
  { id: '15312', name: "Stranahan's Colorado Whiskey", score: 7, style: 'traditional',
    note: 'Technically a single malt rather than a bourbon mashbill, but well-regarded Colorado craft whiskey.' },
  { id: '20127', name: 'Whistlepig Piggyback Bourbon', score: 7, style: 'traditional',
    note: "Whistlepig's bourbon line, less famous than their rye but solidly made." },
  { id: '22983', name: 'Wild Turkey 101 8 Year Old Bourbon', score: 8, style: 'traditional',
    note: 'An age-stated version of the reliable Wild Turkey 101. More depth for a modest premium.' },
  { id: '20897', name: 'Woodinville Port Finished Bourbon Whiskey', score: 7.5, style: 'traditional',
    note: 'Port-cask finish adds real fruit complexity to Woodinville\'s already well-regarded base bourbon.' },
  { id: '9846', name: 'Michter\'s Us1 Small Batch Bourbon', score: 8, style: 'traditional',
    note: "Michter's well-regarded small batch. Consistently smooth and well-reviewed." },
  { id: '10072', name: "Maker's Mark Cask Strength", score: 8, style: 'wheated',
    note: 'Maker\'s at full barrel proof. More intensity than the standard bottle without losing the wheated character.' },
  { id: '15586', name: 'Uncle Nearest 1884 Small Batch Whiskey', score: 7.5, style: 'traditional',
    note: 'Honors Nathan "Nearest" Green, the formerly enslaved man who taught Jack Daniel to distill. Genuinely well-made.' },
  { id: '15519', name: '1792 Full Proof Bourbon', score: 8, style: 'barrel-proof',
    note: 'Bottled at barrel-entry proof. A genuine step up in intensity from the standard 1792 Small Batch.' },
  { id: '11748', name: 'Bulleit 10 Year Bourbon', score: 7.5, style: 'traditional',
    note: 'More age and depth than standard Bulleit, at a fair premium for it.' },
  { id: '21648', name: 'Eagle Rare Single Barrel Select', score: 8.5, style: 'traditional',
    note: 'A single-store pick of the excellent Eagle Rare 10 Year. Consistently one of the better values on any shelf.' },
  { id: '22864', name: 'Four Roses Single Barrel Bourbon Obsf', score: 8, style: 'traditional',
    note: 'One of Four Roses\' ten recipes, bottled single-barrel. More intense than the standard Single Barrel blend.' },
  { id: '15354', name: 'Weller 12 Year Wheated Bourbon', score: 8.5, style: 'wheated',
    note: 'A genuinely sought-after wheated bourbon. Rich and well-aged, worth it whenever found near shelf price.' },
  { id: '19397', name: 'Wild Turkey Rare Breed Bourbon', score: 8.5, style: 'barrel-proof',
    note: 'Barrel-proof, batch-varying. A long-standing favorite among cask-strength bourbon drinkers.' },
  { id: '15469', name: '1792 Aged 12 Year Bourbon', score: 7.5, style: 'traditional',
    note: 'More age than the flagship Small Batch, a genuine step up in depth.' },
  { id: '22775', name: 'Bulleit Bourbon Bottled In Bond', score: 7.5, style: 'bottled-in-bond',
    note: "Bulleit's bottled-in-bond entry. More structure and proof than the standard bottle." },
  { id: '18324', name: 'Four Roses Small Batch Select Bourbon', score: 8, style: 'traditional',
    note: 'A higher-proof, more intense version of the standard Small Batch blend. A genuine step up.' },
  { id: '16032', name: 'E H Taylor Jr. Small Batch Whiskey', score: 8.5, style: 'traditional',
    note: 'Part of the well-regarded Taylor line. Consistently excellent.' },
  { id: '15860', name: 'Uncle Nearest 1856 Aged Premium Whiskey', score: 7.5, style: 'traditional',
    note: "Uncle Nearest's flagship expression. Well-reviewed and historically significant." },
  { id: '15699', name: 'Old Weller Antique 107 Bourbon', score: 8.5, style: 'wheated',
    note: 'A genuinely sought-after wheated bourbon at 107 proof. One of the best values in the Weller line when found at shelf price.' },
  { id: '15702', name: 'Woodford Reserve Double Oaked Bourbon', score: 7.5, style: 'traditional',
    note: 'Finished in a second, freshly-charred barrel. Richer and sweeter than standard Woodford Reserve.' },
  { id: '6965', name: 'Knob Creek Single Barrel Reserve', score: 8, style: 'barrel-proof',
    note: 'Higher proof, single-barrel Knob Creek. More intensity than the standard bottle for a fair premium.' },
  { id: '11988', name: "Jefferson's Reserve Bourbon", score: 7, style: 'traditional',
    note: "Jefferson's step up from their flagship blend. Solid, unremarkable at this price." },
];

let added = 0, skipped = 0;
for (const { id, name, score, style, note } of additions) {
  if (ratings[id]) { console.log(`SKIP ${id} (${name}) — already rated`); skipped++; continue; }
  ratings[id] = { name, score, style, note, source: 'draft' };
  added++;
}

writeFileSync('data/ratings.json', JSON.stringify(ratings, null, 2) + '\n');
console.log(`Bourbon expand: added ${added}, skipped ${skipped}.`);
