# "This very site" — Work-section devlog

**Date:** 2026-06-18
**Status:** Approved design, ready for implementation plan

## Goal

Give mariprasad.com itself a home in the Work section: a "This very site" block on
`/work` with a short intro, a tech-chip row, and a list of **running notes** — short
first-person essays about how the site was built (Ask Mari search, the nightly
re-index, phone capture, the grounding rule), in the same spirit as the Bakery's
running notes. The build notes also feed Ask Mari, so a visitor can ask "how did you
build this?" and get an answer in Mari's voice.

## Decisions (from brainstorming)

- **Placement:** its own "This site" block on `/work`. The professional flight-search
  project stays the featured one.
- **Separation:** notes get a `category` (`"baking" | "build"`), defaulting to
  `"baking"` so existing notes need no change. Pages filter by category. Both kinds
  still live in `src/content/notes/` and render at `/notes/<slug>`.
- **Feed search:** yes — build notes are indexed by the existing `collectNotes()`
  adapter (no change), so Ask Mari can field "how does the search work?" etc.
- **Seed notes:** four, listed below.

> The rotating Ask-Mari placeholder is a separate change already shipped; it is **not**
> part of this spec.

## Architecture

### Note categories

`NoteMeta` (in `src/lib/content.ts`) gains an optional field:

```ts
export type NoteMeta = {
  title: string;
  date: string;
  summary: string;
  category?: "baking" | "build"; // defaults to "baking" when absent
};
```

- `getNote()` normalizes a missing category to `"baking"` so consumers always see one.
- New helper `getNotesByCategory(category: "baking" | "build"): Note[]` —
  `getAllNotes().filter((n) => n.meta.category === category)`.
- `getAllNotes()` is unchanged (still returns all, newest-first).

### Page wiring

- **Baking page** (`src/app/baking/page.tsx`): swap `getAllNotes()` →
  `getNotesByCategory("baking")` for the "Baking notes" list, so build notes never
  appear there.
- **Work page** (`src/app/work/page.tsx`): add a new **final** section, "This very
  site" — but **visually highlighted** so it draws the eye and pulls clicks despite
  being last (a plain list here would get scrolled past). Treatment:
  - Wrap the whole block in a distinct **accent panel** that stands out from the plain
    sections above — a tinted card using the site's existing accent language
    (e.g. `rounded-2xl border border-pine/30 bg-pine/5 p-7`, the same family as the
    Bakery's "Yeast or sourdough?" cards), so it reads as a deliberate highlight.
  - An inviting heading ("This very site") + a one-line teaser that provokes curiosity
    about the build (e.g. "That Ask box on the home page? I built it to answer in my
    own words. Here's how — and the rest of the machinery behind this site.").
  - A tech-chip row: Next.js · OpenAI embeddings · Airtable · GitHub Actions · iOS Shortcuts.
  - The running notes from `getNotesByCategory("build")` rendered as **clickable cards**
    (a small grid like the Bakery's "Yeast or sourdough?" choices — title + summary,
    hover state, terracotta "→"), not a flat left-border list — so each clearly invites
    a click through to `/notes/<slug>`.
  - A prominent "Ask it something →" call-to-action linking to the homepage Ask box
    (`/#ask-mari-slot`).

### Search

`collectNotes()` is unchanged — it already reads every file in `src/content/notes/`,
so the four build notes are indexed on the next rebuild (`npm run build:knowledge`,
nightly in prod). No adapter change.

## The four seed notes

MDX files in `src/content/notes/`, frontmatter `category: build`, first-person voice
matching the Bakery notes (what I worked out + a bit of story). Proposed slugs/titles:

1. `talk-like-me.mdx` — **"Teaching the site to talk like me"** — the grounded Ask Mari
   search: embeddings over everything I've written, answers only from my own words.
2. `nightly-reindex.mdx` — **"A nightly robot that re-reads everything"** — the GitHub
   Actions cron that rebuilds the knowledge index so new places/thoughts show up.
3. `site-from-my-phone.mdx` — **"Talking to my site from my phone"** — the iOS Shortcut
   + the server-side `log-place` / `log-thought` endpoints behind a shared secret.
4. `never-googles.mdx` — **"Why it never Googles anything"** — the grounding / honesty
   boundary: in-voice answers from my own content, a warm shrug when it doesn't know,
   never the open web.

Each: `title`, `date` (2026-06-18), `summary`, `category: build`, then a few short
paragraphs. Content drafted during implementation, reviewed before commit.

## Testing

vitest (`src/lib/content.test.ts`):

- A note with no `category` in frontmatter reads back as `category: "baking"`.
- `getNotesByCategory("build")` returns only build notes; `("baking")` excludes them.
- After the seed notes land: `getNotesByCategory("build").length >= 4`, and none of the
  existing baking notes appear in the build list.

No new test infra; reuse the existing content tests.

## Out of scope

- Homepage changes (the Work section lives on `/work`).
- The rotating placeholder (already shipped).
- A separate `/devlog` route — build notes reuse `/notes/<slug>`.
