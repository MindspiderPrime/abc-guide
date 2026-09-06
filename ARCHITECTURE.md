# Architecture: "Best Under $X" — Virginia ABC In-Store Finder

Successor to `abc-best-under-x-handoff.md`. That document set the goal and the
shape; this one commits to how it gets built, and corrects several things in it
that turn out not to be true.

Written for someone who doesn't write code. Jargon gets defined the first time
it appears.

---

## Part 1 — What I verified, and what changed

Before designing anything I made real requests to Virginia ABC's endpoints and
read the `rnwolfe/vabc` source. Findings 1-4 came from that pass; 5 and 6 turned
up during the build. The first one is load-bearing.

### Finding 1 — There is no "what's in this store" endpoint (this changes the design)

The handoff assumes we can ask *"store 219, what do you have?"* and get a list
back. That endpoint does not exist. Every inventory endpoint requires **both** a
store number **and** a specific product code, and answers exactly one question:
*"how many of this one item does this one store have?"*

Verified live:

```
GET /webapi/inventory/mystore?storeNumbers=219&productCodes=010807
→ {"products":[{"productId":"010807","storeInfo":{"storeId":219,"quantity":5,...}}]}
```

So the join runs the other direction from what the handoff describes. Instead of
*inventory → filter by our ratings*, it's *our ratings → ask about each one*.

**The consequence, and the fix.** If "gin under $30" has 40 candidates, a naive
version fires 40 requests and you stand in the aisle for ten seconds. So:

> **Rank first, then check stock.** Filtering and sorting happen entirely on the
> phone against a small data file it already has — instant, no network. Only
> *then* does it ask about stock, for the top ~24 candidates, in parallel, with
> results filling in best-first as they land.

This is better than what the handoff imagined, not worse. The screen paints
immediately with the ranked list, and each row resolves to "3 in stock" or drops
away within a second or two. On bad signal you still see the ranking.

### Finding 2 — The page cannot call Virginia ABC directly (browsers forbid it)

A web page can only read a response from another website if that website sends a
permission header (`Access-Control-Allow-Origin`) saying it's allowed. I checked
the response headers above — Virginia ABC sends no such header. A browser will
make the request and then refuse to let our page read the answer.

There is no way around this from the page itself. **We need a small piece of
code running on a server** that makes the request on the page's behalf and hands
back the result. This is called a *proxy*, and it's about 40 lines.

This is not a tax — it's where the throttling, the caching, and the polite
`User-Agent` live anyway. But it does mean the project is "a web page plus one
small server function," not "a web page." It still costs $0 to host.

### Finding 3 — Skip the Excel dump; the site's own search index is better

The handoff proposes seeding the catalog from the quarterly Excel price list.
The site's search index (a system called Coveo) is strictly better and I confirmed
it returns everything we need:

```
POST /coveo/rest/search/v2   {"aq":"@hierarchy_category==\"Gin\"", ...}
→ 464 gin entries, each with name, category, proof, every size,
  every price, and every 6-digit product code
```

It's current rather than quarterly, it carries category and proof and style
hints the Excel file lacks, and critically **it returns the same 6-digit product
code the inventory endpoint uses** — so the join key is confirmed to line up.
This deletes the "parse an Excel file" step from the build order entirely.

### Finding 4 — One search result is a *family* of bottles, and a naive read gets the price wrong

This is a trap worth naming. A single search result is a product *label* like
"Tanqueray Gin," carrying parallel lists for its sizes:

```
sizes  ['50 ml', '375 ml', '750 ml', '1 L',   '1.75 L']
prices ['2.79',  '15.99',  '28.99',  '38.99', '44.79' ]
skus   ['028861','028864', '028866', '028867','028868']
```

Same position in each list = same bottle. The 750 ml Tanqueray is code `028866`
at $28.99.

The `vabc` reference code takes only the *first* code from that list, which would
give us a **50 ml airplane bottle at $2.79 labeled as Tanqueray Gin**. Our catalog
builder must expand these lists into one row per bottle. Two more gotchas in the
same area: the index returns duplicate entries (some with a null code list — drop
those), and product codes must be padded to six digits (`010807`, not `10807`).

### What stays exactly as written

The handoff's core call — **split offline messy work from online fast work, and
join on an exact product code, never on a name** — is correct and is the spine of
everything below. The finding above only changes *which direction* the join runs.

---

## Part 2 — The architecture

Three pieces. Only the third one runs while you're standing in a store.

```
  ┌─ OFFLINE (a desk, every few months) ──────────────────────────┐
  │                                                               │
  │   ABC search index ──► build script ──► catalog.json          │
  │                                          (every bottle:       │
  │                                           code, name, size,   │
  │                                           price, category)    │
  │                                              │                │
  │   Jeff's judgment ───► ratings.json ─────────┤                │
  │                        (score + style +      │                │
  │                         one-line note)       ▼                │
  │                                         shelf.json            │
  │                                    (the two, merged —         │
  │                                     the only file the         │
  │                                     phone downloads)          │
  └───────────────────────────────────────────────┬───────────────┘
                                                  │
  ┌─ SERVER (one small function, always on) ──────┼───────────────┐
  │                                               │               │
  │   /api/stock?store=219&codes=028866,...       │               │
  │        │                                      │               │
  │        ├─ cached? → answer instantly          │               │
  │        └─ else → throttled parallel calls to ABC              │
  │                  ► {"028866": 5, "030421": 0, ...}            │
  └───────────────────────────────────────────────┼───────────────┘
                                                  │
  ┌─ PHONE (in the store) ────────────────────────▼───────────────┐
  │   1. loads shelf.json once, keeps it cached                   │
  │   2. category + price → filter & rank locally  (instant)      │
  │   3. asks /api/stock about the top ~24                        │
  │   4. rows resolve best-first as answers arrive                │
  └───────────────────────────────────────────────────────────────┘
```

### Piece 1 — The catalog builder (offline, run quarterly)

A script that pages through the ABC search index one category at a time,
expands each label into one row per bottle size, drops duplicates and gift sets,
and writes `catalog.json`. Roughly 4,000 rows for the whole store; ~300 for gin.

Run by hand, output eyeballed by a human, committed to the project. If it breaks
because ABC changed something, it breaks at a desk, not in an aisle.

### Piece 2 — The ratings file (human, per category)

**One improvement over the handoff here: rate the label, not the bottle.**

The handoff schema is `product code → rating`. But Tanqueray in 750 ml and
Tanqueray in 1.75 L are two product codes and one opinion. Rating each code
separately means duplicate work, and the ratings silently go stale whenever ABC
adds or drops a size.

So ratings key on the **label ID** — a stable number the search index already
gives us (Tanqueray Gin = `3451`). Every size inherits it. Jeff rates ~40 gins,
not ~120 gin bottles, and nothing drifts when the lineup changes.

```json
{
  "3451": {
    "name":   "Tanqueray Gin",
    "score":  8.0,
    "style":  "london-dry",
    "note":   "The reliable one. Juniper-forward, holds up in a G&T.",
    "source": "draft",
    "rated":  "2026-09-05"
  }
}
```

- **`score`** — the number it sorts by.
- **`style`** — the handoff's second field, correctly insisted on. Becomes a
  filter chip on the page (`london-dry` / `contemporary` / `barrel-aged` /
  `genever`), because "best gin" is meaningless without it.
- **`note`** — *added*. One line, in Jeff's voice. This is the thing that's
  actually worth reading in an aisle, and it's what makes this his guide rather
  than a scraped leaderboard.
- **`source`** — *added*. `"draft"` means I drafted it from general consensus;
  `"jeff"` means he's confirmed or overridden it. The page dims the drafts. This
  keeps the distinction between "a first draft for him to edit" and "his actual
  opinion" visible instead of quietly collapsing them, which the handoff is
  explicit about wanting.

### Piece 3 — The stock function (server)

One endpoint. Takes a store and a list of product codes, returns a count for
each.

```
GET /api/stock?store=219&codes=028866,030421,015512
→ {"asOf":"2026-09-05T19:44:57Z","stock":{"028866":5,"030421":0,"015512":2}}
```

What it does internally, in order:

1. **Cache** — answers already known and less than ~10 minutes old are returned
   without touching ABC. Store inventory does not move fast enough for fresher to
   matter, and this is most of the courtesy budget.
2. **Throttle** — at most a handful of outbound requests at a time, spaced,
   matching the `vabc` posture: honest `User-Agent` identifying the tool, no
   evasion, no spoofing.
3. **Back off** — if ABC returns a rate-limit or a Cloudflare challenge, stop
   immediately, remember to stay stopped for a minute, and tell the page plainly.

### Piece 4 — The page

One HTML file. Category picker, price slider, store dropdown, style chips,
results.

Behavior that matters in a store:

- **Ranked list appears before any network call.** Local data, zero latency.
- **Stock fills in progressively**, best-rated first. Out-of-stock rows fade out
  rather than the list re-shuffling under your thumb.
- **`shelf.json` is cached on the phone.** If the network is dead you can still
  browse the ratings — clearly labeled *"no stock data — network unavailable"*.
  Never a stale number dressed up as live, per the handoff.
- **Big touch targets, high contrast, one-handed.** Assume bad light and a cart.

---

### Finding 5 — Cloudflare splits exactly along the offline/online seam (found during the build)

The two endpoint families behave differently, and conveniently so:

| Route | Node's `fetch` | curl | Used |
|---|---|---|---|
| `/webapi/inventory/*` | **200 OK** | 200 OK | at runtime, by `api/stock.js` |
| `/coveo/rest/search/v2` | 403 challenge | 200 OK | offline only, by the catalog builder |

The route the deployed app depends on answers cleanly. The challenged route runs
only on a desk, a few times a year. So `lib/abc.mjs` sends the catalog build over
curl and keeps everything else on `fetch` — a change of HTTP client, not a
disguise: same honest `User-Agent`, same throttle, no challenge solving. If curl
starts getting challenged too, the fallback is ABC's officially published
quarterly price list, not escalation.

### Finding 6 — Bogus product codes return `0`, not an error

The inventory endpoint doesn't validate codes. Ask it about a code that doesn't
exist and it cheerfully answers "quantity 0" — indistinguishable from a real
product that's sold out. I hit this by accidentally passing label IDs instead of
product codes and got a plausible-looking screen of zeros.

Two consequences: every code the app sends must come from the catalog (never
constructed), and `api/stock.js` reports "no inventory record" as `null`, kept
distinct from a genuine `0`. The page renders that as *no data*, never as *out of
stock*.

---

## Part 3 — Decisions (settled 2026-09-05)

**A. Where it lives → GitHub + Vercel.** Public repo at
`MindspiderPrime/abc-guide`, deployed from `public/` with one function in
`api/`, region pinned to `iad1` because ABC's own servers answer from IAD.
No build step, no framework.

**B. Size normalization → 750 ml default, with price-per-750 shown.** The size
picker defaults to 750 ml so a $29 handle of bottom-shelf gin can't outrank a
$28 bottle of good gin; "any size" is one tap away, and off-standard sizes carry
a `$/750` line so the comparison stays honest.

**C. Home store → #270, 809 E Parham Rd, Richmond.** 38 more stores within 15
miles are in the picker, sorted by distance.

<details>
<summary>Original framing of decision A, kept for the record</summary>

### Decision A — Where it lives

| | Vercel | Cloudflare | A computer at home |
|---|---|---|---|
| Cost | $0 | $0 | $0 |
| Setup hassle | Low | Low | High |
| Works on cell signal | Yes | Yes | Only via extra setup |
| Speed | Fast | Fastest | Slow |

**Recommendation: Vercel.** Plain HTML file plus one small function, no build
step, no frameworks, no package installs. You edit the file, it redeploys itself.
Cloudflare is marginally faster and equally free; the difference will not be
perceptible. Home computer is a false economy — it has to be awake and reachable
from a store parking lot.

### Decision B — Size normalization (your open question, with a recommendation)

You asked whether to normalize 750 ml vs 1.75 L, or just use sticker price.

**Recommendation: neither, quite.** Default the size filter to **750 ml only**,
and show price-per-750ml as small grey text on each row. Reasoning: "under $30"
in an aisle means the sticker, so filter on the sticker — but without the size
default, a $29 handle of bottom-shelf gin outranks a $28 bottle of good gin on
price alone, and the list fills with noise. A "any size" toggle covers the case
where you actually want the handle.

This costs nothing to build and you can flip it after using it once.

</details>

### Still open, lower stakes

- **Which categories after gin, in what order?** Bourbon and rye are the obvious
  next two, but this is the whole point of the tool, so it should be your call.

---

## Part 4 — Build order

Revised from the handoff. Step 1 changes because of Finding 1; the old step 2
disappears because of Finding 3.

**1. Prove the lookup end-to-end, for one bottle.** ⟵ *do this first, it's the
whole risk*
Take one product code from the search index, ask the inventory endpoint about it
at your store, get a number back. This is already 80% proven — I ran it above and
got `quantity: 5` for code `010807` at store 219 — but it needs to run from our
own code, and it needs to confirm that codes from the search index work as
inventory codes across a handful of samples, not just the one I tried.
*If this fails, nothing else matters.*

**2. Build the catalog for gin.** Run the builder against the gin category.
Verify by hand that the size/price/code expansion in Finding 4 lines up — spot-check
five bottles against the ABC website. ~300 rows out, ~50 after filtering to
750 ml under $30.

**3. Draft the ratings.** ~40 labels. I write the first pass with scores, style
tags, and notes; you edit it. Expect to disagree with a third of it — that's the
point, and the `source` field tracks which rows you've touched.

**4. Build the page and the stock function.** The in-store experience, end to
end, with your store hardcoded as the default.

**5. Take it to a store.** Then decide what's actually missing, rather than
guessing now.

Steps 1–2 are a couple of hours. Step 3 is however long you want to spend
thinking about gin. Step 4 is the real build. Step 5 is the only honest
requirements document.

---

## Part 5 — When things break

These endpoints are undocumented and unsupported. They will break eventually.
The design's job is to fail legibly.

| What happens | What the page says | What actually breaks |
|---|---|---|
| ABC is down / no signal | "Can't reach ABC — showing ratings only, no stock" | Stock only. Ratings still work. |
| Rate-limited or challenged | "ABC is asking us to slow down. Try again in a minute." | Temporary. Backs off on its own. |
| Endpoint changed shape | "Something changed on ABC's end." | Needs a code fix. Offline half unaffected. |
| Search index changed | Nothing — page unaffected | The quarterly catalog rebuild. Fix at a desk. |
| Nothing in stock matches | "Nothing rated under $30 in stock here. Try $40?" | Nothing. Correct answer. |

The recurring theme: **the offline half keeps working when the online half
doesn't.** That's the deeper reason for the split, beyond avoiding fuzzy name
matching.

---

## Part 6 — Layout and posture

```
abc-guide/
  public/
    index.html          the page — layout, filtering, ranking
    shelf.json          generated: catalog + ratings, merged
  api/
    stock.js            the proxy: cache, throttle, back off
  data/
    catalog.json        generated by the builder — don't hand-edit
    ratings.json        hand-edited by Jeff — the actual product
  scripts/
    build-catalog.mjs   search index → catalog.json
    merge-shelf.mjs     catalog + ratings → shelf.json
  ARCHITECTURE.md
  abc-best-under-x-handoff.md
```

`ratings.json` is the only file whose contents can't be regenerated. Everything
else is derived and disposable.

**Posture toward Virginia ABC**, carried over from the handoff and from `vabc`,
which gets this right: identify honestly in the `User-Agent`, throttle, cache
aggressively, back off the moment we're asked to, never evade a challenge, never
write anything. This is one person checking stock at one store. Keep the request
volume looking like exactly that.

---

## Deferred (worth remembering, not worth building yet)

- **Pre-warming.** A scheduled job could refresh stock for your store every few
  hours so the page renders instantly from a snapshot. Better on bad signal,
  kinder to ABC. Only worth it once step 5 says the live fan-out feels slow.
- **A ratings editor.** A second page for editing scores and notes on the phone
  and exporting the file — beats hand-editing JSON. Worth it around the third
  category.
- **`storeNearby` is free.** The endpoint we're already calling returns nearby
  stores' counts alongside your store's, at no extra request cost. "Nobody
  nearby has it" comes almost for free later, despite being out of scope for v1.
- **A possible shortcut.** Search results carry a list of store numbers that
  looks like "stores that carry this." If it means what it appears to, the
  candidate list could be pre-filtered offline to what your store actually
  stocks, cutting the fan-out sharply. Unverified — needs a check against
  reality before trusting it.
