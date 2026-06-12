# Travel pin map — design

Approved 2026-06-12. Replaces the static state-chip list and the wishlist chip
wall on `/travel` with one interactive, zoomable D3 map of every place Mari has
checked in, reviewed, or saved.

## Decisions
- **Geocoding:** free OSM Nominatim, one-time script, results written back to
  Airtable. No paid APIs.
- **Map tech:** extend the existing custom D3 India map (d3-zoom). No tiles.
- **Wishlist roulette reminder:** parked (roadmap).
- **Phase 2 (build right after the map):** `/api/nearby` + "Saved near me?"
  iOS Shortcut.

## Part 1 — geocoding (`scripts/geocode-airtable.mjs`)
- Read all Airtable `Places` rows missing Lat/Lng (token from `.env.local`).
- Query Nominatim with `Name, Region` (+ country hint from Region: India
  default, Vietnam/USA lists theirs). 1 req/sec; every result cached in
  `scripts/.geocode-cache.json` (gitignored) so re-runs are instant.
- **Bbox guard:** accept a hit only if it falls inside the bounding box of the
  pin's expected state (bboxes computed from the states TopoJSON; Region string
  → state via its last comma part). Prevents wrong-city matches.
- **Misses:** set to the state centroid plus a small deterministic offset
  (hash of name), and `Approx` checkbox = true in Airtable → drawn as hollow
  "approximate" pins. Nothing is dropped.
- PATCH coordinates back in batches of 10 (Airtable limit).

## Part 2 — `TravelPinMap` (client component)
- Base: existing states TopoJSON + visited-state tint (kept).
- d3-zoom: wheel/pinch/drag, scaleExtent ~[1, 25], plus +/− and reset buttons.
- **Pins:** pine = been (check-ins/reviews, i.e. no tag or tag `been`),
  terracotta = `on the list`, ♥ glyph = `loved it`, hollow = approximate.
- **Clustering:** screen-space grid clustering at low zoom (numbered bubbles);
  click a cluster → zoom into its extent; clusters dissolve as zoom increases.
- **Popup (click a pin):** name, region, tag badge, then one line by priority:
  `food → note/review → fact`. Check-ins also show ★rating and date.
- **Beyond India:** Vietnam/USA pins render as a small card strip below the map.
- `/travel` layout becomes: pin map (hero) → Lately saved feed (kept) →
  Postcards. Static zone chips + wishlist chips removed.

## Part 3 — facts backfill
Hand-written one-line facts for confidently-known places (monasteries, famous
restaurants, falls/forts) batch-written into empty Airtable Notes. Formulaic
fallback in the popup for the rest: "On the list — saved for the next
<region> run." No invented claims about obscure spots.

## Phase 2 — vicinity nudge
- `POST /api/nearby` `{ secret, lat, lng }` (same LOG_SECRET guard) → 5 nearest
  wishlist places within 25 km (haversine), name + region + tag + distance.
- iOS Shortcut "Saved near me?": Get Current Location → POST → show result
  as notification.

## Testing
Unit: bbox validator, region→state parsing, cluster grouping, popup-line
priority. Gate: tsc + vitest + production build before push.
