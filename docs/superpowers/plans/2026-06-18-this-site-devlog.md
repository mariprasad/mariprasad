# "This very site" Devlog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a highlighted "This very site" block to `/work` that lists first-person "build" running notes about how the site works, kept separate from baking notes via a note `category`, and fed into Ask Mari.

**Architecture:** `NoteMeta` gains an optional `category` (`"baking" | "build"`, default `"baking"`). A `getNotesByCategory()` helper lets the Bakery page show baking notes and the Work page show build notes; both render at `/notes/<slug>` (made category-aware) and are indexed by the existing search adapter.

**Tech Stack:** Next.js 16 (App Router, server components), gray-matter (frontmatter), vitest, MDX.

**Spec:** `docs/superpowers/specs/2026-06-18-this-site-devlog-design.md`

---

## Conventions

- Path alias `@/*` → `src/*`. vitest globals (`test`, `expect`) need no import.
- Notes live in `src/content/notes/*.mdx`, loaded by `src/lib/content.ts`.
- Run one test file: `npx vitest run src/lib/content.test.ts`. All tests: `npm test`.
- The dev server is managed via the preview tools; the controller handles live checks.

## File map

| File | Change |
|------|--------|
| `src/lib/content.ts` | Add `category` to `NoteMeta`; default it in `getNote`; add `getNotesByCategory` |
| `src/lib/content.test.ts` | Tests for the default + the category filter + build notes present |
| `src/content/notes/talk-like-me.mdx` | New build note |
| `src/content/notes/nightly-reindex.mdx` | New build note |
| `src/content/notes/site-from-my-phone.mdx` | New build note |
| `src/content/notes/never-googles.mdx` | New build note |
| `src/app/baking/page.tsx` | Filter the notes list to `getNotesByCategory("baking")` |
| `src/app/notes/[slug]/page.tsx` | Category-aware eyebrow label + back link |
| `src/app/work/page.tsx` | New highlighted "This very site" section |
| `src/data/knowledge-index.json` | Regenerated so build notes feed Ask Mari |

---

## Task 1: Note `category` + `getNotesByCategory` helper

**Files:**
- Modify: `src/lib/content.ts`
- Test: `src/lib/content.test.ts`

- [ ] **Step 1: Add the failing tests**

Append to `src/lib/content.test.ts` (keep the existing tests; add this import line at the top alongside the existing import):
```ts
import { getNote, getNotesByCategory } from "./content";

test("a note without a category defaults to baking", () => {
  expect(getNote("softer-crust").meta.category).toBe("baking");
});

test("getNotesByCategory splits baking from build", () => {
  const baking = getNotesByCategory("baking");
  const build = getNotesByCategory("build");
  expect(baking.length).toBeGreaterThan(0);
  expect(baking.every((n) => n.meta.category === "baking")).toBe(true);
  expect(build.every((n) => n.meta.category === "build")).toBe(true);
  expect(build.some((n) => n.slug === "softer-crust")).toBe(false);
});
```
(The existing file already imports `getRecipeSlugs, getRecipe` from `./content`; this adds a second import line for the note helpers — that's fine.)

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/lib/content.test.ts`
Expected: FAIL — `getNotesByCategory` is not exported, and `meta.category` is undefined.

- [ ] **Step 3: Update `NoteMeta`, default the category, add the helper**

In `src/lib/content.ts`, change the `NoteMeta` type:
```ts
export type NoteMeta = {
  title: string;
  date: string;
  summary: string;
  category?: "baking" | "build"; // defaults to "baking" when absent
};
```

In `getNote`, default the category before returning. Replace:
```ts
export function getNote(slug: string): Note {
  const raw = fs.readFileSync(path.join(NOTES_DIR, `${slug}.mdx`), "utf8");
  const { data, content } = matter(raw);
  if (data.date instanceof Date) data.date = data.date.toISOString().slice(0, 10);
  return { slug, meta: data as NoteMeta, content };
}
```
with:
```ts
export function getNote(slug: string): Note {
  const raw = fs.readFileSync(path.join(NOTES_DIR, `${slug}.mdx`), "utf8");
  const { data, content } = matter(raw);
  if (data.date instanceof Date) data.date = data.date.toISOString().slice(0, 10);
  if (data.category !== "build") data.category = "baking";
  return { slug, meta: data as NoteMeta, content };
}
```

Add the helper at the end of the file (after `getAllNotes`):
```ts
export function getNotesByCategory(category: "baking" | "build"): Note[] {
  return getAllNotes().filter((n) => n.meta.category === category);
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/lib/content.test.ts`
Expected: PASS (existing 2 + new 2).

- [ ] **Step 5: Commit**

```bash
git add src/lib/content.ts src/lib/content.test.ts
git commit -m "feat(content): note category + getNotesByCategory helper"
```

---

## Task 2: Seed the four build notes

**Files:**
- Create: `src/content/notes/talk-like-me.mdx`
- Create: `src/content/notes/nightly-reindex.mdx`
- Create: `src/content/notes/site-from-my-phone.mdx`
- Create: `src/content/notes/never-googles.mdx`
- Test: `src/lib/content.test.ts`

- [ ] **Step 1: Create `src/content/notes/talk-like-me.mdx`**

```mdx
---
title: Teaching the site to talk like me
date: "2026-06-18"
summary: The Ask box on the home page isn't a chatbot bolted on — it's a little search engine over everything I've written here, taught to answer in my own voice.
category: build
---

The Ask box up top started as a simple itch: people kept asking me the same things, and I wanted the site to answer the way I would.

So I taught it to read everything I've put here — recipes, baking notes, the places I've eaten, the films I've logged, even this — and turn each piece into a string of numbers that captures its meaning. When you ask something, it finds the handful of my notes closest in meaning to your question, hands them to a language model, and asks it to reply *only* from those, in my voice.

The clever part wasn't the AI. It was the grounding — making sure it never invents things, never reaches for the internet, and sounds like me rather than a support bot. It quotes me back to myself, really.

Still tuning the voice. But ask it about a 72-hour sourdough and it answers about the way I'd answer at the bench.
```

- [ ] **Step 2: Create `src/content/notes/nightly-reindex.mdx`**

```mdx
---
title: A nightly robot that re-reads everything
date: "2026-06-18"
summary: Every night a small job wakes up, re-reads all my notes and saved places, and refreshes what the Ask box knows — so a thought I jot today is searchable by morning.
category: build
---

The Ask box is only as current as what it has read. Recipes and notes change when I deploy the site — but the places I save and the thoughts I jot down change whenever I feel like it, no deploy involved.

So there's a little robot. Every night it wakes up, pulls everything in (including anything new), and rebuilds the index the Ask box searches. It's careful: it only re-reads the bits that actually changed, so it costs next to nothing.

The upshot — I can be standing in a queue, save a place or mumble a thought into my phone, and by the next morning the site quietly knows about it. I rather like that it keeps learning while I sleep.
```

- [ ] **Step 3: Create `src/content/notes/site-from-my-phone.mdx`**

```mdx
---
title: Talking to my site from my phone
date: "2026-06-18"
summary: I can speak a thought or a place into my phone and it lands in the site's brain — without my phone ever holding the keys to anything.
category: build
---

I didn't want to open a laptop every time I had something to add. So now I just talk to my phone.

A little shortcut takes what I say and sends it to a small door on the site — with a shared password, nothing more. The site, on the other side of that door, is the one holding the actual keys to my database; my phone never sees them. It just knocks with the password and the text, and the site files it away.

It's the same trick for two things: logging a place I've just eaten at, and jotting a passing thought. Both end up feeding the Ask box.

The nicest part is how little ceremony it takes — double-tap the back of the phone, say the thing, done.
```

- [ ] **Step 4: Create `src/content/notes/never-googles.mdx`**

```mdx
---
title: Why it never Googles anything
date: "2026-06-18"
summary: The Ask box only ever speaks from my own notes, places and films — never the open web. If it doesn't know, it says so, warmly, instead of making something up.
category: build
---

There's one rule I care about more than any feature: the Ask box never touches the internet.

Everything it says comes from things I've actually written or done — my baking notes, the places I've saved, the films I've rated, the work I've shipped. Ask it something outside that and it doesn't bluff. It gives an honest, slightly sheepish shrug and points you back to what I *do* know.

I'd rather it admit "that's not really my world" than confidently put words in my mouth. A site that speaks for me should only say things I'd actually say. So it stays inside its own head — which happens to be mine.
```

- [ ] **Step 5: Add a test that the build notes loaded**

Append to `src/lib/content.test.ts`:
```ts
test("the four build notes are present", () => {
  const build = getNotesByCategory("build");
  expect(build.length).toBeGreaterThanOrEqual(4);
  expect(build.map((n) => n.slug)).toEqual(
    expect.arrayContaining([
      "talk-like-me",
      "nightly-reindex",
      "site-from-my-phone",
      "never-googles",
    ]),
  );
});
```

- [ ] **Step 6: Run to verify it passes**

Run: `npx vitest run src/lib/content.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/content/notes/talk-like-me.mdx src/content/notes/nightly-reindex.mdx src/content/notes/site-from-my-phone.mdx src/content/notes/never-googles.mdx src/lib/content.test.ts
git commit -m "content: four build/devlog notes"
```

---

## Task 3: Filter the Bakery page to baking notes

**Files:**
- Modify: `src/app/baking/page.tsx`

- [ ] **Step 1: Swap the import and the notes call**

In `src/app/baking/page.tsx`, change the import line:
```ts
import { getAllRecipes, getAllNotes } from "@/lib/content";
```
to:
```ts
import { getAllRecipes, getNotesByCategory } from "@/lib/content";
```

And change:
```ts
  const notes = getAllNotes();
```
to:
```ts
  const notes = getNotesByCategory("baking");
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors (no remaining `getAllNotes` reference in this file).

- [ ] **Step 3: Commit**

```bash
git add src/app/baking/page.tsx
git commit -m "feat(baking): show only baking-category notes"
```

---

## Task 4: Make the note page category-aware

**Files:**
- Modify: `src/app/notes/[slug]/page.tsx`

The page currently hardcodes "Baking note" and a "Back to the bakery" link, which is wrong for build notes (they get pages via `generateStaticParams` over all slugs).

- [ ] **Step 1: Branch the eyebrow and back link on category**

In `src/app/notes/[slug]/page.tsx`, replace the function body's JSX. Change:
```tsx
  const { meta, content } = note!;
  return (
    <article className="mx-auto max-w-2xl px-5 py-16">
      <p className="label text-terracotta">Baking note · {meta.date}</p>
      <h1 className="mt-3 text-4xl text-ink">{meta.title}</h1>
      <div className="prose prose-stone mt-8 max-w-none text-ink">
        <MDXRemote source={content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
      </div>
      <Link href="/baking" className="label text-terracotta hover:underline mt-12 inline-block">← Back to the bakery</Link>
    </article>
  );
```
to:
```tsx
  const { meta, content } = note!;
  const isBuild = meta.category === "build";
  return (
    <article className="mx-auto max-w-2xl px-5 py-16">
      <p className="label text-terracotta">{isBuild ? "Building this site" : "Baking note"} · {meta.date}</p>
      <h1 className="mt-3 text-4xl text-ink">{meta.title}</h1>
      <div className="prose prose-stone mt-8 max-w-none text-ink">
        <MDXRemote source={content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
      </div>
      <Link href={isBuild ? "/work" : "/baking"} className="label text-terracotta hover:underline mt-12 inline-block">
        {isBuild ? "← Back to the work" : "← Back to the bakery"}
      </Link>
    </article>
  );
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/notes/[slug]/page.tsx"
git commit -m "feat(notes): category-aware eyebrow and back link"
```

---

## Task 5: The highlighted "This very site" section on /work

**Files:**
- Modify: `src/app/work/page.tsx`

- [ ] **Step 1: Add imports**

At the top of `src/app/work/page.tsx`, the current first import is:
```ts
import { FEATURED, PROJECTS, EXPERIENCE, RESUME_URL } from "@/data/work";
```
Add these two lines right after it:
```ts
import Link from "next/link";
import { getNotesByCategory } from "@/lib/content";
```

- [ ] **Step 2: Load the build notes in the component**

In `export default function WorkPage() {`, add as the first line of the function body:
```ts
  const buildNotes = getNotesByCategory("build");
```

- [ ] **Step 3: Add the highlighted section as the last section**

In `src/app/work/page.tsx`, find the closing of the Experience section and the page wrapper:
```tsx
      </section>
    </div>
  );
}
```
Replace it with (inserts the new section before the final `</div>`):
```tsx
      </section>

      <section className="mt-16 rounded-2xl border border-pine/30 bg-pine/5 p-7">
        <p className="label text-pine">Colophon</p>
        <h2 className="mt-2 text-3xl text-ink">This very site</h2>
        <p className="mt-3 text-ink-soft max-w-2xl">
          That Ask box on the home page? I built it to answer in my own words — a little
          retrieval engine over everything I&apos;ve written here. These are my notes on how
          it, and the rest of the machinery behind this site, actually works.
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {["Next.js", "OpenAI embeddings", "Airtable", "GitHub Actions", "iOS Shortcuts"].map((s) => (
            <li key={s} className="label rounded-full border border-ink/15 px-3 py-1 text-ink-soft">{s}</li>
          ))}
        </ul>
        {buildNotes.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {buildNotes.map((n) => (
              <Link key={n.slug} href={`/notes/${n.slug}`}
                className="group block rounded-xl border border-ink/10 bg-paper/60 p-5 transition-colors hover:border-terracotta">
                <p className="text-lg text-ink group-hover:text-terracotta transition-colors">{n.meta.title}</p>
                <p className="mt-1 text-sm text-ink-soft">{n.meta.summary}</p>
                <p className="mt-3 label text-terracotta">Read →</p>
              </Link>
            ))}
          </div>
        )}
        <a href="/#ask-mari-slot" className="mt-6 inline-block label text-terracotta hover:underline">
          Ask it something →
        </a>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Type-check and build**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/work/page.tsx
git commit -m "feat(work): highlighted 'This very site' devlog section"
```

---

## Task 6: Re-index for search + live verification

**Files:**
- Modify (generated): `src/data/knowledge-index.json`

- [ ] **Step 1: Rebuild the knowledge index**

Run: `npm run build:knowledge`
Expected: prints `wrote N chunks (M newly embedded)` with M ≥ 4 (the new build notes). Requires valid `OPENAI_API_KEY` / `AIRTABLE_TOKEN` in `.env.local` (already in place).

- [ ] **Step 2: Confirm the build notes are indexed**

Run:
```bash
node -e "const a=require('./src/data/knowledge-index.json'); const t=a.filter(c=>c.url&&c.url.startsWith('/notes/')&&['/notes/talk-like-me','/notes/nightly-reindex','/notes/site-from-my-phone','/notes/never-googles'].includes(c.url)); console.log('build-note chunks:', t.length); console.log([...new Set(t.map(c=>c.title))]);"
```
Expected: a count ≥ 4 and the four build-note titles.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: all green.

- [ ] **Step 4: Live verification (controller drives the preview tools)**

The dev server is running. Reload, then verify:
1. **/work** — `preview_eval` `window.location.href='http://localhost:3000/work'`; `preview_snapshot` → the "This very site" panel renders with the tech chips and four clickable note cards + the "Ask it something →" link.
2. **/baking** — navigate there; `preview_snapshot` → the "Baking notes" list shows only baking notes (none of: talk-like-me, nightly-reindex, site-from-my-phone, never-googles).
3. **A build note** — navigate to `http://localhost:3000/notes/talk-like-me`; `preview_snapshot` → eyebrow reads "Building this site · …" and the back link reads "← Back to the work".
4. **Ask Mari** — POST to `/api/ask` with `{"messages":[{"role":"user","content":"how does the search on your site work?"}]}` → the answer reflects the build notes (embeddings / answers from your own words), in voice.
5. `preview_console_logs level=error` → clean.

- [ ] **Step 5: Commit the regenerated index**

```bash
git add src/data/knowledge-index.json
git commit -m "data(knowledge): index the build/devlog notes"
```

---

## Final checks

- [ ] `npm test` green.
- [ ] `npx tsc --noEmit` clean.
- [ ] `/work` shows the highlighted block; `/baking` excludes build notes; build-note pages read correctly; Ask Mari can answer "how does this site work?".
