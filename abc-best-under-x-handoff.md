# Handoff Spec: "Best Under $X" — Virginia ABC In-Store Finder

## Context for Claude Code

The person you're working with (Jeff) has no coding background. Explain technical
decisions in plain language, avoid jargon without a definition, and don't assume
familiarity with build tooling, package managers, or deployment. When you need a
decision from him, frame it in terms of tradeoffs he can actually evaluate
(speed, cost, hassle) rather than technical merit.

## The goal

Jeff walks into a Virginia ABC store. He opens a page on his phone, picks a
category and a price ceiling ("gin, under $30"), and immediately sees the
highest-rated products meeting those criteria **that are actually on the shelf
in that specific store right now**, sorted best-first.

That's it. Everything below serves that one interaction.

## Core architectural decision

Split the work into two halves that never run at the same time.

**Half 1 — the ratings table (offline, built once, updated rarely).**
A local data file mapping ABC product code → name, category, size, price, rating,
style tag. This is where all the messy, slow, error-prone work lives. It gets
built at a desk, gets eyeballed by a human, and gets corrected by hand.

**Half 2 — the live lookup (in the store, must be fast).**
Query Virginia ABC's inventory endpoint for a given store ID, get back product
codes and quantities, join against the local ratings table on product code,
filter, sort, display.

**Why this split is non-negotiable:** joining on product code is an exact match.
No fuzzy string matching at runtime, no chance of "Elijah Craig Small Batch" vs
`ELIJAH CRAIG SM BATCH BBN 750ML` failing in the aisle. All name-matching pain is
confined to the offline half where mistakes are visible and fixable.

## Data sources

**Virginia ABC public endpoints (unauthenticated, undocumented).**
Confirmed to exist and in use by third-party tools. Relevant surfaces:
- Product search — the site's Coveo search index
- Inventory and warehouse stock — endpoints under `/webapi/inventory/*`
- Store locator — Virginia VGIN's ArcGIS service

**Reference implementation to read before writing anything:**
`github.com/rnwolfe/vabc` — an MIT-licensed Go CLI that already does live product
search, per-store inventory, warehouse stock, and store lookup against these
endpoints. Even though this project won't be written in Go, read that code to
learn the actual request shapes, parameter names, and response formats. It will
save hours of guessing. It self-throttles and adds no scraping evasion — match
that posture.

**Quarterly catalog dump.** Virginia ABC publishes a full product price list as a
downloadable Excel file (and PDF). ~4,000 products with prices. This is the
seed for the ratings table — start here rather than crawling the catalog.

**Prior art worth a look:** `vabourbon.com` takes periodic snapshots of VA ABC
whiskey inventory and tracks distribution over time. It does not do the ratings
side, but it's a working example of the inventory half.

## Ratings: the honest part

There is no clean automated source. Bulk-scraping review sites is legally murky
and technically annoying, and "best gin under $30" web results are affiliate-link
listicles written to sell, not to inform.

The accepted approach: **semi-manual, per category.** The set of gins under $30
sold in Virginia is roughly 40 products and barely changes year to year. Draft
ratings from general consensus, then have Jeff sanity-check and adjust. His
judgment is the product; treat the table as a first draft for him to edit, not
as authoritative output.

Schema note: use **two fields, not one** — a general score (numeric) plus a style
tag (e.g. juniper-forward London dry vs. contemporary/floral). "Best" in gin is
style-dependent, and a single number hides that.

## Build order

1. **Prove the inventory endpoint works.** A throwaway script: given a store ID,
   print what's in stock. Nothing else. If this doesn't work, nothing else matters.
2. **Build the seed catalog.** Parse the quarterly Excel dump into a clean local
   file: product code, name, category, size, price.
3. **Rate one category.** Gin only. ~40 rows. Get Jeff to review the table.
4. **Build the page.** Mobile-first web page: category picker, price slider,
   store selector (hardcoded dropdown to start), results sorted by rating with
   "N in stock" shown.
5. **Use it in a real store.** Then decide what's actually missing.

## Technical constraints

- **Web page, not a native mobile app.** No app store, no install, editable in
  five minutes, works on his phone. A native app triples the work for no benefit.
- **Mobile-first layout.** The only real usage context is one-handed, in a store,
  possibly on bad signal.
- **Store selection: dropdown first.** Geolocation → nearest store is a nice
  later addition, not part of the first version.
- **Be a courteous client.** Throttle requests, cache where sensible, don't
  hammer a state agency's public endpoints. These are undocumented and can change
  or disappear without notice — fail gracefully and tell the user plainly when
  the upstream is unreachable rather than showing stale data as if it were live.

## Explicitly out of scope for v1

- Live web search for "best X under $Y" at request time
- Fuzzy name matching at runtime
- Multiple stores at once / "which store near me has the best option"
- Price-drop or new-arrival alerts
- Categories beyond gin
- Any account system, login, or multi-user support

## Open questions for Jeff

- Which ABC store is the default (the one he actually shops at)?
- Which categories after gin, in what order?
- Does he want size normalization (750ml vs 1.75L price-per-ounce), or is
  sticker price under $X sufficient?
