// Folds ratings typed on the phone back into data/ratings.json.
//
// The page keeps your own scores and notes in localStorage, on that phone only.
// Its "Save file" button writes `my-ratings.json` in exactly the shape of
// data/ratings.json, and this merges that file in. After it runs, re-run
// merge-shelf.mjs and the phone downloads your own opinion as the shipped one.
//
//   node scripts/import-my-ratings.mjs ~/Downloads/my-ratings.json
//   node scripts/import-my-ratings.mjs my-ratings.json --dry-run
//
// Nothing is overwritten silently: every change is printed before it is
// written, and --dry-run stops short of writing at all.

import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const source = args.find((a) => !a.startsWith('--'));

if (!source) {
  console.error('Usage: node scripts/import-my-ratings.mjs <my-ratings.json> [--dry-run]');
  process.exit(1);
}
if (!existsSync(source)) {
  console.error(`No such file: ${source}`);
  process.exit(1);
}

const TARGET = 'data/ratings.json';

let incoming;
try {
  incoming = JSON.parse(readFileSync(source, 'utf8'));
} catch (e) {
  console.error(`${source} is not valid JSON: ${e.message}`);
  process.exit(1);
}
if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
  console.error(`${source} should be an object keyed by label id.`);
  process.exit(1);
}

const ratings = existsSync(TARGET) ? JSON.parse(readFileSync(TARGET, 'utf8')) : {};

const added = [];
const changed = [];
const same = [];
const skipped = [];

for (const [labelId, r] of Object.entries(incoming)) {
  // A note with no score is a real state on the phone — you had something to
  // say before you had a number. It is not a rating the shelf can sort, so it
  // stays on the phone until it gets one.
  if (typeof r?.score !== 'number') {
    skipped.push(`${labelId}  ${r?.name || '?'}  — no score`);
    continue;
  }

  const was = ratings[labelId];
  // `style` is never exported: merge-shelf falls back to ABC's own type where a
  // rating has none, so an existing hand-authored style must survive an import.
  const next = {
    name: r.name || was?.name || '',
    score: r.score,
    ...(was?.style ? { style: was.style } : {}),
    note: r.note || '',
    source: r.source || 'jeff',
  };

  if (!was) {
    added.push(`${labelId}  ${next.name}  ${next.score}`);
  } else if (was.score !== next.score || (was.note || '') !== next.note) {
    changed.push(
      `${labelId}  ${next.name}  ${was.score} -> ${next.score}` +
        ((was.note || '') !== next.note ? '  (note rewritten)' : '')
    );
  } else {
    same.push(labelId);
    continue;
  }

  ratings[labelId] = next;
}

const report = (title, lines) => {
  if (!lines.length) return;
  console.log(`\n${title} (${lines.length})`);
  for (const l of lines) console.log(`  ${l}`);
};

report('New ratings', added);
report('Changed', changed);
report('Left on the phone', skipped);
if (same.length) console.log(`\nAlready identical: ${same.length}`);

if (!added.length && !changed.length) {
  console.log('\nNothing to write.');
  process.exit(0);
}

if (dryRun) {
  console.log(`\n--dry-run: ${TARGET} not touched.`);
  process.exit(0);
}

// Sort numerically so the file keeps the order it has today and diffs stay
// readable — label ids are numeric strings, which sort as text by default.
const sorted = {};
for (const k of Object.keys(ratings).sort((a, b) => Number(a) - Number(b) || a.localeCompare(b))) {
  sorted[k] = ratings[k];
}

if (existsSync(TARGET)) copyFileSync(TARGET, `${TARGET}.bak`);
writeFileSync(TARGET, JSON.stringify(sorted, null, 2) + '\n');

console.log(`\nWrote ${TARGET}  (${Object.keys(sorted).length} ratings; previous copy at ${TARGET}.bak)`);
console.log('Next: node scripts/merge-shelf.mjs');
