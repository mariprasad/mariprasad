# Ask Mari — honest mountaineering answers ("the trek that broke me")

**Date:** 2026-06-19
**Status:** Approved design, ready for implementation plan

## Goal

When Ask Mari is asked *"a trek that really broke you?"* (or hardest / most
challenging trek), it currently answers with **Hidlumane Falls** and **Z Point** —
easy treks pulled from the saved-places list — because those are the only concrete,
named trek chunks in the knowledge index, and they literally contain the word
"trekking". The genuinely demanding experiences live in a single dry sentence with no
difficulty or story, so the model has nothing true to say about them.

This fixes the *knowledge*, not the model: give the real mountaineering experiences
their own richly-textured entries so they retrieve for "broke you / hardest / failed"
questions and let Ask Mari answer honestly.

## Diagnosis (confirmed)

- The Hidlumane / Z Point answers come from [`collectPlaces()`](../../../src/lib/knowledge/sources/places.ts)
  (Airtable saved places, tag "been"): e.g. `"Z Point Trekking Peak — in Malnad,
  Karnataka. (been)."`. They are real places Mari has been; they just shouldn't *win*
  the "broke you" question.
- Mari's mountaineering is one line in [`collectMovement()`](../../../src/lib/knowledge/sources/static.ts):
  *"I hold a basic mountaineering certificate from ABVMAS, Himachal. I've trekked up to
  15,500 ft and finished my first 10k trail run."* — no texture, so it never wins and
  gives the model no substance.

## Decisions (from brainstorming)

- **Approach 1: split `collectMovement()` into three focused docs**, one embedding each,
  so the Yunam doc retrieves independently. (Rejected: one enriched paragraph — dilutes
  the embedding; MDX notes on the site — out of scope, much bigger change.)
- **Framing "broke me" = Yunam (the honest gut-punch)**, with Shitidhar as the proud-but-
  understated counterpoint. Tone is deliberately *not* boastful — "I chose to do this, I
  nearly quit because nothing forced me to, and I'm simply happy I did it."
- **Facts (confirmed with Mari):**
  - ABVMAS basic mountaineering course — Himachal, **2023**; its big climb was **Mt.
    Shitidhar** (a 17,060 ft peak above the Beas Kund glacier). Mari reached **~15,500 ft**
    on it (the highest he's stood) — **did not** tag the 17,060 ft summit.
  - **Yunam Peak** — Himachal / Lahaul, **2025**. Drove to base camp by van, hadn't
    acclimatised, altitude hit as acidity/nausea, **turned back from base camp before the
    summit push**. Did not summit.
- The existing **"15,500 ft" milestone is correct** (highest stood) and is left unchanged.

## Architecture

[`collectMovement()`](../../../src/lib/knowledge/sources/static.ts) returns **three**
`RawDoc`s instead of one. All use `source: "movement"`, `url: "/movement"`, and stable
ids. No other source, pipeline, or schema change. After the source change, the index is
rebuilt so the new text gets embedded.

### The three docs (final, approved copy)

**`movement:overview`** — title "Movement"
> Movement keeps me honest — running, trekking, and time in the mountains. I hold a basic
> mountaineering certificate from ABVMAS in Himachal, and I finished my first 10k trail
> run. The mountains are where I feel smallest, and the most awake.

**`movement:shitidhar`** — title "Mt. Shitidhar — the hardest I've climbed"
> In 2023 I did my basic mountaineering course with ABVMAS in Himachal. The big climb was
> Mt. Shitidhar — a 17,060 ft peak above the Beas Kund glacier — and I made it to about
> 15,500 ft, the highest I've ever stood. Thin air, slow steps, the whole world gone quiet
> and white. There were stretches where I wanted to quit and just take it easy; no one made
> me come up here, so part of me kept asking what the point was. But I kept moving, and I'm
> simply happy I did it. You choose to do these things — that's the whole point of them.

**`movement:yunam`** — title "Yunam Peak — the trek that broke me"
> Yunam Peak, in Himachal's Lahaul, is the one that broke me. In 2025 we drove up to base
> camp by van — and that was the mistake. I hadn't acclimatised; the altitude hit me as
> acidity and nausea, and I turned back from base camp before the real summit push ever
> began. I didn't make it. It's the hardest lesson the mountains have taught me: respect
> the altitude, give the climb its time. I want to go back and finish it right.

Each doc stays a single chunk (well under the chunker's cap), so its id is stable
(`movement:overview` / `movement:shitidhar` / `movement:yunam`) and Ask Mari's source
chip dedups to one `/movement` link.

## Rebuild & verification

- **Rebuild the index:** `npm run build:knowledge` (re-embeds only the changed/new movement
  chunks via the cache in [build-knowledge.ts](../../../scripts/build-knowledge.ts)).
  Requires `OPENAI_API_KEY` — checked in `.env.local` first. If the key is unavailable
  locally, the change still lands in source and the **nightly CI re-index** picks it up;
  this limitation is called out rather than faked.
- **Behavioural check:** with the rebuilt index, query *"a trek that really broke you?"*
  against `retrieve()` (and/or the live `/api/ask`) and confirm the top hit is
  `movement:yunam`, not the Hidlumane / Z Point place chunks. Spot-check a couple of
  phrasings ("hardest trek", "a trek you didn't finish").

## Testing

Extend [static.test.ts](../../../src/lib/knowledge/sources/static.test.ts):

- `collectMovement()` returns exactly three docs with ids `movement:overview`,
  `movement:shitidhar`, `movement:yunam`, each `source: "movement"`, `url: "/movement"`.
- The `movement:yunam` doc's text contains the failure language retrieval leans on
  (e.g. matches `/broke me/i` and `/turned back/i`).
- The `movement:shitidhar` doc names the course/peak (`/ABVMAS/`, `/Shitidhar/`) and the
  `15,500` figure.

These are pure-function assertions — no embeddings, no network — so they run in the
normal `vitest run`.

## Out of scope

- The movement **page** UI (`/movement`) — this is an Ask Mari / knowledge change only.
- The Hidlumane / Z Point **place entries** — left as-is (real places).
- The **profile "15,500 ft" milestone** — confirmed correct.
- Pointing Ask Mari source chips at a specific ride deep-link — that's the *next* queued
  task, tracked separately.
