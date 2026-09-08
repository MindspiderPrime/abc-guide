# Handoff — ABC "Best Under $X" in-store finder

Written 2026-09-05 for whoever picks this up next. Read `ARCHITECTURE.md` for
*why* the design is shaped this way; this document is *where things actually
stand*, including what is half-finished.

Jeff has no coding background. Explain decisions in plain language, define
jargon, and frame choices as speed/cost/hassle tradeoffs rather than technical
merit.

---

## 1. State of play

**Deployed and working:** the gin + bourbon + rye version. Jeff confirmed it
works in a real store. Vercel project `abc-guide` (`prj_KhvQ3rb2Fw4vOusk6FDwrXrmwzcC`),
linked, deploying from `C:\Users\jeffr\Claude\Projects\ABC Guide`.

> I never got the deployed URL from Jeff. Ask him for it, or run
> `vercel project ls`. Don't assume it.

**Committed:** through `a6c9571` — "Add bourbon and rye: 163 ratings across 299 bottles".

**Uncommitted in the working tree** — the whole all-categories expansion:

```
 M data/catalog.json        5,856 bottles across 18 shelves (was 1,514)
 M data/ratings.json        329 labels (was 163)
 M lib/abc.mjs              virginia field; type-filtered search
 M scripts/build-catalog.mjs  --all flag, Combo filter, Virginia flag
 M scripts/merge-shelf.mjs  rewritten: rated file + per-category files
 M public/index.html        script block rewritten (see §3 — UNTESTED)
 M public/shelf.json        146.6 KB
?? public/shelf/            18 per-category files, 3.6–131 KB each
```

Nothing here has been committed, and nothing here has been deployed.

---

## 2. Deploy and rebuild commands

Jeff is on **PowerShell 5.1**, which does not accept `&&` as a separator. Use
`;` or a single command with `--cwd`. This has bitten us twice.

```bash
vercel deploy --prod --yes --cwd "C:/Users/jeffr/Claude/Projects/ABC Guide"
```

Rebuild pipeline, in order:

```bash
node scripts/build-stores.mjs 15          # stores within 15 mi   (~1 request)
node scripts/build-catalog.mjs --all      # every shelf           (~10 min, background it)
node scripts/merge-shelf.mjs              # -> public/shelf.json + public/shelf/*.json
node scripts/dev.mjs                      # local server on :3000
```

`build-catalog.mjs --all` takes about ten minutes and must be backgrounded — it
exceeds the 120s foreground timeout.

---

## 3. What is NOT verified — read this before touching anything

**The page's JavaScript has never been run in a browser.** The entire `<script>`
block in `public/index.html` was rewritten to add the on-request "everything on
the shelf" view, and then the session ended. It passes `node --check`, which
proves only that it parses.

Specifically unexercised:

- the `everything on the shelf` chip → `loadCategory()` → `shelf/<slug>.json` fetch
- unrated rows (the `not rated` block, `data-rated="no"` styling)
- the `virginia made` chip
- the `$150` price ceiling (was `$80`)
- the "Showing the top 30 of N" footer
- category switching while `showAll` is on

**Do this first:** `node scripts/dev.mjs`, open it at mobile width, and click
every chip. Expect at least one bug. The slug function in the page
(`c.toLowerCase().replace(/[^a-z0-9]+/g, '-')`) must exactly match `slug()` in
`merge-shelf.mjs` or every category fetch 404s and the toggle silently reverts.

---

## 4. Known gaps

**Rum has zero ratings.** 427 bottles, and I said I would rate it and then
didn't — it fell out of the list when I wrote `rate.mjs` and I didn't notice
until the final merge output. This is the most obvious hole. Rum is a category
Jeff is likely to actually shop.

Also at zero, but deliberately: **Cocktails** (425 RTDs), **Moonshine** (130),
**Schnapps** (51). Ratings there are either obvious or meaningless. Confirm with
Jeff before spending effort.

Current coverage:

| Shelf | Rated / total | | Shelf | Rated / total |
|---|---|---|---|---|
| Tequila | 190 / 845 | | Irish | 17 / 105 |
| Bourbon | 181 / 982 | | Vermouth | 10 / 23 |
| Gin | 91 / 257 | | Canadian | 8 / 124 |
| Vodka | 60 / 715 | | Blended | 4 / 86 |
| Scotch | 53 / 302 | | Japanese | 3 / 34 |
| Cordials | 48 / 742 | | **Rum** | **0 / 427** |
| Brandy | 36 / 247 | | Cocktails | 0 / 425 |
| Rye | 27 / 230 | | Moonshine | 0 / 130 |
| Tennessee | 20 / 82 | | Schnapps | 0 / 51 |

**Three array misalignments** appeared in the full build (`dropped (misalign) 3`
out of 10,752 labels). They were previously always zero. The guard did the right
thing — it refused to guess and skipped them rather than emitting a wrong price —
so three labels are silently missing from the catalog. Nobody has looked at
which three or why. Low urgency, but the counter must not be allowed to drift
upward unnoticed; it is the tripwire for Finding 4 below.

**Every one of the 329 ratings is `"source": "draft"`.** They are all mine, from
general consensus. Jeff has confirmed none of them. The tequila and scotch calls
are more contentious than the gin ones.

---

## 5. Things that will bite you

These were each learned the hard way. Full detail in `ARCHITECTURE.md` §1.

1. **There is no bulk store-inventory endpoint.** Every call needs a store
   number *and* one product code. This is why the page ranks locally first and
   only then asks about a bounded set. Don't try to "just fetch the store's
   inventory" — that endpoint does not exist.

2. **Virginia ABC sends no CORS header.** The browser cannot read its responses.
   `api/stock.js` is the only thing that may talk upstream.

3. **A bogus product code returns `quantity: 0`, not an error.** I lost time to
   a screen of plausible zeros caused by passing *label IDs* where *product
   codes* were expected. Codes must always come from the catalog. `api/stock.js`
   reports "no record" as `null` and the page renders that as `no data` — keep
   that distinct from a real zero.

4. **One search result is a family of bottles.** Index-aligned lists of sizes,
   prices and codes. Position N in each list is the same bottle. Taking the
   first entry (as the `vabc` reference client does) files a 50 ml airplane
   bottle at $2.79 under "Tanqueray Gin". `build-catalog.mjs` expands them and
   refuses to guess if the lists disagree.

5. **Cloudflare splits along the offline/online seam.** `/webapi/inventory/*`
   answers Node's `fetch` fine. `/coveo/rest/search/v2` serves a challenge to it
   but answers curl, so `lib/abc.mjs` shells out to curl **for the catalog build
   only**. Jeff explicitly approved this. Same honest User-Agent, same throttle,
   no challenge solving. If curl starts getting challenged too, **stop** — fall
   back to ABC's officially published quarterly price list. Do not escalate.

6. **Bourbon and rye are not categories.** ABC files all 4,393 whiskeys under
   `Whiskey` and splits them with `hierarchy_type`. Shelves are named
   `Category` or `Category:Type`. Guessing `Bourbon` as a category builds an
   empty catalog silently.

7. **Ratings key on `labelId`, not product code.** One opinion covers all sizes
   of a bottle. 329 ratings cover 748 bottles.

8. **ABC's `type` is the style vocabulary where it's meaningful** (tequila:
   Silver/Reposado/Añejo/Mezcal; cordials: Fruit/Cream/Herbal) and useless where
   it isn't (gin and vodka are both just "Regular"). `merge-shelf.mjs` falls back
   to `type` when a rating has no explicit `style`, so only set `style` where you
   disagree with ABC or where ABC has nothing.

---

## 6. Settled decisions — don't relitigate

- **Home store 270**, 809 E Parham Rd, Richmond. 38 others within 15 miles.
- **Store detection is offline and opt-in-once.** Every store's lat/lng ships in
  `shelf.json` (under a kilobyte for 39 stores), so picking the nearest one is a
  GPS read and some arithmetic — no geocoding service, and it works in a dead
  spot. It auto-switches only inside 0.3 mi; the two closest ABC stores here are
  0.68 mi apart, so that radius can never match two at once. Further out it
  relabels the picker with real distances from you and leaves your choice alone.
  It never fires a cold permission prompt on first load — automatic behaviour
  starts only after you've tapped the button once and allowed it.
- **750 ml is the default size**, "any size" one tap away, `$/750` shown on
  off-standard sizes. Jeff asked for this directly.
- **Price ceiling $10–$150**, step $5.
- **Public repo**, `MindspiderPrime/abc-guide`. GitHub + Vercel.
- **Unrated bottles are shown on request**, not by default and not hidden —
  Jeff chose the middle option. This is why `shelf.json` holds only rated
  bottles and `public/shelf/<cat>.json` holds everything.
- **Non-drink categories are out**: Mixers, Rimmers, Gift Bag/Box, Reusable Bag,
  and every `Combo` type (gift sets).
- **"Virginia" is a chip, not a shelf** — it's a cross-cutting flag on products
  that live in other categories.
- **Allocated/lottery bottles are filtered out entirely** in `merge-shelf.mjs`.
  Nobody has asked for a way to see them.
- **Your own ratings stay on the phone.** No account, no server, no sync. The
  export is the bridge back to `data/ratings.json`. See §9.
- **Shelf rows carry `l`, the label id.** It is what the editor keys on, and it
  cost about 17 KB on `shelf.json`.

---

## 7. Suggested next steps, in order

1. **Test the page** (§3). Nothing else matters until the rewritten script is
   known to work.
2. **Commit the expansion.** It's a large, coherent change sitting uncommitted.
3. **Rate rum.** The obvious hole. ~40 labels gets real coverage; the pattern is
   `scratchpad/rate.mjs` — a list of `[exact catalog name, score, note, style?]`
   resolved against `data/catalog.json` by name, which prints anything it can't
   match. Name matching belongs offline, where a miss is visible and fixable.
4. **Deploy**, and get the URL from Jeff this time.
5. **Ask Jeff to start confirming ratings** — flip `"source": "draft"` to
   `"jeff"` in `data/ratings.json`. That file is the only thing in the repo that
   cannot be regenerated. Everything else is derived and disposable.

Deferred and still worth remembering: pre-warming stock for the home store on a
schedule; `storeNearby` gives nearby stores' counts at no extra request cost, so
"who else has it" is nearly free whenever it's wanted.

The in-page ratings editor that was deferred here is now built — see §9.

---

## 9. The in-page editor — your own scores and notes

Tapping any row opens a bottom sheet: a 0–10 slider and a note field, with the
shipped rating printed above them so you can see what you are overruling. Save
and the bottle re-sorts into its new tier immediately.

**Where it lives.** `localStorage.myRatings` on that phone, keyed on labelId —
the same key `data/ratings.json` uses, so one opinion covers all five sizes of
Tanqueray. There is no account and no server: adding a database would have cost
the one property the app is built around, which is that the ranked list works in
an aisle with no signal.

**What that costs.** It is per-device and per-browser. Clearing the browser's
site data loses it, and there is no backup anywhere. The export line under the
list says so, in those words. This is the main thing to tell Jeff.

**Three states, not two.** A score of your own replaces the shipped one. A note
on its own does *not* — the shipped score stands and the row is badged
`Your note` instead of `Your score`. Saving an empty score and an empty note is
how you take an edit back; `Remove mine` does the same thing in one tap. Either
way the shipped values come straight back, because each row keeps them in a
`base` field rather than being overwritten.

**Scoring something unrated.** If you rate a bottle you found under "everything
on the shelf", it has no row in `shelf.json` to come back to. The rating stores a
copy of the row alongside it, and `myExtras()` splices that copy back in — so it
stays in the list when the full-shelf toggle goes off. Without this it would
silently disappear, which is the opposite of what rating it meant.

**Getting it back into the repo.** `scripts/import-my-ratings.mjs` takes the
exported file, prints every add and change, and merges it into
`data/ratings.json` with a `.bak` beside it. `--dry-run` stops before writing.
The export deliberately carries no `style`: `merge-shelf` falls back to ABC's own
type where a rating has none, and writing that fallback into the file would
freeze a guess as a decision. Imported entries land as `"source": "jeff"` — an
opinion typed with the bottle in your hand is a confirmed one.

**Verified in a browser** at 375px, light and dark: opening from both the row
body and the Rate button, score override, note-only, removal restoring the
shipped values, rating an unrated bottle and toggling the full shelf off,
survival across a reload, and the import round-trip. **Not verified:** the
`Copy as JSON` success path — the clipboard needs a real finger, and scripted
clicks do not count as one. Its failure message and `Save file` both work. Test
copy on the phone.

---

## 8. Posture toward Virginia ABC

Read-only, always. Honest `User-Agent` identifying the tool. Requests throttled
and spaced, responses cached ten minutes, fan-out capped at 30 products. Back
off immediately on a 429 or a challenge and say so plainly rather than retrying
harder. No User-Agent spoofing, no proxy rotation, no challenge solving.

This is one person checking stock at one store. The request volume should look
like exactly that.
