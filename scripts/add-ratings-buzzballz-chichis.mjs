// Completes BuzzBallz and Chi-Chi's coverage in Cocktails -- the two brands
// the earlier representative pass deliberately sampled rather than rated in
// full (see add-ratings-cocktails.mjs). Same style vocabulary as that pass:
// margarita/martini/tropical/other.
//
// Run: node scripts/add-ratings-buzzballz-chichis.mjs
// Then rebuild: node scripts/merge-shelf.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const ratings = JSON.parse(readFileSync('data/ratings.json', 'utf8'));

const additions = [
  // ── BuzzBallz ──
  { id: '24286', name: 'Buzzballz Americana Variety Pack', score: 4.5, style: 'other',
    note: 'A mixed pack of the standard flavors in patriotic packaging. Same value tier as any individual ball.' },
  { id: '24107', name: 'Buzzballz Berry Cherry Limeade Cocktail 4 Pack', score: 4.5, style: 'other',
    note: 'The can 4-pack version of their berry cherry limeade ball. Same sweet, potent formula, more convenient format.' },
  { id: '23429', name: 'Buzzballz Biggies Peppermint Bark', score: 4.5, style: 'other',
    note: 'A large-format holiday flavor. Genuinely tastes like peppermint bark, sweet enough for dessert.' },
  { id: '23369', name: 'Buzzballz Biggies Witchs Potion', score: 4.5, style: 'other',
    note: 'A Halloween large-format flavor, fruity and brightly colored. Novelty over nuance, as always with this line.' },
  { id: '24739', name: 'Buzzballz Boulders Strawberry Rita', score: 4.5, style: 'margarita',
    note: 'The big-format jug version of their Strawberry Rita ball. Same flavor, built for a crowd.' },
  { id: '24316', name: 'Buzzballz Caipi Crush Vodka Cocktail', score: 4.5, style: 'tropical',
    note: 'A mini-can take on a caipirinha. Sweeter and less lime-forward than the real thing, but cheap and potent.' },
  { id: '21933', name: 'Buzzballz Chili Mango Cocktail', score: 4.5, style: 'other',
    note: 'One of the more distinctive flavors in the lineup -- real chili heat behind the mango sweetness.' },
  { id: '21940', name: 'Buzzballz Choc Tease Cocktail', score: 4.5, style: 'other',
    note: 'Chocolate-cream flavor, dessert-like rather than a classic cocktail.' },
  { id: '24268', name: 'Buzzballz Cocktail Bent Banana', score: 4, style: 'other',
    note: 'Straightforward banana candy flavor, one of the simpler entries in the lineup.' },
  { id: '24257', name: 'Buzzballz Cocktail Evergreen Variety Pack', score: 4.5, style: 'other',
    note: 'A holiday-season mixed pack. Same value tier as any individual flavor, just bundled.' },
  { id: '24883', name: 'Buzzballz Cocktail Frosted Smores', score: 4.5, style: 'other',
    note: 'Genuinely tastes like the campfire treat. A sweet dessert ball rather than a cocktail.' },
  { id: '24269', name: 'Buzzballz Cocktail Tropical Fruit Punch', score: 4.5, style: 'tropical',
    note: 'A fruit-punch flavor built for a cookout. Does the job.' },
  { id: '24684', name: 'Buzzballz Cocktail Tropical Tang', score: 4.5, style: 'tropical',
    note: 'Tart tropical citrus, one of the brighter-tasting flavors in the lineup.' },
  { id: '25034', name: 'Buzzballz Cocktail Vampires Blood', score: 4.5, style: 'other',
    note: 'A Halloween red-fruit-punch flavor. Novelty branding, standard BuzzBallz sweetness underneath.' },
  { id: '23374', name: 'Buzzballz Cocktails Cookie Nookie', score: 4.5, style: 'other',
    note: 'Cookies-and-cream flavor, a dessert ball rather than a mixed drink.' },
  { id: '23375', name: 'Buzzballz Cocktails Eggnog', score: 4.5, style: 'other',
    note: 'A seasonal eggnog ball. Sweet and rich, fine for a holiday party.' },
  { id: '24882', name: 'Buzzballz Cocktails Frosted Brown Sugar Cinnamon', score: 4.5, style: 'other',
    note: 'A holiday-spice flavor, cinnamon-forward and sweet.' },
  { id: '24579', name: 'Buzzballz Cocktails Fuzzy Melon', score: 4, style: 'other',
    note: 'A basic melon flavor, unremarkable even by BuzzBallz standards.' },
  { id: '23518', name: 'Buzzballz Cocktails Grapes Gone Wild', score: 4, style: 'other',
    note: 'Candy grape flavor, straightforward and sweet.' },
  { id: '24578', name: 'Buzzballz Cocktails Hole In Fun', score: 4, style: 'other',
    note: 'A donut-themed dessert flavor. Novelty first, cocktail second.' },
  { id: '24580', name: 'Buzzballz Cocktails Paddle Punch', score: 4.5, style: 'other',
    note: 'A fruit-punch flavor in the same lane as their Tropical Fruit Punch ball.' },
  { id: '24884', name: 'Buzzballz Cocktails Sugarplum', score: 4.5, style: 'other',
    note: 'A holiday-season fruit flavor, sweet and seasonal.' },
  { id: '21936', name: 'Buzzballz Cran Blaster Cocktail', score: 4.5, style: 'other',
    note: 'Tart cranberry, one of the less cloying flavors in the lineup.' },
  { id: '23513', name: 'Buzzballz Elf Maple Syrup Sundae', score: 4.5, style: 'other',
    note: 'A holiday dessert flavor -- maple and cream, sweet as the name suggests.' },
  { id: '24313', name: 'Buzzballz Flags & Freedom Vodka Cocktail', score: 4, style: 'other',
    note: 'A patriotic-themed mini can, basic fruit-punch flavor.' },
  { id: '21937', name: 'Buzzballz Forbidden Apple Cocktail', score: 4.5, style: 'other',
    note: 'Candy apple flavor, straightforward and sweet.' },
  { id: '24903', name: 'Buzzballz Frankentini', score: 4.5, style: 'martini',
    note: 'A Halloween-themed martini-style ball. Sweeter and less complex than a real martini, as expected.' },
  { id: '24311', name: 'Buzzballz Fuego Tamarita Vodka Cocktail', score: 4, style: 'margarita',
    note: 'A spicy tamarind-margarita mini can. More novelty than a serious margarita.' },
  { id: '24309', name: 'Buzzballz Goaaaaaal-melon Vodka Cocktail', score: 4, style: 'other',
    note: 'A soccer-themed melon mini. Basic flavor, marketing-driven naming.' },
  { id: '22110', name: 'Buzzballz Hazelnut Latte Cocktail', score: 4.5, style: 'other',
    note: 'A coffee-and-cream flavor, sweeter than a real latte but pleasant as a dessert ball.' },
  { id: '23269', name: 'Buzzballz Lemon Tea Cocktail', score: 4.5, style: 'other',
    note: 'An Arnold Palmer-adjacent flavor, refreshing by BuzzBallz standards.' },
  { id: '23270', name: 'Buzzballz Passionfruit Martini Cocktail', score: 4.5, style: 'martini',
    note: 'A fruity martini-style ball, sweet and tropical rather than a classic martini profile.' },
  { id: '21941', name: 'Buzzballz Peachballz Cocktail', score: 4.5, style: 'other',
    note: 'Straightforward peach flavor, one of the more popular flavors in the lineup.' },
  { id: '21986', name: 'Buzzballz Pineapple Jalapeno Cocktail', score: 4.5, style: 'other',
    note: 'Real heat behind the pineapple sweetness -- one of the more distinctive flavors here.' },
  { id: '23763', name: 'Buzzballz Pink Lemonsqueezy', score: 4.5, style: 'other',
    note: 'Pink lemonade flavor, tart and sweet in the usual BuzzBallz proportion.' },
  { id: '24312', name: 'Buzzballz Pip Pip Punch Vodka Cocktail', score: 4, style: 'other',
    note: 'A British-themed mini punch flavor. Basic fruit sweetness under the novelty name.' },
  { id: '22422', name: 'Buzzballz Pumpkin Cocktail', score: 4.5, style: 'other',
    note: 'Seasonal pumpkin spice, sweet and appropriately autumnal.' },
  { id: '24315', name: 'Buzzballz Smashentina Vodka Cocktail', score: 4, style: 'other',
    note: 'A fruity mini can with a playful name. Standard sweetness, nothing distinctive.' },
  { id: '24314', name: 'Buzzballz Sol Siesta Vodka Cocktail', score: 4, style: 'tropical',
    note: 'A tropical-themed mini can, sweet and simple.' },
  { id: '23271', name: 'Buzzballz Strawberry Rita Americana', score: 4.5, style: 'margarita',
    note: 'Patriotic packaging on their reliable Strawberry Rita flavor.' },
  { id: '24317', name: 'Buzzballz Tropical Fruit Punch Beach Ball Cocktail', score: 4.5, style: 'tropical',
    note: 'A large-format beach-themed tropical punch. Same formula, bigger bottle.' },
  { id: '24737', name: 'Buzzballz Variety Tailgate Pack', score: 4.5, style: 'other',
    note: 'A mixed pack aimed at tailgating. Same value tier as any individual ball, bundled for a crowd.' },
  { id: '21943', name: 'Buzzballz Watermelon Smash Cocktail', score: 4.5, style: 'other',
    note: 'Candy watermelon flavor, consistent with the rest of the fruit-forward lineup.' },

  // ── Chi-Chi's ──
  { id: '20303', name: 'Chi Chis Margarita 4 Pack', score: 4, style: 'margarita',
    note: 'The canned 4-pack version of their standard margarita. Same budget-jug flavor, more portable format.' },
  { id: '20304', name: 'Chi Chis Pina Colada', score: 4, style: 'tropical',
    note: 'A bottom-shelf canned pina colada. Sweet and coconut-forward, functional for a poolside drink.' },
  { id: '20305', name: 'Chi Chis Pineapple Margarita', score: 4, style: 'margarita',
    note: 'Tropical fruit variant on their standard margarita jug. Same budget tier.' },
  { id: '20306', name: 'Chi Chis Pink Lemonade Margarita', score: 4, style: 'margarita',
    note: 'Tastes more like spiked pink lemonade than a real margarita, same as the rest of the Chi-Chi\'s line.' },
  { id: '20310', name: 'Chi Chis Ruby Red Margarita', score: 4, style: 'margarita',
    note: 'Grapefruit-tinted variant on the standard formula. Cheap and functional for a crowd.' },
];

let added = 0, skipped = 0;
for (const { id, name, score, style, note } of additions) {
  if (ratings[id]) { console.log(`SKIP ${id} (${name}) — already rated`); skipped++; continue; }
  ratings[id] = { name, score, style, note, source: 'draft' };
  added++;
}

writeFileSync('data/ratings.json', JSON.stringify(ratings, null, 2) + '\n');
console.log(`BuzzBallz/Chi-Chi's: added ${added}, skipped ${skipped}.`);
