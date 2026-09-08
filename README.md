# Best Under — Virginia ABC in-store finder

You're standing in a Virginia ABC store. Pick a category and a price ceiling.
It shows the best-rated bottles **actually on the shelf in that store right
now**, best first.

Home store: **#270, 809 E Parham Rd, Richmond**. 38 other stores within 15 miles
are in the picker. The crosshair button beside the picker works out which store
you're standing in; after you've allowed it once, it does that on its own every
time you open the page. Gin, bourbon, and rye are rated so far.

Every score in it is somebody else's opinion, so **tap any bottle to overrule
it** — set your own score, leave yourself a note, or both. Your version wins
from then on and the bottle re-sorts into its new tier. It is kept on that phone
and nowhere else; `Export` at the foot of the list hands it back so it can be
folded into `data/ratings.json` for the next build.

Style filters are per category — london dry and navy strength for gin, wheated
and bottled-in-bond for bourbon — because "best" means something different in
each. ABC files a lot of flavored whiskey under Bourbon, so `flavored` is a chip
you can switch off.

## How it works

Two halves that never run at the same time.

**Offline** (a desk, a few times a year) — build a table of every bottle ABC
sells, then rate them by hand. All the slow, messy, human work lives here where
mistakes are visible and fixable.

**Online** (in the store, must be fast) — filter and rank on the phone against
that table with no network at all, then ask about stock for just the top
candidates.

The join between the two halves is an exact product code. There is no fuzzy name
matching at runtime, so `Elijah Craig Small Batch` can never fail to match
`ELIJAH CRAIG SM BATCH BBN 750ML` while you're standing in an aisle.

```
search index ──► build-catalog ──► catalog.json ─┐
                                                 ├──► merge-shelf ──► shelf.json ──► phone
              Jeff's judgment ──► ratings.json ──┘                                     │
                                                                                       ▼
                                        ABC inventory API ◄── api/stock.js ◄── "stock for these 24?"
```

### Three things that shaped the design

1. **There is no "what's in this store" endpoint.** Every inventory call needs
   both a store number *and* a product code. So the app ranks locally first and
   only then asks about a bounded set — which also means the ranked list paints
   before any network request goes out.
2. **Virginia ABC sends no CORS header**, so a browser can't read its responses.
   `api/stock.js` is the only thing that talks upstream.
3. **One search result is a family of bottles**, not one bottle — index-aligned
   lists of sizes, prices, and codes. Taking the first entry files a 50 ml
   airplane bottle at $2.79 under "Tanqueray Gin".

Full reasoning in [ARCHITECTURE.md](ARCHITECTURE.md).

## Working on it

```bash
node scripts/build-stores.mjs 15     # stores within 15 mi -> data/stores.json
node scripts/build-catalog.mjs Gin Whiskey:Bourbon Whiskey:Rye   # -> data/catalog.json
node scripts/merge-shelf.mjs         # catalog + ratings -> public/shelf.json
node scripts/dev.mjs                 # local server on :3000
```

A shelf is `Category` or `Category:Type`. Bourbon and rye are not categories
upstream — ABC files all 4,393 whiskeys under `Whiskey` and splits them with a
type field — so they're requested as `Whiskey:Bourbon` and `Whiskey:Rye` and
stored under the name people actually use. `Whiskey:Scotch` and `Whiskey:Irish`
are there for the taking.

Edit `data/ratings.json`, re-run `merge-shelf`, push. That's the whole loop.

Ratings typed on the phone come back the same way. Tap `Save file` under the
list, then:

```bash
node scripts/import-my-ratings.mjs ~/Downloads/my-ratings.json --dry-run
node scripts/import-my-ratings.mjs ~/Downloads/my-ratings.json
node scripts/merge-shelf.mjs
```

The dry run prints every add and change without writing. A real run keeps a
`.bak` beside the file, marks the imported entries `"source": "jeff"`, and
leaves any hand-authored `style` alone. A phone entry with a note but no score
stays on the phone — the shelf sorts on scores, so there is nothing to file
yet.

Ratings key on **label ID**, not product code — "Tanqueray Gin" is one opinion
that covers all five of its bottle sizes. 163 ratings currently cover 299
bottles across gin, bourbon, and rye. Anything still marked `"source": "draft"` is Claude's first pass from
general consensus; change it to `"jeff"` once you've confirmed or overridden it,
and the `draft` tag disappears from the page.

## Posture toward Virginia ABC

These endpoints are undocumented, unauthenticated, and unsupported. They're the
same calls the ABC website's own pages make.

Read-only, always. Honest `User-Agent`. Requests throttled and spaced, responses
cached for ten minutes, fan-out capped at 30 products. Backs off immediately on
a 429 or a challenge and tells you plainly instead of retrying harder. No
User-Agent spoofing, no proxy rotation, no challenge solving. This is one person
checking stock at one store, and the request volume should look like it.

If the upstream goes away, the offline half still works — you get the ratings
with `no data` where the counts would be, never a stale number dressed up as
live.

Not affiliated with or endorsed by Virginia ABC.

## Credit

Endpoint shapes learned from [rnwolfe/vabc](https://github.com/rnwolfe/vabc)
(MIT), a Go CLI over the same endpoints. Store locations are official VGIN open
data.
