# Log Ask Mari questions to Airtable

**Date:** 2026-06-20
**Status:** Approved design, ready for implementation

## Goal

Capture every question visitors ask Ask Mari, tagged by outcome, so Mari can see what
people are curious about — and, crucially, which questions he *can't yet answer* (a
to-do list of Thoughts to add, closing the loop with the existing Thoughts → knowledge
pipeline).

## Decisions (from the plan + Mari's calls)

- **Log all questions, tagged by outcome** (`answered` / `unanswered` / `greeting`) — not
  unanswered-only. Same effort, filter anytime.
- **Log greetings too**, tagged `greeting`, so they can be filtered out but counted.
- **Store in Airtable** — a new `Questions` table in the existing base
  (`appOjONooljd6cwwi`, which already holds Places + Thoughts), reusing the write pattern
  from [log-thought/route.ts](../../../src/app/api/log-thought/route.ts).

## Architecture

### 1. Write helper — `src/lib/airtable-questions.ts`

Mirrors the read helper [airtable-places.ts](../../../src/lib/airtable-places.ts) and the
write in log-thought:

```ts
export type AskOutcome = "answered" | "unanswered" | "greeting";

export async function logQuestion(question: string, status: AskOutcome, topSource?: string): Promise<void>
```

- **Connect-to-activate:** no `AIRTABLE_TOKEN` → no-op (returns silently), like the others.
- **Skip junk:** empty or > 500 chars → no-op (matches the route's own input guard, so we
  never log rejected input).
- POST to `https://api.airtable.com/v0/appOjONooljd6cwwi/Questions` with
  `{ fields: { Question, Status, TopSource? }, typecast: true }`.
- **Never throws:** the whole body is wrapped so a network/Airtable failure can never
  surface — logging must not affect the visitor's answer.

### 2. Wire into `/api/ask`

The route ([route.ts](../../../src/app/api/ask/route.ts)) already knows the outcome at the
fork, *before* it streams. Log with Next's **`after()`** (from `next/server`) so the write
runs after the response is sent — zero added latency, and the function stays alive to
finish the write.

- Greeting branch → `after(() => logQuestion(last, "greeting"))`
- Out-of-scope branch (`chunks.length === 0`) → `after(() => logQuestion(last, "unanswered"))`
- Grounded branch → `after(() => logQuestion(last, "answered", sources[0]?.title))`

Early `400` rejects (empty / out-of-scope-by-length) are **not** logged — only real asks.

### 3. Airtable table (one-time setup by Mari)

Create a table named **`Questions`** in base `appOjONooljd6cwwi` with:
- **Question** — single line text
- **Status** — single select (`answered`, `unanswered`, `greeting`) — `typecast: true`
  lets the option values be created on first write
- **TopSource** — single line text (blank for greeting/unanswered)

Airtable's automatic **`createdTime`** is the timestamp — no Date field needed. Until the
table exists, `logQuestion` simply no-ops on the failed write (answers keep working).

## Privacy & safety

- Store only the question text, outcome, and (Airtable) timestamp. **No IPs, no identity.**
- It's a public box; people may type anything. The 500-char guard caps payloads; nothing
  is rendered back anywhere, so there's no injection surface.
- A separate **filtered view** in Airtable (`Status = unanswered`) gives the gap list.

## Testing

`src/lib/airtable-questions.test.ts` (mock `globalThis.fetch`):
- no token → `fetch` not called;
- empty / 501-char question → `fetch` not called;
- valid answered question → POSTs to the `Questions` URL with `Question`, `Status`,
  `TopSource` in the body;
- a thrown `fetch` is swallowed (no rejection).

Route stays covered by existing tests; the `after()` calls don't change responses.

## Verification

- Unit tests above.
- Live: POST a few questions to `/api/ask` (a greeting, an answerable one, an out-of-scope
  one) and confirm answers still stream normally — proving logging never blocks/breaks.
- After Mari creates the `Questions` table: re-run the three and confirm three rows appear
  with the right `Status`.

## Out of scope

- Frequency/dedup counting (every ask is its own row for now).
- Any UI surfacing of the questions (this is a private Airtable log).
- Rate-limiting / abuse handling beyond the existing length guard.
