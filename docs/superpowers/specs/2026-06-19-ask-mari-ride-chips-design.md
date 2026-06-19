# Ask Mari source chips → specific ride deep-links

**Date:** 2026-06-19
**Status:** Approved design, ready for implementation

## Goal

When Ask Mari cites a specific ride, its source chip should jump straight to that ride on
`/movement` (opening the map + stats + photos via the `?route=<id>` deep-link shipped
earlier) instead of landing on the whole Movement page. This is the original thread that
started the deep-link work.

## Diagnosis (confirmed)

- Ask Mari only knows *specific* rides through the two **personal-best records** emitted by
  [`collectStrava()`](../../../src/lib/knowledge/sources/strava.ts) — "Longest ride" and
  "Longest walk". The 75 individual `STRAVA_ROUTES` are **not** indexed (only the stats
  overview + the 2 records are).
- Every movement/strava chunk currently has `url: "/movement"`, so the chip can only link
  to the page.
- The frontend chip is a plain `<a href={s.url}>` ([AskMari.tsx:49](../../../src/components/ask/AskMari.tsx)),
  so a `url` of `/movement?route=<id>` flows through with **no frontend change**.
- Record↔route overlap is partial: "Longest ride" (id `9453574948`, *Ride to Gudibanda*)
  **is** a route → deep-linkable; "Longest walk" (id `8722008778`) is **not** in the routes
  list → a deep-link there would open nothing.

## Decisions (from brainstorming)

- **Option A**: deep-link only the **record** chunks, and only when the record's activity is
  actually a route. (Rejected: B — also index the 2 photo rides, net-new content for only 2
  of 75; C — index all 75, retrieval noise.)
- **Graceful fallback**: a record whose id is not a known route keeps `url: "/movement"`, so
  there are never dead deep-links. Data-driven — if that activity later joins the routes
  list, it upgrades automatically.

## Architecture

### 1. Shared helper (one source of truth for the deep-link shape)

Add to [strava-map.ts](../../../src/lib/strava-map.ts), beside `findRoute`:

```ts
export const routeHref = (id: string): string => `/movement?route=${id}`;
```

Point `RouteExplorer`'s copy-link at it too — `${window.location.origin}${routeHref(open.id)}`
— so the `?route=` shape isn't duplicated. Pure and unit-tested.

### 2. `collectStrava()` record URLs

Build a `Set` of route ids once from `STRAVA_ROUTES`, then per record:

```ts
url: routeIds.has(r.id) ? routeHref(r.id) : "/movement"
```

The overview chunk is unchanged (`/movement`). No change to record `text`, ids, titles, or
any other source.

### 3. Rebuild

`npm run build:knowledge`. Only the record chunks' **url** changes; their **text** is
unchanged, so the incremental builder reuses cached embeddings (0 re-embeds for these). The
rewritten index carries the new urls.

## Verification

- `retrieve("your longest ride")` → the "Longest ride" chunk now has
  `url: "/movement?route=9453574948"`; "Longest walk" stays `/movement`.
- Live `/api/ask` "what's your longest ride?" → the source chip points at the ride; opening
  the URL pops the Gudibanda ride modal (the shipped deep-link).

## Testing

- **strava-map.test.ts**: `routeHref("123")` === `"/movement?route=123"`.
- **strava.test.ts**: a record whose id is in `STRAVA_ROUTES` gets the deep-link url; the
  "Longest walk" record (id not in routes) keeps `/movement`; the overview keeps `/movement`.
- Pure-function assertions — no embeddings/network — run under normal `vitest run`.

## Out of scope

- Frontend chip rendering (already renders `s.url`).
- Indexing individual routes (Options B/C).
- The movement page UI and the knowledge "broke me" content (already shipped).
