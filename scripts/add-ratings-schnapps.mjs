// Rates the Schnapps category from scratch (was 0/51). Style vocabulary
// borrows ABC's own "type" field the way Cordials does (Fruit/Herbal/Spice/
// Other), since that's genuinely descriptive here — see HANDOFF.md #8.
//
// Run: node scripts/add-ratings-schnapps.mjs
// Then rebuild: node scripts/merge-shelf.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const ratings = JSON.parse(readFileSync('data/ratings.json', 'utf8'));

const additions = [
  { id: '16792', name: '99 Black Cherry Schnapps', score: 3, style: 'fruit',
    note: 'Shot-bar novelty. One-note cherry candy, nothing to sip.' },
  { id: '18465', name: '99 Blue Raspberries', score: 3, style: 'fruit',
    note: 'Mini-only novelty shot. Tastes like the candy, not much else.' },
  { id: '20070', name: '99 Coconut Schnapps', score: 3.5, style: 'fruit',
    note: 'Actually reads as coconut rather than generic sweet. Fine in a shot round.' },
  { id: '20069', name: '99 Grapes Schnapps', score: 3, style: 'fruit',
    note: 'Purple candy in a bottle. Does the one job it has.' },
  { id: '13870', name: '99 Oranges Schnapps', score: 3, style: 'fruit',
    note: 'Orange soda syrup with proof behind it. Shot-bar standard.' },
  { id: '16382', name: '99 Root Beer Schnapps', score: 4.5, style: 'other',
    note: 'Genuinely tastes like a root beer float. The best of the 99 lineup by a wide margin.' },
  { id: '16383', name: '99 Watermelon Schnapps', score: 3, style: 'fruit',
    note: 'Jolly Rancher in liquid form. Exactly as advertised.' },
  { id: '7315', name: '99 Whipped Cream', score: 3.5, style: 'other',
    note: 'Cake-batter sweet. Better poured over dessert than drunk neat.' },
  { id: '11864', name: 'Dekuyper Buttershots Schnapps', score: 4, style: 'other',
    note: 'The Buttery Nipple base. Butterscotch is convincing; a shot-bar staple for a reason.' },
  { id: '11865', name: 'Dekuyper Grape Pucker Schnapks', score: 3, style: 'fruit',
    note: 'Sour grape candy, aggressively so. Does what "Pucker" promises.' },
  { id: '5854', name: 'DeKuyper Island Punch Pucker', score: 3, style: 'other',
    note: 'Generic tropical-punch sweetness. Fine as a mixer, unremarkable neat.' },
  { id: '901', name: 'Dekuyper Peachtree Schnapps', score: 4, style: 'fruit',
    note: 'The standard peach schnapps. Genuinely useful in a Sex on the Beach, not just a shot.' },
  { id: '19698', name: 'Dekuyper Peachtree Schnapps PET', score: 4, style: 'fruit',
    note: 'Same peach schnapps as the glass bottle, plastic for the cookout cooler.' },
  { id: '903', name: 'Dekuyper Peppermint Schnapps', score: 3.5, style: 'herbal',
    note: 'Classic hot cocoa and peppermint patty mixer. Nothing fancy, does the job.' },
  { id: '912', name: 'Dekuyper Sour Apple Pucker Schnapps', score: 3.5, style: 'fruit',
    note: 'The Appletini building block. Artificial but convincingly sour-apple.' },
  { id: '920', name: 'Dekuyper Watermelon Pucker Schnapps', score: 3, style: 'fruit',
    note: 'Sour watermelon candy. Interchangeable with the rest of the Pucker line.' },
  { id: '1000', name: "Dr. Mcgillcuddy's Vanilla", score: 3.5, style: 'herbal',
    note: 'Smooth vanilla, works in coffee drinks. Better as a mixer than a shot.' },
  { id: '4671', name: "Dr. McGuillicuddy's Cherry Schnapps", score: 3.5, style: 'fruit',
    note: 'Cough-syrup cherry, but that is exactly the appeal at a shot bar.' },
  { id: '11968', name: 'Ice 101 Peppermint Schnapps', score: 4, style: 'herbal',
    note: '101 proof peppermint. Strong enough that bartenders actually reach for it.' },
  { id: '16775', name: 'Schoolcrafts Original Wondermint Schnapps Liqueur', score: 3.5, style: 'herbal',
    note: 'Virginia-made peppermint schnapps. Regional novelty more than a category leader.' },
  { id: '3571', name: 'Aristocrat Peach Schnapps', score: 2.5, style: 'fruit',
    note: 'Bottom-shelf jug schnapps. Buy it for the price and nothing else.' },
  { id: '11691', name: 'Aristocrat Southern Style Peach Schnapps', score: 2.5, style: 'fruit',
    note: 'Same tier as Aristocrat\'s other schnapps. A mixer, not a sipper.' },
  { id: '20638', name: 'Arrow Butterscotch Schnapps', score: 3, style: 'other',
    note: 'Cheaper and thinner than Dekuyper Buttershots. Gets the job done in a pinch.' },
  { id: '154', name: 'Arrow Peach Schnapps', score: 2.5, style: 'fruit',
    note: 'Rock-bottom peach schnapps. Purely a mixer.' },
  { id: '5098', name: 'Arrow Peppermint Schnapps', score: 3, style: 'herbal',
    note: 'A budget stand-in for Rumple Minze. Thinner, but cheap by the handle.' },
  { id: '11713', name: 'Barton Peach Schnapks', score: 2.5, style: 'fruit',
    note: 'Barton-tier everything: cheap, thin, does the minimum.' },
  { id: '358', name: 'Black Haus Blackberry Schnapps', score: 5, style: 'fruit',
    note: 'German import, real blackberry character instead of candy syrup. A cut above the domestic fruit schnapps.' },
  { id: '20261', name: 'Bols Peach Liqueur', score: 5.5, style: 'fruit',
    note: 'Dutch liqueur house, noticeably more balanced than the Dekuyper/Arrow tier of peach schnapps.' },
  { id: '13679', name: 'Dekuyper Hot Damn! Cinnamon Schnapps', score: 3.5, style: 'spice',
    note: 'A Fireball competitor without the whiskey base. Cinnamon-candy hot, does the shot-bar job.' },
  { id: '2574', name: 'Rumple Minze', score: 5.5, style: 'herbal',
    note: '100 proof peppermint, ice-cold out of the freezer. The one schnapps most people actually ask for by name.' },
];

let added = 0, skipped = 0;
for (const { id, name, score, style, note } of additions) {
  if (ratings[id]) { console.log(`SKIP ${id} (${name}) — already rated`); skipped++; continue; }
  ratings[id] = { name, score, style, note, source: 'draft' };
  added++;
}

writeFileSync('data/ratings.json', JSON.stringify(ratings, null, 2) + '\n');
console.log(`Schnapps: added ${added}, skipped ${skipped}.`);
