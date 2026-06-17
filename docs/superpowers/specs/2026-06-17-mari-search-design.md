# Ask Mari — grounded "talk to me" search

**Date:** 2026-06-17
**Status:** Approved design, ready for implementation plan

## Goal

Turn everything on the site — recipes, baking notes, cricket, travel, work, movement,
saved places, films, runs, music, and loose thoughts — into a single searchable
knowledge base, and let a visitor ask questions and get answers **in Mari's voice**.
It should feel like talking to Mari, not querying a database. Answers come **only** from
Mari's own content; the feature never reaches the open web.

This replaces the current "Ask Mari" box, which answers from a hand-written ~30-line
corpus (`src/data/about-corpus.ts`) fed wholesale to `gpt-4o-mini`.

## Decisions (from brainstorming)

- **Sources:** all of them — local repo content + live feeds (Airtable places,
  Letterboxd, Strava, Spotify) + a new Airtable "Thoughts" table.
- **Voice:** grounded, but in Mari's voice. Answer from real content; when something
  isn't covered, decline like a person would and redirect — never invent facts.
- **Retrieval:** build-time embeddings into a static JSON index (no database). Each
  question retrieves the few most relevant chunks, then the model answers from those.
- **No web access. Ever.** The UI says so explicitly.
- **No meat-content restriction.** (Earlier India-sensitivity boundary was lifted by
  Mari on 2026-06-17 — minimal userbase, not social media. Meat incl. beef is fine.)
- **Text first.** Voice answering/asking is a deliberate Phase 2 additive layer, never
  voice-only.
- **Visitor "share a thought"** capture is deferred to Phase 2.

## Architecture

### One common shape

Every source is normalized into a uniform record so the rest of the pipeline is
source-agnostic:

```ts
type KnowledgeChunk = {
  id: string;          // stable, e.g. "recipe:sourdough#2"
  source: "recipe" | "note" | "place" | "film" | "cricket"
        | "travel" | "work" | "movement" | "profile" | "thought";
  title: string;       // human label, e.g. "One-Day Sourdough"
  text: string;        // the chunk's prose (what gets embedded + shown to the model)
  url?: string;        // link to the real page, for source chips
  date?: string;       // ISO, when known
  vector: number[];    // embedding (added by the build step)
  hash: string;        // content hash of `text`, for incremental re-embedding
};
```

### Data flow

**Build step — `scripts/build-knowledge.mjs`**
1. Each source adapter returns `RawDoc[]` (everything except `vector`/`hash`).
2. Long docs (recipes, notes) are chunked into section/paragraph-sized pieces.
3. For each chunk, compute `hash`. If an existing index already has that hash, reuse its
   vector (incremental — only new/changed chunks are embedded).
4. Embed new/changed chunks with OpenAI `text-embedding-3-small`.
5. Write `src/data/knowledge-index.json` (array of `KnowledgeChunk`). This file is a
   generated artifact — never hand-edited.

**Answer step — `POST /api/ask` (edge)**
1. Validate/throttle (keep existing abuse caps: max messages, max chars).
2. Embed the visitor's latest question.
3. Cosine-similarity against the in-memory index → take top-`k` (~6) above a relevance
   threshold.
4. **If nothing clears the threshold:** return a graceful, in-voice deflection with 2–3
   example prompts ("Ah, I wish I could help with that one — not really my world. But ask
   me about a 72-hour sourdough, a trek in Himachal, or why I bowl fast…"). Vary the
   wording so it never feels canned.
5. **Otherwise:** build the system prompt (persona + retrieved chunks + rules), stream the
   answer from `gpt-4o-mini`, and attach the retrieved chunks' `{title, url}` so the UI can
   render source chips.

### Components & interfaces

- `src/lib/knowledge/types.ts` — `RawDoc`, `KnowledgeChunk`, `RetrievedChunk`.
- `src/lib/knowledge/sources/*.ts` — one adapter per source, each exporting
  `collect(): Promise<RawDoc[]>`. Pure and independently testable. Adapters:
  recipes, notes, cricket, travel, work, movement, profile, places, films, strava,
  spotify, thoughts.
- `src/lib/knowledge/chunk.ts` — splits long docs into chunks.
- `scripts/build-knowledge.mjs` — orchestrates collect → chunk → (incremental) embed →
  write JSON.
- `src/lib/knowledge/retrieve.ts` — `retrieve(question, k)`: embeds query, ranks by
  cosine similarity, returns chunks above threshold. Edge-compatible (loads the JSON,
  pure math).
- `src/lib/ask-prompt.ts` — `buildSystemPrompt(chunks)` (replaces the static-corpus
  version) and the out-of-scope deflection copy.
- `src/app/api/ask/route.ts` — wires retrieve → prompt → stream; keeps abuse caps.
- `src/components/ask/AskMari.tsx` — new microcopy + source chips under answers.

### Embedding storage

A single static JSON shipped with the build. ~300 chunks × 1536 floats ≈ ~1.8 MB.
The edge function loads it once and does cosine in memory. Scales to a few thousand
chunks before we'd reconsider (compression / on-disk store). No vector DB.

### Freshness

- **Repo content** changes only on deploy → a `prebuild` step regenerates the index every
  deploy.
- **Live sources** (places, films, strava, spotify, thoughts) change without a deploy →
  a **nightly scheduled rebuild** refreshes them. Incremental embedding keeps this cheap.
- If a source's token (e.g. `AIRTABLE_TOKEN`) is unset, that adapter returns `[]` and the
  source is simply absent — same graceful pattern the site already uses.

## Voice & prompt

System prompt assembled per request from:
- **Identity:** Mari, first person, warm, dry, concise (usually 1–3 sentences). Bowls
  fast, bakes slow. Based in Bengaluru. Engineer/tech-lead. 185 cm, 75 kg (as of May
  2026). Tagline: "still chasing pace, still waiting on dough."
- **Grounding rules:** answer ONLY from the provided chunks; never invent dates, scores,
  place names, ratings, or opinions not present; never use outside/web knowledge.
- **Honesty boundary:** if the chunks don't cover it, decline in-voice and redirect with
  real example prompts (the deflection above).
- **Voice calibration:** seed the prompt with a couple of short verbatim lines from Mari's
  own notes so cadence mirrors him, not a generic assistant.

**Source attribution:** chips are built by *us* from the retrieved chunks
(`{title, url}`), not written by the model — so links are always real.

**Fate of `about-corpus.ts`:** retired. Its factual content is already covered by the
per-source adapters (cricket, work, travel, movement, profile). The fixed identity/voice
block moves into `buildSystemPrompt`. `ask-prompt.ts` stops importing `ABOUT_CORPUS`.

## Testing

vitest (already in the repo):
- Each adapter: normalizes its source into valid `RawDoc`s (shape, required fields).
- `chunk.ts`: long doc splits as expected; short doc stays whole.
- `retrieve.ts`: ranking + threshold against a small fixture index.
- `ask-prompt.ts`: prompt includes retrieved context and enforces grounding rules; the
  out-of-scope path returns a deflection with example prompts.

## Cost

- `text-embedding-3-small`: ~$0.02 / 1M tokens. ~300 chunks per full rebuild is fractions
  of a cent; nightly incremental runs embed only what changed.
- Per question: one query embedding + one `gpt-4o-mini` completion over ~6 chunks —
  cheaper than today's whole-corpus stuffing, and it stays flat as content grows.

## Out of scope for Phase 1 (Phase 2 backlog)

- Voice **capture**: iOS Shortcut (dictate → text → POST to Thoughts table).
- Voice **answers**: TTS on output, STT on input — additive layer over the text pipeline.
- Visitor "leave a thought" guestbook (open write endpoint → needs spam protection).
- Possible dedicated search page; model upgrades.

## New Airtable "Thoughts" table (Mari to create)

Read-only token already exists; table creation is manual in the Airtable UI. Suggested
fields:
- `Thought` (long text) — the note itself.
- `Topic` (single line / single select) — optional tag, e.g. "baking", "cricket", "life".
- `Date` (date) — optional; defaults to created time.

The thoughts adapter reads this table; it works (returns `[]`) even while the table is
empty or absent.
