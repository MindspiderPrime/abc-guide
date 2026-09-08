// Adds a batch to Cordials (was 94/742, one of the thinnest well-shopped
// categories). Style mirrors ABC's own "type" field the way earlier cordial
// ratings already do (herbal/fruit/honey/nut/floral/cream/coffee/other),
// adding "chocolate" and "egg-nog" where the existing vocabulary had no
// precedent yet for those types.
//
// Run: node scripts/add-ratings-cordials.mjs
// Then rebuild: node scripts/merge-shelf.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const ratings = JSON.parse(readFileSync('data/ratings.json', 'utf8'));

const additions = [
  // ── Cream liqueurs ──
  { id: '15130', name: 'Carolans Irish Cream', score: 6.5, style: 'cream',
    note: 'The value alternative to Baileys. Slightly thinner, but a fair stand-in at a lower price.' },
  { id: '15311', name: "Saint Brendan's Superior Irish Cream", score: 6.5, style: 'cream',
    note: 'A solid, unpretentious Irish cream. Comparable to Carolans in the same price tier.' },
  { id: '23384', name: "St. Brendans Espresso Irish Cream", score: 6.5, style: 'cream',
    note: 'Coffee-forward twist on their standard cream. Works well over ice or in coffee.' },
  { id: '23386', name: "St. Brendans Salted Caramel Irish Cream", score: 6, style: 'cream',
    note: 'Sweet and dessert-like, a fine seasonal pour.' },
  { id: '15265', name: "Carolan's Salted Caramel", score: 6, style: 'cream',
    note: 'Similar tier to their standard Irish Cream with a caramel twist.' },
  { id: '21950', name: 'Carolans Peanut Butter', score: 5.5, style: 'cream',
    note: 'A novelty flavor that mostly delivers on the concept -- sweet and rich.' },
  { id: '24806', name: 'Carolans Strawberries & Cream Irish Cream', score: 5.5, style: 'cream',
    note: 'Fruity twist on their standard formula, pleasant but not distinctive.' },
  { id: '23510', name: 'Ryans Salted Caramel Irish Cream', score: 6, style: 'cream',
    note: "Ryan's budget-tier cream with a caramel flavor. Fine for the price." },
  { id: '2581', name: "Ryan's Cream", score: 5.5, style: 'cream',
    note: 'A bottom-shelf Irish cream. Thin compared to Carolans, but cheap.' },
  { id: '12534', name: 'Blue Chair Bay Banana Rum Cream', score: 6.5, style: 'cream',
    note: "Kenny Chesney's rum cream line. Genuinely good banana flavor, a step up from the bargain creams." },
  { id: '12535', name: 'Blue Chair Bay Key Lime Rum Cream', score: 6.5, style: 'cream',
    note: 'Tart-and-sweet key lime, one of the better flavored rum creams available.' },
  { id: '19865', name: 'Blue Chair Bay Mocha Rum Cream', score: 6, style: 'cream',
    note: 'Coffee-forward, smooth. Consistent quality with the rest of the Blue Chair Bay line.' },
  { id: '12685', name: 'Ezra Brooks Bourbon Cream', score: 6, style: 'cream',
    note: 'A real bourbon base gives this more character than most flavored cream liqueurs.' },
  { id: '22311', name: '1792 Barton Chocolate Bourbon Ball Cream Liqueur', score: 6.5, style: 'cream',
    note: 'A genuine bourbon behind the chocolate-cream flavor. Tastes like the candy, in a good way.' },
  { id: '21245', name: 'Ole Smoky Bourbon Ball Cream', score: 6, style: 'cream',
    note: 'Similar concept to the 1792 version, sweeter and less bourbon-forward.' },
  { id: '23415', name: 'Rebel Butter Pecan Cream Liquer', score: 5.5, style: 'cream',
    note: 'Sweet and nutty, a fair dessert liqueur.' },
  { id: '23911', name: 'Mozart Strawberry Cream Liqueur', score: 6, style: 'cream',
    note: "From the Mozart chocolate liqueur house. Well-made, genuinely tastes like strawberries and cream." },
  { id: '9583', name: 'Tippy Cow Orange Cream Rum', score: 5.5, style: 'cream',
    note: 'Creamsicle flavor on a rum cream base. Sweet and easy.' },
  { id: '9584', name: 'Tippy Cow Vanilla Soft Serve Rum', score: 5.5, style: 'cream',
    note: 'Tastes like soft-serve ice cream, as advertised. A dessert pour.' },
  { id: '23247', name: 'Kahlua Dunkin Caramel Swirl Cream', score: 6, style: 'cream',
    note: 'A Dunkin\' collaboration -- coffee and caramel, sweet and easy-drinking.' },
  { id: '8741', name: 'Mary Hite Bowman Caramel Cream', score: 6, style: 'cream',
    note: 'A Virginia-made caramel cream liqueur. Smooth and well-balanced.' },
  { id: '7876', name: 'Pennsylvania Dutch Pumpkin Cream Liqueur', score: 5.5, style: 'cream',
    note: 'Seasonal pumpkin spice cream, sweet and appropriately autumnal.' },
  { id: '22115', name: 'Pennsylvania Dutch Salted Caramel Cream', score: 5.5, style: 'cream',
    note: 'A budget-tier salted caramel cream, fine for the price.' },
  { id: '16581', name: 'Praline Pecan Liqueur', score: 6, style: 'nut',
    note: 'Genuinely tastes like pralines. A good after-dinner sipper or coffee addition.' },
  { id: '11676', name: 'Di Amore Amaretto', score: 6, style: 'nut',
    note: 'A reliable, mid-tier amaretto. Almond-forward without being cloying.' },

  // ── Coffee liqueurs ──
  { id: '1760', name: 'Kamora Coffee', score: 5.5, style: 'coffee',
    note: 'A budget Kahlua alternative. Thinner but does the job in a White Russian.' },
  { id: '15219', name: 'Kapali De Cafe Coffee Liqueur', score: 5, style: 'coffee',
    note: 'Bottom-shelf coffee liqueur. Fine as a mixer, not much else.' },
  { id: '4189', name: "Trader Vic's Kona Coffee Liqueur", score: 6, style: 'coffee',
    note: 'Real Kona coffee character, a step up from the mass-market coffee liqueurs.' },
  { id: '10277', name: 'Grind Espresso Shot', score: 6, style: 'coffee',
    note: 'A genuine espresso-forward shot, less sweet than Kahlua. Good for an espresso martini.' },
  { id: '18786', name: 'Flor De Cana Spresso', score: 6, style: 'coffee',
    note: "Rum-based coffee liqueur from Flor de Cana. Distinct from the vodka-based competitors." },
  { id: '22140', name: 'Kahlua Chocolate Sips', score: 5.5, style: 'chocolate',
    note: "Kahlua's chocolate variant. Sweet and dessert-like, less versatile than the original." },
  { id: '22141', name: 'Kahlua White Chocolate Sips', score: 5.5, style: 'coffee',
    note: 'White chocolate and coffee combination, sweeter than standard Kahlua.' },

  // ── Fruit / citrus liqueurs ──
  { id: '4069', name: 'PAMA Pomegranate', score: 6.5, style: 'fruit',
    note: 'Real pomegranate character, tart rather than syrupy. Versatile in cocktails.' },
  { id: '76', name: 'Alize Red Passion', score: 5.5, style: 'fruit',
    note: 'Cognac and passion fruit. Sweet, nostalgic for anyone who remembers its 90s/2000s heyday.' },
  { id: '15073', name: 'Alize Gold Passion', score: 5.5, style: 'fruit',
    note: 'Vodka-based passion fruit variant, similar sweetness to Red Passion.' },
  { id: '12242', name: 'Alize Peach', score: 5, style: 'fruit',
    note: 'Peach variant on the Alize formula, consistent sweetness with the line.' },
  { id: '1982', name: 'Marie Brizard Apry', score: 6, style: 'fruit',
    note: 'Apricot liqueur from a respected French house. Real fruit character, useful in classic cocktails.' },
  { id: '4026', name: 'Marie Brizard Blackberry Liqueur', score: 6, style: 'fruit',
    note: 'Solid blackberry flavor, a step up from the domestic mass brands.' },
  { id: '15845', name: 'Marie Brizard Peach Liqueur', score: 6, style: 'fruit',
    note: 'A well-made peach liqueur, useful in classic cocktails calling for creme de peche.' },
  { id: '1986', name: 'Marie Brizard Parfait Amour', score: 5.5, style: 'fruit',
    note: 'A floral, violet-tinged curacao variant. More of a novelty than a workhorse liqueur.' },
  { id: '4025', name: 'Marie Brizard Triple Sec', score: 6.5, style: 'fruit',
    note: 'A genuinely good triple sec, a real step up from Bols or Arrow for margaritas and sidecars.' },
  { id: '9445', name: 'Gran Gala Triple Orange', score: 6.5, style: 'fruit',
    note: 'A cognac-based orange liqueur, richer than a standard triple sec.' },
  { id: '19010', name: 'Citronge Orange', score: 6, style: 'fruit',
    note: 'A solid, mid-tier orange liqueur -- a fair Cointreau alternative for mixing.' },
  { id: '7761', name: 'Pallini Limoncello', score: 7, style: 'fruit',
    note: 'One of the better widely-available limoncellos. Bright, real lemon character.' },
  { id: '4137', name: 'Pallini Peachcello Liqueur', score: 6.5, style: 'fruit',
    note: 'The Pallini formula applied to peach. Well-made, less iconic than their limoncello.' },
  { id: '4136', name: 'Pallini Raspicello Liqueur', score: 6.5, style: 'fruit',
    note: 'Raspberry variant, consistent with the quality of their limoncello.' },
  { id: '15178', name: 'Fabrizia Limoncello', score: 6.5, style: 'fruit',
    note: 'A solid limoncello, less well-known than Pallini but comparable quality.' },
  { id: '6864', name: 'IL Tramonto Limoncello', score: 6, style: 'fruit',
    note: 'A fair mid-tier limoncello. Bright but less complex than the Pallini or Fabrizia versions.' },
  { id: '16376', name: 'Trial & Error Limoncello', score: 6, style: 'fruit',
    note: 'A decent limoncello from a smaller producer. Fine for the price.' },
  { id: '4664', name: 'X-Rated Fusion', score: 5.5, style: 'fruit',
    note: 'Vodka, mango, and passion fruit. Sweet, built for shots and mixed drinks.' },
  { id: '15615', name: 'Kinky Blue Liqueur', score: 5, style: 'fruit',
    note: 'A tropical, brightly-colored party liqueur. Sweet and simple.' },
  { id: '15616', name: 'Kinky Pink Liqueur', score: 5, style: 'fruit',
    note: 'Similar tier to Kinky Blue -- built for shots more than sipping.' },
  { id: '13816', name: 'Fiorente Italian Elderflower Liqueur', score: 6.5, style: 'floral',
    note: 'A fair St-Germain alternative at a lower price. Real elderflower character.' },
  { id: '8419', name: 'St. Elder Natural Elderflower Liqueur', score: 6.5, style: 'floral',
    note: 'Comparable to Fiorente -- a genuinely good, affordable elderflower liqueur.' },
  { id: '21362', name: 'St. Elder Blood Orange Liqueur', score: 6, style: 'fruit',
    note: "St. Elder's citrus variant, bright and well-balanced." },

  // ── Herbal / anise / amaro ──
  { id: '9443', name: 'Basilica Sambuca', score: 6, style: 'herbal',
    note: 'A solid, mid-tier sambuca. Sweet anise, works well over espresso beans.' },
  { id: '2088', name: 'Metaxa Ouzo', score: 6, style: 'herbal',
    note: 'A reliable Greek ouzo, anise-forward and traditional.' },
  { id: '6165', name: 'Mekhong Spirit Of Thailand', score: 5.5, style: 'herbal',
    note: 'A rice-and-sugarcane Thai spirit, herbal and unusual for a domestic shelf. Interesting more than essential.' },
  { id: '24307', name: 'Jagermeister Orange', score: 5.5, style: 'herbal',
    note: 'Standard Jager with orange citrus added. A shot-bar variant more than a sipper.' },
  { id: '15741', name: 'Jagermeister Cold Brew Coffee', score: 6, style: 'herbal',
    note: 'Coffee and the classic 56-herb Jager blend. More interesting than the fruit variants.' },
  { id: '16744', name: 'Don Ciccio Figli Amaro Delle Sirene', score: 6.5, style: 'herbal',
    note: 'A genuine Italian amaro, bittersweet and complex. Worth trying if you only know Fernet or Campari.' },
  { id: '24466', name: 'Apervita Aperitivio', score: 6, style: 'fruit',
    note: 'A lighter, sweeter aperitivo-style liqueur, easy to mix into a spritz.' },

  // ── Chocolate ──
  { id: '19973', name: 'Chocolat Deluxe Triple Chocolate Liqueur', score: 6, style: 'chocolate',
    note: 'Rich and genuinely chocolatey. A dessert liqueur, not built for mixing.' },
  { id: '17583', name: 'Marie Brizard Creme De Cacao Blanc', score: 6.5, style: 'chocolate',
    note: 'A well-made clear creme de cacao, the standard for a Grasshopper or Brandy Alexander.' },
  { id: '147', name: 'Arrow Creme De Cacao Brown', score: 5, style: 'chocolate',
    note: 'A budget creme de cacao. Thinner than Marie Brizard, but functional in a mixed drink.' },
  { id: '148', name: 'Arrow Creme De Cacao White', score: 5, style: 'chocolate',
    note: 'Same budget tier as the brown version, clear rather than colored.' },

  // ── Egg nog (seasonal, one real standout) ──
  { id: '3365', name: 'Evan Williams Egg Nog', score: 6.5, style: 'egg-nog',
    note: 'A genuine bourbon-based egg nog rather than a neutral-spirit one. The best-known name in the category for a reason.' },
];

let added = 0, skipped = 0;
for (const { id, name, score, style, note } of additions) {
  if (ratings[id]) { console.log(`SKIP ${id} (${name}) — already rated`); skipped++; continue; }
  ratings[id] = { name, score, style, note, source: 'draft' };
  added++;
}

writeFileSync('data/ratings.json', JSON.stringify(ratings, null, 2) + '\n');
console.log(`Cordials: added ${added}, skipped ${skipped}.`);
