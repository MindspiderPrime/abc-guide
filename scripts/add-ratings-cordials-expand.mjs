// Expands Cordials coverage, closing most of the remaining under-$30 gap
// (188 unrated bottles -- the largest hole left in this category). Picks
// the recognizable brands and skips the most obscure duplicate flavor
// variants (e.g. rating 2 of 5 JF Haden fruit liqueurs, 2 of 4 Rothman &
// Winter Orchard flavors, rather than every one).
//
// Run: node scripts/add-ratings-cordials-expand.mjs
// Then rebuild: node scripts/merge-shelf.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const ratings = JSON.parse(readFileSync('data/ratings.json', 'utf8'));

const additions = [
  // ── Egg nog ──
  { id: '3482', name: 'Christian Brothers Holiday Nog', score: 5.5, style: 'egg-nog',
    note: 'A brandy-based egg nog, richer than the neutral-spirit versions.' },
  { id: '21047', name: 'Old Cavalier Bourbon Egg Nog', score: 6, style: 'egg-nog',
    note: 'A genuine bourbon base makes this one of the better pre-mixed egg nogs available.' },

  // ── Fruit / citrus ──
  { id: '1423', name: 'Hiram Walker Orange Curacao', score: 5, style: 'fruit',
    note: 'A real curacao-style orange liqueur, useful in classic cocktails calling for it.' },
  { id: '6323', name: 'Stirrings Triple Sec Liqueur', score: 5, style: 'fruit',
    note: 'A decent, mid-tier triple sec, better than the bottom-shelf brands.' },
  { id: '2334', name: 'Passoa', style: 'fruit', score: 6,
    note: 'A well-known European passion fruit liqueur, genuinely fruity rather than syrupy.' },
  { id: '12731', name: 'Tuaca Liquore Originale', score: 6, style: 'fruit',
    note: 'An Italian vanilla-and-citrus liqueur, distinctive and versatile in cocktails.' },
  { id: '7044', name: 'Agavero Orange', score: 6, style: 'fruit',
    note: 'A tequila-based orange liqueur, more agave character than a standard triple sec.' },
  { id: '4918', name: 'Berentzen Pear Liqueur', score: 6, style: 'fruit',
    note: 'A German pear liqueur with genuine fruit character rather than candy sweetness.' },
  { id: '14928', name: 'Mathilde Framboise Liqueur', score: 6.5, style: 'fruit',
    note: 'A well-regarded French raspberry liqueur, real fruit intensity.' },
  { id: '16545', name: 'Mathilde Peach Liqueur', score: 6.5, style: 'fruit',
    note: 'Same quality tier as their Framboise -- genuine peach character.' },
  { id: '3316', name: 'Hpnotiq Liqueur', score: 5.5, style: 'fruit',
    note: 'The iconic bright-blue tropical liqueur from the 2000s. Sweet and nostalgic more than sophisticated.' },
  { id: '16496', name: 'Rothman & Winter Orchard Apricot Liqueur', score: 6.5, style: 'fruit',
    note: 'A well-regarded craft fruit liqueur line -- real apricot character.' },
  { id: '16498', name: 'Rothman & Winter Orchard Peach Liqueur', score: 6.5, style: 'fruit',
    note: 'Same quality as their Apricot -- genuine, well-balanced peach flavor.' },
  { id: '1903', name: 'Licor 43', score: 6.5, style: 'fruit',
    note: 'A well-known Spanish vanilla-citrus liqueur, versatile in cocktails and good on its own over ice.' },
  { id: '18753', name: 'Chinola Passion Fruit Liqueur', score: 6.5, style: 'fruit',
    note: 'Real passion fruit intensity, a well-regarded step up from Passoa.' },
  { id: '16537', name: 'Combier Liqueur De Banane', score: 6.5, style: 'fruit',
    note: 'A respected French liqueur house, genuine banana character rather than artificial sweetness.' },
  { id: '15238', name: 'Gioia Luisa Limoncello', score: 6, style: 'fruit',
    note: 'A solid, mid-tier limoncello -- bright lemon, less refined than Pallini.' },
  { id: '9122', name: 'Luxardo Cherry Sangue Morlacco Liqueur', score: 7, style: 'fruit',
    note: 'From the maker of the legendary maraschino cherries. Rich, real cherry intensity.' },
  { id: '23777', name: "Jf Hadens Key Lime Pie Liqueur", score: 5.5, style: 'fruit',
    note: 'A dessert-flavored liqueur, tastes convincingly like the pie.' },
  { id: '4501', name: 'Soho Lychee', score: 5.5, style: 'fruit',
    note: 'A fair lychee liqueur, floral and sweet.' },

  // ── Herbal / amaro ──
  { id: '6325', name: 'Stirrings Ginger Liqueur', score: 5.5, style: 'herbal',
    note: 'Real ginger bite, useful for a Moscow Mule or Dark and Stormy.' },
  { id: '1981', name: 'Marie Brizard Anisette', score: 6, style: 'herbal',
    note: 'A genuine French anisette from a respected house, better than the domestic Arrow version.' },
  { id: '5146', name: 'Becherovka', score: 6.5, style: 'herbal',
    note: 'A distinctive Czech herbal liqueur -- cinnamon and clove forward, unlike anything else on this shelf.' },
  { id: '16663', name: 'Sfumato Rabarbaro Amaro', score: 6.5, style: 'herbal',
    note: 'A well-regarded Italian rhubarb amaro, bittersweet and smoky.' },
  { id: '22962', name: 'Romana Amaro', score: 6, style: 'herbal',
    note: 'A solid, approachable amaro -- a fair entry point if Fernet or Campari feel too intense.' },
  { id: '2542', name: 'Romana Sambuca Black', score: 5.5, style: 'herbal',
    note: 'A dark, slightly more herbal sambuca variant, similar tier to standard sambucas.' },
  { id: '24467', name: 'Saint Grove Elderflower', score: 5.5, style: 'herbal',
    note: 'A budget elderflower liqueur, decent but less refined than St-Germain or Fiorente.' },
  { id: '21886', name: 'Trial & Error Ginger Liquor', score: 5, style: 'herbal',
    note: 'A basic ginger liqueur from a smaller producer. Fine for mixing.' },

  // ── Cream ──
  { id: '9469', name: "Fulton's Harvest Pumpkin Liqueur", score: 5, style: 'cream',
    note: 'A seasonal pumpkin-spice cream, sweet and autumnal.' },
  { id: '22308', name: 'Kamora Dulce De Leche', score: 5.5, style: 'cream',
    note: 'Caramel-forward, a fair dessert liqueur at a budget price.' },
  { id: '23600', name: 'Flor De Cana Coco', style: 'cream', score: 5.5,
    note: 'A rum-based coconut cream liqueur, tropical and sweet.' },
  { id: '15564', name: 'Chila Orchata Cinnamon Cream Rum', score: 6, style: 'cream',
    note: 'A genuine horchata flavor -- cinnamon and rice-milk sweetness done well.' },
  { id: '13681', name: 'Baja Luna Tequila Black Raspberry Cream Liqueur', score: 5, style: 'cream',
    note: 'A tequila-based cream liqueur, sweet and fruity rather than agave-forward.' },
  { id: '24089', name: 'Tippy Cow Shamrock Mint Rum Cream', score: 5.5, style: 'cream',
    note: 'A seasonal mint cream, sweet and easy-drinking.' },
  { id: '14771', name: 'Five Farms Irish Cream Liqueur', score: 7, style: 'cream',
    note: "A genuinely premium Irish cream, single-farm cream and a real step up from Baileys or Carolans." },
  { id: '16631', name: 'Jackson Morgan Southern Cream Peppermint Mocha', score: 5.5, style: 'cream',
    note: 'A seasonal coffee-cream flavor, sweet and easy.' },
  { id: '20566', name: 'Rumchata Coconut Cream', score: 6, style: 'cream',
    note: "Rumchata's reliable cinnamon-cream base with coconut added. Consistent with the brand's quality." },
  { id: '16919', name: 'Rumchata Peppermint Bark', score: 6, style: 'cream',
    note: 'A seasonal Rumchata variant, genuinely tastes like the holiday candy.' },
  { id: '17452', name: 'Somrus Chai Cream Liqueur', score: 6, style: 'cream',
    note: 'An Indian-inspired cream liqueur with real chai spice character -- distinctive among cream liqueurs.' },
  { id: '12894', name: 'Mozart Chocolate Cream Liqueur', score: 6.5, style: 'cream',
    note: 'From a respected Austrian chocolate liqueur house. Rich, genuinely chocolatey.' },
  { id: '13215', name: 'Mozart White Chocolate Vanilla Cream Liqueur', score: 6, style: 'cream',
    note: 'Same quality pedigree as their dark chocolate version, sweeter and vanilla-forward.' },
  { id: '2924', name: 'Tequila Rose', score: 5, style: 'cream',
    note: 'The well-known strawberry cream tequila liqueur. A novelty shot more than a serious pour.' },
  { id: '21526', name: 'Three Chord Bourbon Cream', score: 6, style: 'cream',
    note: 'A genuine bourbon base gives this more character than a neutral-spirit cream liqueur.' },
  { id: '19969', name: 'Amarula Vanilla Spice Cream Liqueur', score: 6.5, style: 'cream',
    note: "Built on Amarula's well-regarded South African marula-fruit cream base -- distinctive and well-made." },

  // ── Coffee ──
  { id: '20521', name: 'Galliano Espresso', score: 6, style: 'coffee',
    note: 'A well-regarded Italian liqueur house\'s coffee expression, real espresso character.' },
  { id: '17608', name: 'Kahlua Blonde', score: 5.5, style: 'coffee',
    note: 'A lighter, less viscous Kahlua variant. Fine, less distinctive than the original.' },
  { id: '23426', name: 'Luxardo Espresso Liqueur', score: 6.5, style: 'coffee',
    note: 'A well-regarded coffee liqueur, genuine espresso bitterness rather than syrup sweetness.' },
  { id: '22644', name: 'Faretti Espresso Liqueur', score: 5.5, style: 'coffee',
    note: 'A decent mid-tier espresso liqueur, useful in an espresso martini.' },

  // ── Chocolate ──
  { id: '7370', name: "Trader Vic's Chocolate Liqueur", score: 5.5, style: 'chocolate',
    note: 'A basic chocolate liqueur, fine for a dessert cocktail.' },
  { id: '9277', name: 'Dorda Double Chocolate Liqueur', score: 5.5, style: 'chocolate',
    note: 'Rich and sweet, similar tier to Trader Vic\'s version.' },
  { id: '15647', name: 'Mozart Dark Chocolate Liqueur', score: 6.5, style: 'chocolate',
    note: "Mozart's dark chocolate expression, richer and less sweet than their cream liqueur." },
  { id: '21559', name: 'Licor 43 Chocolate', score: 6, style: 'chocolate',
    note: "A chocolate twist on the classic Licor 43 vanilla-citrus formula." },

  // ── Nut ──
  { id: '5209', name: "Trader Vic's Macadamia Nut Liqueur", score: 6, style: 'nut',
    note: 'Genuine macadamia character, distinctive among nut liqueurs.' },
  { id: '16442', name: 'Disaronno Velvet Cream Liqueur', score: 6.5, style: 'nut',
    note: "Disaronno's amaretto flavor in a cream-liqueur format. Well-made, from a respected brand." },

  // ── Floral ──
  { id: '14414', name: 'Rothman & Winter Creme De Violette Liqueur', score: 6.5, style: 'floral',
    note: 'The real ingredient an Aviation cocktail needs. Well-regarded and hard to substitute.' },
  { id: '20661', name: 'Combier Liqueur De Violette', score: 6.5, style: 'floral',
    note: 'A comparable violette liqueur to Rothman & Winter, from an equally respected French house.' },
  { id: '14833', name: 'Ramazzotti Aperitivo Rosato', score: 6, style: 'floral',
    note: 'A well-known Italian aperitivo brand\'s rosato expression, floral and refreshing in a spritz.' },

  // ── Asian ──
  { id: '15604', name: 'Iichiko Silhouette Shochu', score: 6, style: 'asian',
    note: 'A well-regarded Japanese barley shochu, clean and smooth -- distinct from anything else on this shelf.' },

  // ── Other ──
  { id: '5586', name: 'Damiana Liqueur', score: 5.5, style: 'other',
    note: 'A Mexican herbal liqueur historically marketed for its aphrodisiac reputation. Distinctive, more novelty than workhorse.' },
  { id: '16754', name: 'Luxardo Bitter Bianco', score: 6.5, style: 'other',
    note: 'A well-regarded Italian white bitter aperitivo, less syrupy than Aperol.' },
  { id: '15784', name: 'Antioqueno Aguardiente', score: 6, style: 'other',
    note: 'A traditional Colombian anise-flavored spirit, authentic and distinctive.' },
  { id: '9441', name: 'Irish Mist Honey', score: 6, style: 'honey',
    note: 'A classic Irish whiskey-and-honey liqueur, warm and traditional.' },
];

let added = 0, skipped = 0;
for (const { id, name, score, style, note } of additions) {
  if (ratings[id]) { console.log(`SKIP ${id} (${name}) — already rated`); skipped++; continue; }
  ratings[id] = { name, score, style, note, source: 'draft' };
  added++;
}

writeFileSync('data/ratings.json', JSON.stringify(ratings, null, 2) + '\n');
console.log(`Cordials expand: added ${added}, skipped ${skipped}.`);
