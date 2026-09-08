// Rates most of the Japanese whisky category (was 3/34, the thinnest category
// in the app). Skips only the four ultra-luxury bottles ($800-$5,500) that
// aren't realistic shopping decisions for anyone using a price ceiling.
//
// ABC's own "type" field is just "Japanese" for everything here -- not
// meaningful, so an explicit style is set on every entry (per HANDOFF #8),
// unlike Tequila where the type field already does the job.
//
// Run: node scripts/add-ratings-japanese.mjs
// Then rebuild: node scripts/merge-shelf.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const ratings = JSON.parse(readFileSync('data/ratings.json', 'utf8'));

const additions = [
  { id: '19788', name: 'Tenjaku Blended Japanese Whisky', score: 6.5, style: 'blended',
    note: 'An approachable, budget-friendly rice-forward blend. A fair entry point into Japanese whisky.' },
  { id: '24638', name: 'Kaiyo 5 Wood Japanese Whisky', score: 6.5, style: 'blended',
    note: 'Aged across five cask types including mizunara oak. Young but genuinely interesting for the price.' },
  { id: '18125', name: 'Mars Iwai Japanese Whisky', score: 6, style: 'blended',
    note: "Mars Shinshu's entry-level blend. A decent budget option, less refined than the bigger names." },
  { id: '23547', name: 'Suntory Toki Black Japanese Whisky', score: 7, style: 'blended',
    note: 'A smokier, more assertive variant of standard Toki. Worth the small step up if you find Toki thin.' },
  { id: '18403', name: 'Mars Iwai 45 Japanese Blended Whisky', score: 6, style: 'blended',
    note: 'Higher proof than the standard Iwai. More backbone, still an entry-level blend.' },
  { id: '22046', name: 'Hatozaki Finest Blended Whiskey With Glass', score: 7, style: 'blended',
    note: 'A well-regarded budget-premium Japanese blend. Balanced and easy-drinking.' },
  { id: '22654', name: 'Kikori Japanese Whisky', score: 6.5, style: 'grain',
    note: 'Rice whisky rather than malt or grain in the Scotch sense. Smooth and mixable, a different lane entirely.' },
  { id: '17333', name: 'Kaiyo The Single 7 Year Whisky', score: 7.5, style: 'single-malt',
    note: 'Mizunara-cask finished single malt. Distinctive sandalwood-and-coconut character from the Japanese oak.' },
  { id: '19388', name: 'Umiki Japanese Whisky', score: 6, style: 'blended',
    note: 'A budget blend with mixed reception. Fine for the price, not a category standout.' },
  { id: '17334', name: 'Kaiyo Whisky', score: 7, style: 'blended',
    note: "Kaiyo's standard bottling. The mizunara oak character comes through clearly." },
  { id: '17617', name: 'Kavalan Distillery Select Whisky', score: 7.5, style: 'single-malt',
    note: "Taiwanese, not Japanese, despite the shelf placement -- but genuinely excellent. Tropical-climate aging gives it fast, fruit-forward maturity." },
  { id: '22658', name: 'Hatozaki Small Batch Japanese Whisky', score: 7, style: 'blended',
    note: "A step up from Hatozaki's Finest bottle. More balanced and complex." },
  { id: '20372', name: 'Suntory World Whisky Ao', score: 6.5, style: 'world-blend',
    note: 'A blend across five whisky-producing nations -- an interesting concept that is decent rather than exceptional in the glass.' },
  { id: '19679', name: 'Nikka Coffey Malt Japanese Whisky', score: 7.5, style: 'grain',
    note: 'Malted barley run through a Coffey still -- a genuinely distinct texture from a traditional pot-still single malt.' },
  { id: '19385', name: 'Nikka Pure Malt Japanese Whisky', score: 7, style: 'single-malt',
    note: "Nikka's blended-malt bottle, the black-label version. Solid and well-liked." },
  { id: '17303', name: 'Kamiki Blended Japanese Whisky', score: 6.5, style: 'blended',
    note: 'Finished with a touch of sake and umeshu influence. Distinctive, though the flavor is more novelty than classic whisky.' },
  { id: '17335', name: 'Kaiyo Cask Strength Whisky', score: 7.5, style: 'single-malt',
    note: "Kaiyo's mizunara character at full proof. More intense and structured than their standard bottling." },
  { id: '23076', name: 'Yamazaki Distillers Reserve', score: 8, style: 'single-malt',
    note: 'No age statement, but this is the most accessible way onto the legendary Yamazaki name. Genuinely excellent.' },
  { id: '19524', name: "Hatozaki Sm Batch Whisky 12 Yr Umeshu Cask Finish", score: 6.5, style: 'single-malt',
    note: 'Plum-wine cask finish gives it a sweet, unusual profile. A novelty pour more than a classic sipping whisky.' },
  { id: '22653', name: 'Hibiki Harmony Japanese Whisky', score: 8.5, style: 'blended',
    note: 'An iconic, beautifully balanced blend in one of the most recognizable bottles in whisky. Worth it whenever it is not marked up for scarcity.' },
  { id: '19187', name: 'Nikka Miyagikyo Single Malt Whisky', score: 8, style: 'single-malt',
    note: "Nikka's fruitier, more floral single malt (as opposed to Yoichi's smokier profile). Excellent and well-regarded." },
  { id: '19185', name: 'Nikka Yoichi Single Malt Whiskey', score: 8.5, style: 'single-malt',
    note: "Nikka's smokier, coastal single malt. Distinctive and highly regarded among Japanese whisky drinkers." },
  { id: '21144', name: 'Hakushu 12 Year Japanese Whisky', score: 9, style: 'single-malt',
    note: 'Green, forested, and distinctive -- one of the defining Japanese single malts. Superb, and priced accordingly.' },
  { id: '19545', name: 'Suntory Yamazaki 12 Year Japanese Whisky', score: 9, style: 'single-malt',
    note: 'The benchmark Japanese single malt. Consistently excellent, and the price reflects genuine, sustained demand rather than hype.' },
  { id: '21222', name: 'Hibiki Japanese Harmony Whisky 100th Anniversary', score: 8.5, style: 'blended',
    note: 'The same excellent Harmony liquid in commemorative packaging. Buy it for the whisky, not the box.' },
  { id: '24510', name: 'Umiki Godzilla Whisky', score: 5.5, style: 'blended',
    note: 'A novelty collector bottle riding the Godzilla branding. The packaging premium far outweighs what is in the glass.' },
  { id: '20713', name: 'Yamazaki 12 Yr 100th Anniversary Limited Edition', score: 9, style: 'single-malt',
    note: 'Same benchmark Yamazaki 12 Year inside a limited-edition package. Excellent whisky, collector pricing.' },
];

let added = 0, skipped = 0;
for (const { id, name, score, style, note } of additions) {
  if (ratings[id]) { console.log(`SKIP ${id} (${name}) — already rated`); skipped++; continue; }
  ratings[id] = { name, score, style, note, source: 'draft' };
  added++;
}

writeFileSync('data/ratings.json', JSON.stringify(ratings, null, 2) + '\n');
console.log(`Japanese: added ${added}, skipped ${skipped}.`);
