# Shareable per-ride links on /movement

**Date:** 2026-06-19
**Status:** Approved design, ready for implementation plan

## Goal

Make a single ride (or run/hike) on `/movement` directly linkable, so a link like
`/movement?route=<id>` opens that ride's existing detail modal — its animated map,
stats, and photos — on arrival. Today the routes in
[`RouteExplorer`](../../../src/components/movement/RouteExplorer.tsx) open in a modal
driven purely by `useState`, with no URL, so the only shareable thing is the whole
`/movement` page.

The motivating case: when "Ask Mari" is asked about a specific ride, its source chip
should be able to point at *that ride* rather than the whole Movement page. (Wiring the
Ask Mari chip to use these links is a **follow-up**, out of scope here — this spec just
makes the per-ride URL exist and work.)

## Decisions (from brainstorming)

- **Option A — query param**, not a dedicated `/movement/ride/<id>` page and not a hash.
  Link shape: `/movement?route=<id>`, where `<id>` is the existing, stable
  `StravaRoute.id` (the Strava activity id, e.g. `17974366689`). No id generation, no
  new data.
- **Client-side handling**, not the Server-Component `searchParams` prop. The whole site
  is statically prerendered; reading `searchParams` in the page would make `/movement`
  the one dynamically-rendered page just to open a modal. Keeping the deep-link a
  client concern preserves static prerendering.
- **Read the param from `window.location` in a mount effect**, *not* `useSearchParams`.
  > **Implementation note (changed from the original design):** the first cut used
  > `useSearchParams()` + a `<Suspense>` boundary. In this Next 16.2.7 setup that combo
  > **broke hydration** of the whole `RouteExplorer` subtree — it rendered but never
  > attached event handlers (filter pills and the close button were dead; verified via
  > missing React fibers). Switching to `new URLSearchParams(window.location.search)`
  > inside a `useEffect` fixed it, and is *simpler*: server and first client render both
  > start closed (no mismatch), and the page needs **no Suspense boundary** and no
  > `useSearchParams`. The accepted one-frame modal pop-in on a shared link is inherent
  > to reading the URL after mount.
- **`replaceState`, not `pushState`**, for the interactive URL sync. Opening/closing a
  ride must not spam browser history, and must not trigger a Next navigation / RSC
  refetch. Consequence: the back button leaves the page rather than closing the modal —
  accepted for a static gallery.

## Architecture

All component logic stays inside the existing
[`RouteExplorer`](../../../src/components/movement/RouteExplorer.tsx) (already a
`"use client"` component). [`movement/page.tsx`](../../../src/app/movement/page.tsx) is
**unchanged** — no Suspense wrap needed. No data, API, or schema changes.

### 1. Arrival — open the modal from the URL

- A mount `useEffect` reads `new URLSearchParams(window.location.search).get("route")`;
  if `findRoute` matches, it `setOpen`s that ride. Runs once (empty deps). `open` itself
  initialises to `null`, so the server HTML and first client render agree (no hydration
  mismatch).
- The matching ride opens regardless of the active type filter — `open` is independent
  of the filtered grid, so a deep-link to a hidden-by-filter ride still works.

### 2. Interaction — keep the URL in sync

- `open` (the existing `useState`) is the interactive source of truth.
- When `open` changes, sync the URL with **`window.history.replaceState`** — no Next
  navigation, no RSC refetch:
  - opening a ride → `…/movement?route=<id>`
  - closing → back to `…/movement` (param removed)
- Built from `window.location` (`search` + `pathname`), preserving any other params.
- A `useRef` guard skips the effect's mount run so it can't strip the deep-link param
  that the arrival effect (§1) is about to honour.

### 3. Copy-link affordance

- A small **"Copy link"** button in the modal header, beside the close button.
- Builds `${window.location.origin}${window.location.pathname}?route=${open.id}`, writes
  it via `navigator.clipboard.writeText`, then shows **"Copied ✓"** for ~1.5s. The label
  is gated on `copiedId === open.id`, so it resets naturally when a different ride opens.
- This is how Mari grabs a ride's URL to paste anywhere; it is the same URL that
  section 1 auto-opens.

### 4. No Suspense boundary

- Because the param is read from `window.location` (not `useSearchParams`), the page has
  no client hook that forces a prerender bailout — so **no `<Suspense>` boundary is
  needed** and `/movement` stays statically prerendered (confirmed: `next build` reports
  it as `○ (Static)`). This also sidestepped the hydration breakage the `useSearchParams`
  + Suspense combo caused here (see the Implementation note under Decisions).

### 5. Edge cases

- **Unknown / malformed `?route=` id** → no match; modal stays closed; page renders
  normally; no error.
- **Param ride hidden by the active type filter** → still opens (see §1).
- **No clipboard API** (insecure context / old browser) → the copy handler no-ops
  gracefully (guard `navigator.clipboard`); never throws.

### Helper to extract

A pure `findRoute(routes, id)` (returns the match or `undefined`) so the
param→route lookup is testable without the router. Lives in
[`src/lib/strava-map.ts`](../../../src/lib/strava-map.ts), alongside the other route
utilities (`staticRouteUrl`, `typeIcon`, `prettyDate`) that `RouteExplorer` already
imports from there.

## Testing

- **Unit (vitest):** `findRoute(routes, id)` — match, no-match, empty list. This is the
  only logic worth isolating from the router.
- **Manual (dev server):**
  - `/movement?route=<real-id>` → modal auto-opens on that ride.
  - Click a card → URL gains `?route=<id>`; close → URL returns to `/movement`.
  - "Copy link" → clipboard holds `…/movement?route=<id>`; button flips to "Copied ✓".
  - `/movement?route=garbage` → no crash, nothing opens.
- **Build:** run `next build` and confirm `/movement` is still prerendered `○ (Static)`.
- **Hydration:** in the dev preview, confirm the explorer's filter pills and close button
  actually respond (the `useSearchParams`+Suspense regression rendered them inert).

## Out of scope

- Pointing the "Ask Mari" Strava/movement **source chip** at a specific ride — a
  follow-up that consumes these links.
- A dedicated per-ride **page/route** (`/movement/ride/<id>`) with its own social
  preview metadata (Option B).
- `pushState` / back-button-closes-modal behavior.
- The Yunam Peak "trek that broke you" **content fix** — tracked separately as the
  knowledge-coverage thread.
