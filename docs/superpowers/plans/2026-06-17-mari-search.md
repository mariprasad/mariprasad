# Ask Mari — Grounded "Talk to Me" Search — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggregate all site content (recipes, notes, cricket, travel, work, movement, profile, saved places, films, Strava) into a build-time embeddings index, and answer visitor questions in Mari's first-person voice, grounded only in his own content.

**Architecture:** A build script collects every source into a uniform `RawDoc`, chunks long docs, embeds each chunk with OpenAI `text-embedding-3-small` (512-dim) into a static `src/data/knowledge-index.json`. At request time, `/api/ask` (Node runtime) embeds the question, ranks chunks by cosine similarity, and streams a grounded answer from `gpt-4o-mini` with real source chips. When nothing is relevant, it deflects warmly in-voice.

**Tech Stack:** Next.js 16.2.7 (App Router), Vercel AI SDK (`ai@4.3.19`, `@ai-sdk/openai@1.3.24`), `tsx` (new dev dep) for the TS build script, vitest, Airtable (places + new Thoughts table).

**Spec:** `docs/superpowers/specs/2026-06-17-mari-search-design.md`

---

## Conventions for the implementer

- This repo's Next.js has breaking changes vs. training data (see `AGENTS.md`). For anything touching route handlers, consult `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md` before editing.
- Path alias `@/*` → `src/*` (works in app, tests, and the tsx build script).
- Tests use vitest globals (`test`, `expect`, `vi`) — no imports needed for those.
- Run a single test file: `npx vitest run src/lib/knowledge/chunk.test.ts`
- Run all tests: `npm test`
- Adapters use Node-only APIs (`fs`, `fetch`) and run ONLY in the build script — never imported by the edge/runtime path.
- Live adapters return `[]` when their token is missing — never throw. This is the existing repo pattern.

## File map

| File | Responsibility |
|------|----------------|
| `src/lib/knowledge/types.ts` | `SourceKind`, `RawDoc`, `KnowledgeChunk`, `RetrievedChunk` |
| `src/lib/knowledge/embedding.ts` | Shared embedding model id + dimensions + factory (DRY across build & runtime) |
| `src/lib/knowledge/chunk.ts` | `chunkText()` — split long prose into ~800-char chunks |
| `src/lib/knowledge/sources/content.ts` | `collectRecipes`, `collectNotes` (MDX) |
| `src/lib/knowledge/sources/static.ts` | `collectCricket`, `collectTravel`, `collectWork`, `collectMovement`, `collectProfile` |
| `src/lib/knowledge/sources/places.ts` | `collectPlaces` (Airtable) |
| `src/lib/knowledge/sources/films.ts` | `collectFilms` (Letterboxd) |
| `src/lib/knowledge/sources/strava.ts` | `collectStrava` |
| `src/lib/knowledge/sources/thoughts.ts` | `collectThoughts` (Airtable Thoughts table) |
| `src/lib/knowledge/sources/index.ts` | `ALL_SOURCES` registry |
| `scripts/build-knowledge.ts` | Orchestrate collect → chunk → incremental embed → write JSON |
| `src/data/knowledge-index.json` | Generated artifact (committed) |
| `src/lib/knowledge/retrieve.ts` | `rank()` (pure) + `retrieve()` (embeds query) |
| `src/lib/ask-prompt.ts` | `isInScope`, `buildSystemPrompt(chunks)`, `buildOutOfScopePrompt()`, `EXAMPLE_PROMPTS` |
| `src/app/api/ask/route.ts` | Wire retrieve → prompt → stream + source chips |
| `src/components/ask/AskMari.tsx` | Microcopy + source chips |
| `.github/workflows/refresh-knowledge.yml` | Nightly rebuild of the index |
| `src/data/about-corpus.ts` | **Deleted** (retired) |

> **Spotify note:** the only Spotify data available is *now-playing* (ephemeral), which carries no durable knowledge to index. It is intentionally **not** a source in Phase 1. "Spotify top tracks/artists" is a Phase 2 item.

---

## Task 1: Types, embedding config, and chunker

**Files:**
- Create: `src/lib/knowledge/types.ts`
- Create: `src/lib/knowledge/embedding.ts`
- Create: `src/lib/knowledge/chunk.ts`
- Test: `src/lib/knowledge/chunk.test.ts`

- [ ] **Step 1: Create the types**

`src/lib/knowledge/types.ts`:
```ts
export type SourceKind =
  | "recipe" | "note" | "place" | "film" | "cricket"
  | "travel" | "work" | "movement" | "profile" | "strava" | "thought";

/** A source document before embedding. */
export type RawDoc = {
  id: string;          // stable & unique, e.g. "recipe:sourdough"
  source: SourceKind;
  title: string;       // human label shown in source chips
  text: string;        // prose that gets embedded + handed to the model
  url?: string;        // link to the real page
  date?: string;       // ISO date when known
};

/** A chunk in the built index. */
export type KnowledgeChunk = RawDoc & {
  hash: string;        // sha1 of `text`, for incremental re-embedding
  vector: number[];    // embedding
};

/** A chunk returned from retrieval, with its similarity score. */
export type RetrievedChunk = {
  id: string;
  source: SourceKind;
  title: string;
  text: string;
  url?: string;
  score: number;
};
```

- [ ] **Step 2: Create the shared embedding config**

`src/lib/knowledge/embedding.ts`:
```ts
import { openai } from "@ai-sdk/openai";

// Both the build script and the request-time retriever MUST use identical
// model + dimensions, or cosine similarity is meaningless.
export const EMBED_MODEL_ID = "text-embedding-3-small" as const;
export const EMBED_DIM = 512; // reduced dims keep the index small (~1/3 of 1536)

export const embeddingModel = () =>
  openai.embedding(EMBED_MODEL_ID, { dimensions: EMBED_DIM });
```

- [ ] **Step 3: Write the failing chunker test**

`src/lib/knowledge/chunk.test.ts`:
```ts
import { chunkText } from "./chunk";

test("returns a single chunk for short text", () => {
  expect(chunkText("a short note")).toEqual(["a short note"]);
});

test("returns empty array for blank text", () => {
  expect(chunkText("   ")).toEqual([]);
});

test("splits long multi-paragraph text into multiple chunks under the cap", () => {
  const para = "x".repeat(500);
  const out = chunkText([para, para, para].join("\n\n"), 800);
  expect(out.length).toBeGreaterThan(1);
  for (const c of out) expect(c.length).toBeLessThanOrEqual(800);
});

test("keeps whole paragraphs together when they fit", () => {
  const out = chunkText("one\n\ntwo\n\nthree", 800);
  expect(out).toEqual(["one\n\ntwo\n\nthree"]);
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npx vitest run src/lib/knowledge/chunk.test.ts`
Expected: FAIL — `chunk.ts` / `chunkText` does not exist.

- [ ] **Step 5: Implement the chunker**

`src/lib/knowledge/chunk.ts`:
```ts
/**
 * Split prose into chunks no larger than `maxChars`, preferring paragraph
 * boundaries. A single oversized paragraph is emitted as its own chunk.
 */
export function chunkText(text: string, maxChars = 800): string[] {
  const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let buf = "";
  for (const p of paras) {
    if (buf && buf.length + p.length + 2 > maxChars) {
      chunks.push(buf);
      buf = "";
    }
    buf = buf ? `${buf}\n\n${p}` : p;
    if (buf.length >= maxChars) {
      chunks.push(buf);
      buf = "";
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run src/lib/knowledge/chunk.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 7: Commit**

```bash
git add src/lib/knowledge/types.ts src/lib/knowledge/embedding.ts src/lib/knowledge/chunk.ts src/lib/knowledge/chunk.test.ts
git commit -m "feat(knowledge): types, embedding config, and text chunker"
```

---

## Task 2: Local-content adapters (MDX + static data)

**Files:**
- Create: `src/lib/knowledge/sources/content.ts`
- Create: `src/lib/knowledge/sources/static.ts`
- Test: `src/lib/knowledge/sources/content.test.ts`
- Test: `src/lib/knowledge/sources/static.test.ts`

- [ ] **Step 1: Write the failing content-adapter test**

`src/lib/knowledge/sources/content.test.ts`:
```ts
import { collectRecipes, collectNotes } from "./content";

test("recipes map to RawDocs with /baking urls", async () => {
  const docs = await collectRecipes();
  expect(docs.length).toBeGreaterThan(0);
  for (const d of docs) {
    expect(d.source).toBe("recipe");
    expect(d.id).toMatch(/^recipe:/);
    expect(d.url).toMatch(/^\/baking\//);
    expect(d.text.length).toBeGreaterThan(0);
    expect(d.title.length).toBeGreaterThan(0);
  }
});

test("notes map to RawDocs with /notes urls", async () => {
  const docs = await collectNotes();
  expect(docs.length).toBeGreaterThan(0);
  for (const d of docs) {
    expect(d.source).toBe("note");
    expect(d.url).toMatch(/^\/notes\//);
  }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/lib/knowledge/sources/content.test.ts`
Expected: FAIL — `content.ts` does not exist.

- [ ] **Step 3: Implement the content adapter**

`src/lib/knowledge/sources/content.ts`:
```ts
import { getAllRecipes, getAllNotes } from "@/lib/content";
import type { RawDoc } from "../types";

export async function collectRecipes(): Promise<RawDoc[]> {
  return getAllRecipes().map((r) => ({
    id: `recipe:${r.slug}`,
    source: "recipe",
    title: r.meta.title,
    text: `${r.meta.summary}\n\n${r.content}`,
    url: `/baking/${r.slug}`,
    date: r.meta.date,
  }));
}

export async function collectNotes(): Promise<RawDoc[]> {
  return getAllNotes().map((n) => ({
    id: `note:${n.slug}`,
    source: "note",
    title: n.meta.title,
    text: `${n.meta.summary}\n\n${n.content}`,
    url: `/notes/${n.slug}`,
    date: n.meta.date,
  }));
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/lib/knowledge/sources/content.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the failing static-adapter test**

`src/lib/knowledge/sources/static.test.ts`:
```ts
import {
  collectCricket, collectTravel, collectWork, collectMovement, collectProfile,
} from "./static";

test("cricket adapter mentions the bowling heroes", async () => {
  const [doc] = await collectCricket();
  expect(doc.source).toBe("cricket");
  expect(doc.text).toMatch(/Dale Steyn/);
});

test("travel adapter lists visited regions", async () => {
  const [doc] = await collectTravel();
  expect(doc.source).toBe("travel");
  expect(doc.text).toMatch(/Karnataka/);
});

test("work adapter returns featured + projects + roles", async () => {
  const docs = await collectWork();
  expect(docs.length).toBeGreaterThan(3);
  expect(docs.every((d) => d.source === "work")).toBe(true);
  expect(docs[0].text).toMatch(/Flight-Search/);
});

test("movement adapter mentions the trek height", async () => {
  const [doc] = await collectMovement();
  expect(doc.text).toMatch(/15,500/);
});

test("profile adapter includes location and the physical stats", async () => {
  const [doc] = await collectProfile();
  expect(doc.text).toMatch(/Bengaluru/);
  expect(doc.text).toMatch(/185 cm/);
  expect(doc.text).toMatch(/75 kg/);
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `npx vitest run src/lib/knowledge/sources/static.test.ts`
Expected: FAIL — `static.ts` does not exist.

- [ ] **Step 7: Implement the static adapter**

`src/lib/knowledge/sources/static.ts`:
```ts
import { CRICKET } from "@/data/cricket";
import { VISITED } from "@/data/travel";
import { EXPERIENCE, PROJECTS, FEATURED } from "@/data/work";
import { PROFILE } from "@/data/profile";
import type { RawDoc } from "../types";

export async function collectCricket(): Promise<RawDoc[]> {
  return [{
    id: "cricket:overview",
    source: "cricket",
    title: "Cricket",
    text: `I bowl right-arm fast. I love ${CRICKET.loves}. My bowling heroes are ${CRICKET.heroes.join(", ")}. Favourite batsman: ${CRICKET.batsman}. IPL team: ${CRICKET.team}.`,
    url: "/#cricket",
  }];
}

export async function collectTravel(): Promise<RawDoc[]> {
  const names = VISITED.map((v) => v.name).join(", ");
  return [{
    id: "travel:overview",
    source: "travel",
    title: "Travel",
    text: `I've travelled solo across ${VISITED.length} states and union territories of India: ${names}.`,
    url: "/travel",
  }];
}

export async function collectWork(): Promise<RawDoc[]> {
  const featured: RawDoc = {
    id: "work:featured",
    source: "work",
    title: FEATURED.title,
    text: `${FEATURED.title} at ${FEATURED.company}: ${FEATURED.blurb} Stack: ${FEATURED.stack.join(", ")}.`,
    url: "/work",
  };
  const projects: RawDoc[] = PROJECTS.map((p, i) => ({
    id: `work:project:${i}`,
    source: "work",
    title: p.name,
    text: `${p.name} (${p.org}, ${p.period}): ${p.blurb} Stack: ${p.stack.join(", ")}.`,
    url: "/work",
  }));
  const roles: RawDoc[] = EXPERIENCE.map((r, i) => ({
    id: `work:role:${i}`,
    source: "work",
    title: `${r.title} — ${r.company}`,
    text: `${r.title} at ${r.company} (${r.period}): ${r.blurb}`,
    url: "/work",
  }));
  return [featured, ...projects, ...roles];
}

export async function collectMovement(): Promise<RawDoc[]> {
  return [{
    id: "movement:overview",
    source: "movement",
    title: "Movement",
    text: "I hold a basic mountaineering certificate from ABVMAS, Himachal. I've trekked up to 15,500 ft and finished my first 10k trail run.",
    url: "/movement",
  }];
}

export async function collectProfile(): Promise<RawDoc[]> {
  const ms = PROFILE.milestones.map((m) => `${m.label}: ${m.value}`).join("; ");
  return [{
    id: "profile:identity",
    source: "profile",
    title: "About Mari",
    text: `I'm ${PROFILE.name}, based in ${PROFILE.location}. I'm a full-stack engineer and tech lead. I'm 185 cm tall and weigh 75 kg (as of May 2026). Milestones: ${ms}.`,
    url: "/",
  }];
}
```

- [ ] **Step 8: Run to verify it passes**

Run: `npx vitest run src/lib/knowledge/sources/static.test.ts`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/lib/knowledge/sources/content.ts src/lib/knowledge/sources/static.ts src/lib/knowledge/sources/content.test.ts src/lib/knowledge/sources/static.test.ts
git commit -m "feat(knowledge): local content + static-data source adapters"
```

---

## Task 3: Live-source adapters (places, films, strava, thoughts) + registry

**Files:**
- Create: `src/lib/knowledge/sources/places.ts`
- Create: `src/lib/knowledge/sources/films.ts`
- Create: `src/lib/knowledge/sources/strava.ts`
- Create: `src/lib/knowledge/sources/thoughts.ts`
- Create: `src/lib/knowledge/sources/index.ts`
- Test: `src/lib/knowledge/sources/places.test.ts`
- Test: `src/lib/knowledge/sources/strava.test.ts`
- Test: `src/lib/knowledge/sources/thoughts.test.ts`

- [ ] **Step 1: Write the failing places test (mocking the Airtable lib)**

`src/lib/knowledge/sources/places.test.ts`:
```ts
import { vi } from "vitest";

vi.mock("@/lib/airtable-places", () => ({
  getSavedPlaces: vi.fn(async () => [
    { id: "rec1", name: "Vidyarthi Bhavan", region: "Karnataka", food: "masala dosa", note: "Crisp, buttery, worth the queue.", rating: 5, tag: "loved it", date: "2025-12-01" },
    { id: "rec2", name: "Some Cafe" },
  ]),
}));

import { collectPlaces } from "./places";

test("places map to RawDocs folding region, food, rating and note", async () => {
  const docs = await collectPlaces();
  expect(docs).toHaveLength(2);
  const first = docs[0];
  expect(first.id).toBe("place:rec1");
  expect(first.source).toBe("place");
  expect(first.title).toBe("Vidyarthi Bhavan");
  expect(first.text).toMatch(/masala dosa/);
  expect(first.text).toMatch(/5\/5/);
  expect(first.text).toMatch(/Crisp, buttery/);
});

test("a bare place still produces a valid doc", async () => {
  const docs = await collectPlaces();
  expect(docs[1].title).toBe("Some Cafe");
  expect(docs[1].text.length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/lib/knowledge/sources/places.test.ts`
Expected: FAIL — `places.ts` does not exist.

- [ ] **Step 3: Implement the places adapter**

`src/lib/knowledge/sources/places.ts`:
```ts
import { getSavedPlaces } from "@/lib/airtable-places";
import type { RawDoc } from "../types";

export async function collectPlaces(): Promise<RawDoc[]> {
  const places = await getSavedPlaces();
  return places.map((p): RawDoc => {
    const bits = [
      p.region && `in ${p.region}`,
      p.food && `known for ${p.food}`,
      typeof p.rating === "number" && `I rated it ${p.rating}/5`,
      p.tag && `(${p.tag})`,
      p.note,
    ].filter(Boolean).join(". ");
    return {
      id: `place:${p.id}`,
      source: "place",
      title: p.name,
      text: bits ? `${p.name} — ${bits}.` : `${p.name}.`,
      url: "/travel",
      date: p.date,
    };
  });
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/lib/knowledge/sources/places.test.ts`
Expected: PASS.

- [ ] **Step 5: Implement the films adapter (no separate test — covered by build smoke run)**

`src/lib/knowledge/sources/films.ts`:
```ts
import { getRecentFilms, getWatchlist } from "@/lib/letterboxd";
import type { RawDoc } from "../types";

export async function collectFilms(): Promise<RawDoc[]> {
  const [watched, watchlist] = await Promise.all([getRecentFilms(), getWatchlist()]);
  const diary: RawDoc[] = watched.map((f, i) => {
    const rate = typeof f.rating === "number" ? `, I rated it ${f.rating}/5` : "";
    const liked = f.liked ? " and liked it" : "";
    return {
      id: `film:diary:${i}`,
      source: "film",
      title: f.title,
      text: `I watched ${f.title}${f.year ? ` (${f.year})` : ""}${rate}${liked}.`,
      url: f.url,
      date: f.watchedAt,
    };
  });
  const wl: RawDoc[] = watchlist.map((f, i) => ({
    id: `film:watchlist:${i}`,
    source: "film",
    title: f.title,
    text: `${f.title} is on my watchlist — I haven't seen it yet.`,
    url: f.url,
  }));
  return [...diary, ...wl];
}
```

- [ ] **Step 6: Write the failing strava test**

`src/lib/knowledge/sources/strava.test.ts`:
```ts
import { collectStrava } from "./strava";

test("strava overview summarises totals and records follow", async () => {
  const docs = await collectStrava();
  expect(docs[0].id).toBe("strava:overview");
  expect(docs[0].source).toBe("strava");
  expect(docs[0].text).toMatch(/activities/);
  expect(docs.length).toBeGreaterThan(1); // overview + records
});
```

- [ ] **Step 7: Run to verify it fails**

Run: `npx vitest run src/lib/knowledge/sources/strava.test.ts`
Expected: FAIL — `strava.ts` does not exist.

- [ ] **Step 8: Implement the strava adapter**

`src/lib/knowledge/sources/strava.ts`:
```ts
import { STRAVA_STATS, STRAVA_RECORDS } from "@/data/strava";
import type { RawDoc } from "../types";

export async function collectStrava(): Promise<RawDoc[]> {
  const s = STRAVA_STATS;
  const overview: RawDoc = {
    id: "strava:overview",
    source: "strava",
    title: "Running & riding",
    text: `Across ${s.total} logged activities I've covered about ${s.distanceKm} km with ${s.elevationM} m of climbing — ${s.byType.Run} runs, ${s.byType.Ride} rides, ${s.byType.Walk} walks, ${s.byType.Hike} hikes. My longest run is ${s.longestRunKm} km.`,
    url: "/movement",
  };
  const records: RawDoc[] = STRAVA_RECORDS.map((r, i) => ({
    id: `strava:record:${i}`,
    source: "strava",
    title: r.label,
    text: `${r.label}: "${r.name}" — ${r.value} ${r.unit} on ${r.date}.`,
    url: "/movement",
  }));
  return [overview, ...records];
}
```

- [ ] **Step 9: Run to verify it passes**

Run: `npx vitest run src/lib/knowledge/sources/strava.test.ts`
Expected: PASS.

- [ ] **Step 10: Write the failing thoughts test (mocking fetch)**

`src/lib/knowledge/sources/thoughts.test.ts`:
```ts
import { vi, beforeEach, afterEach } from "vitest";
import { collectThoughts } from "./thoughts";

const OLD = process.env.AIRTABLE_TOKEN;
afterEach(() => { process.env.AIRTABLE_TOKEN = OLD; vi.restoreAllMocks(); });

test("returns [] when no token is set", async () => {
  delete process.env.AIRTABLE_TOKEN;
  expect(await collectThoughts()).toEqual([]);
});

test("maps Thoughts rows to RawDocs", async () => {
  process.env.AIRTABLE_TOKEN = "tok";
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
    records: [
      { id: "t1", fields: { Thought: "Sourdough is mostly patience.", Topic: "baking", Date: "2026-06-01" } },
      { id: "t2", fields: { Thought: "" } },
    ],
  }), { status: 200 })));
  const docs = await collectThoughts();
  expect(docs).toHaveLength(1); // empty thought dropped
  expect(docs[0]).toMatchObject({ id: "thought:t1", source: "thought", title: "baking" });
  expect(docs[0].text).toMatch(/patience/);
});

test("returns [] when the table is missing (non-ok response)", async () => {
  process.env.AIRTABLE_TOKEN = "tok";
  vi.stubGlobal("fetch", vi.fn(async () => new Response("not found", { status: 404 })));
  expect(await collectThoughts()).toEqual([]);
});
```

- [ ] **Step 11: Run to verify it fails**

Run: `npx vitest run src/lib/knowledge/sources/thoughts.test.ts`
Expected: FAIL — `thoughts.ts` does not exist.

- [ ] **Step 12: Implement the thoughts adapter**

`src/lib/knowledge/sources/thoughts.ts`:
```ts
// Loose thoughts from a "Thoughts" table in the same Airtable base as Places.
// Returns [] when the token is unset or the table doesn't exist yet.
import type { RawDoc } from "../types";

const BASE_ID = "appOjONooljd6cwwi";
const TABLE = "Thoughts";

export async function collectThoughts(): Promise<RawDoc[]> {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return [];
  const base = `https://api.airtable.com/v0/${BASE_ID}/${TABLE}?pageSize=100`;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const records: any[] = [];
    let offset: string | undefined;
    do {
      const res = await fetch(offset ? `${base}&offset=${encodeURIComponent(offset)}` : base, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      const data = await res.json();
      records.push(...(data.records ?? []));
      offset = data.offset;
    } while (offset && records.length < 1000);
    return records
      .map((r): RawDoc => ({
        id: `thought:${r.id}`,
        source: "thought",
        title: r.fields?.Topic ? String(r.fields.Topic) : "A thought",
        text: String(r.fields?.Thought ?? ""),
        date: r.fields?.Date ? String(r.fields.Date) : undefined,
      }))
      .filter((d) => d.text.trim().length > 0);
  } catch {
    return [];
  }
}
```

- [ ] **Step 13: Run to verify it passes**

Run: `npx vitest run src/lib/knowledge/sources/thoughts.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 14: Create the source registry**

`src/lib/knowledge/sources/index.ts`:
```ts
import type { RawDoc } from "../types";
import { collectRecipes, collectNotes } from "./content";
import { collectCricket, collectTravel, collectWork, collectMovement, collectProfile } from "./static";
import { collectPlaces } from "./places";
import { collectFilms } from "./films";
import { collectStrava } from "./strava";
import { collectThoughts } from "./thoughts";

export const ALL_SOURCES: Array<() => Promise<RawDoc[]>> = [
  collectRecipes,
  collectNotes,
  collectCricket,
  collectTravel,
  collectWork,
  collectMovement,
  collectProfile,
  collectPlaces,
  collectFilms,
  collectStrava,
  collectThoughts,
];
```

- [ ] **Step 15: Commit**

```bash
git add src/lib/knowledge/sources/
git commit -m "feat(knowledge): live-source adapters (places, films, strava, thoughts) + registry"
```

---

## Task 4: Build script, npm wiring, and initial index

**Files:**
- Create: `scripts/build-knowledge.ts`
- Modify: `package.json` (add `tsx` dev dep + scripts)
- Create (generated): `src/data/knowledge-index.json`

- [ ] **Step 1: Install tsx**

Run: `npm install -D tsx`
Expected: `tsx` added to `devDependencies`.

- [ ] **Step 2: Add npm scripts**

Modify `package.json` `"scripts"` to:
```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:knowledge": "tsx scripts/build-knowledge.ts",
    "prebuild": "tsx scripts/build-knowledge.ts",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
```
(`prebuild` runs automatically before `build`, so every deploy regenerates the index.)

- [ ] **Step 3: Write the build script**

`scripts/build-knowledge.ts`:
```ts
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { embedMany } from "ai";
import { embeddingModel } from "../src/lib/knowledge/embedding";
import { chunkText } from "../src/lib/knowledge/chunk";
import { ALL_SOURCES } from "../src/lib/knowledge/sources";
import type { RawDoc, KnowledgeChunk } from "../src/lib/knowledge/types";

const OUT = path.join(process.cwd(), "src/data/knowledge-index.json");

// Best-effort .env.local loader so local runs pick up OPENAI_API_KEY / AIRTABLE_TOKEN.
// In CI, real env vars are already set and take precedence.
function loadEnvLocal(): void {
  const f = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, "utf8").split("\n")) {
    const m = /^([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line.trim());
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const sha1 = (s: string) => crypto.createHash("sha1").update(s).digest("hex");

async function main(): Promise<void> {
  loadEnvLocal();

  // 1. Collect every source (a failing source warns but doesn't abort the build).
  const raw: RawDoc[] = [];
  for (const collect of ALL_SOURCES) {
    try {
      raw.push(...(await collect()));
    } catch (e) {
      console.warn(`[build-knowledge] source failed, skipping:`, e);
    }
  }

  // 2. Chunk long docs.
  const docs: RawDoc[] = [];
  for (const d of raw) {
    const parts = chunkText(d.text);
    if (parts.length <= 1) {
      docs.push({ ...d, text: parts[0] ?? d.text });
    } else {
      parts.forEach((text, i) => docs.push({ ...d, id: `${d.id}#${i}`, text }));
    }
  }

  // 3. Reuse vectors for unchanged text (incremental embedding).
  const prev: KnowledgeChunk[] = fs.existsSync(OUT)
    ? (JSON.parse(fs.readFileSync(OUT, "utf8")) as KnowledgeChunk[])
    : [];
  const cache = new Map(prev.map((c) => [c.hash, c.vector]));

  const out: KnowledgeChunk[] = [];
  const toEmbed: RawDoc[] = [];
  for (const d of docs) {
    const hash = sha1(d.text);
    const cached = cache.get(hash);
    if (cached) {
      out.push({ ...d, hash, vector: cached });
    } else {
      toEmbed.push(d);
      out.push({ ...d, hash, vector: [] }); // filled below
    }
  }

  // 4. Embed only new/changed chunks.
  if (toEmbed.length > 0) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is required to embed new chunks");
    }
    const { embeddings } = await embedMany({
      model: embeddingModel(),
      values: toEmbed.map((d) => d.text),
    });
    const byId = new Map(toEmbed.map((d, i) => [d.id, embeddings[i]]));
    for (const c of out) {
      if (c.vector.length === 0) c.vector = byId.get(c.id) as number[];
    }
  }

  fs.writeFileSync(OUT, JSON.stringify(out));
  console.log(`[build-knowledge] wrote ${out.length} chunks (${toEmbed.length} newly embedded) → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 4: Generate the index**

Run: `npm run build:knowledge`
Expected: console prints `wrote N chunks (N newly embedded)` and `src/data/knowledge-index.json` now exists and is non-empty. (Requires `OPENAI_API_KEY` in `.env.local`. Places/films/thoughts populate only if their tokens are set; otherwise the index simply has fewer chunks — that's fine.)

- [ ] **Step 5: Verify the index shape**

Run: `node -e "const a=require('./src/data/knowledge-index.json'); console.log(a.length, a[0].source, a[0].vector.length)"`
Expected: a count > 0, a valid source string, and vector length `512`.

- [ ] **Step 6: Commit (including the generated index)**

```bash
git add package.json package-lock.json scripts/build-knowledge.ts src/data/knowledge-index.json
git commit -m "feat(knowledge): build script + npm wiring + initial index"
```

---

## Task 5: Retrieval

**Files:**
- Create: `src/lib/knowledge/retrieve.ts`
- Test: `src/lib/knowledge/retrieve.test.ts`

- [ ] **Step 1: Write the failing rank test**

`src/lib/knowledge/retrieve.test.ts`:
```ts
import { rank } from "./retrieve";
import type { KnowledgeChunk } from "./types";

const chunk = (id: string, vector: number[]): KnowledgeChunk => ({
  id, source: "note", title: id, text: id, hash: id, vector,
});

test("ranks by cosine similarity, highest first, above threshold", () => {
  const query = [1, 0];
  const chunks = [
    chunk("near", [0.9, 0.1]),
    chunk("orthogonal", [0, 1]),
    chunk("exact", [1, 0]),
  ];
  const out = rank(query, chunks, 6, 0.5);
  expect(out.map((c) => c.id)).toEqual(["exact", "near"]); // orthogonal (score 0) dropped
  expect(out[0].score).toBeGreaterThan(out[1].score);
});

test("respects top-k", () => {
  const query = [1, 0];
  const chunks = [chunk("a", [1, 0]), chunk("b", [0.9, 0.1]), chunk("c", [0.8, 0.2])];
  expect(rank(query, chunks, 2, 0).length).toBe(2);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/lib/knowledge/retrieve.test.ts`
Expected: FAIL — `retrieve.ts` does not exist.

- [ ] **Step 3: Implement retrieval**

`src/lib/knowledge/retrieve.ts`:
```ts
import { embed, cosineSimilarity } from "ai";
import index from "@/data/knowledge-index.json";
import { embeddingModel } from "./embedding";
import type { KnowledgeChunk, RetrievedChunk } from "./types";

export const TOP_K = 6;
export const MIN_SCORE = 0.28;

const CHUNKS = index as unknown as KnowledgeChunk[];

/** Pure ranking — no network. Exported for testing. */
export function rank(
  queryVec: number[],
  chunks: KnowledgeChunk[],
  k: number = TOP_K,
  minScore: number = MIN_SCORE,
): RetrievedChunk[] {
  return chunks
    .map((c) => ({
      id: c.id,
      source: c.source,
      title: c.title,
      text: c.text,
      url: c.url,
      score: cosineSimilarity(queryVec, c.vector),
    }))
    .filter((c) => c.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

/** Embed the question and return the most relevant chunks. */
export async function retrieve(
  question: string,
  k: number = TOP_K,
  minScore: number = MIN_SCORE,
): Promise<RetrievedChunk[]> {
  if (!question.trim() || CHUNKS.length === 0) return [];
  const { embedding } = await embed({ model: embeddingModel(), value: question });
  return rank(embedding, CHUNKS, k, minScore);
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/lib/knowledge/retrieve.test.ts`
Expected: PASS (2 tests). (Importing `retrieve.ts` requires `src/data/knowledge-index.json` from Task 4 to exist.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/knowledge/retrieve.ts src/lib/knowledge/retrieve.test.ts
git commit -m "feat(knowledge): cosine-similarity retrieval"
```

---

## Task 6: Persona prompt (rewrite) + retire about-corpus

**Files:**
- Rewrite: `src/lib/ask-prompt.ts`
- Rewrite: `src/lib/ask-prompt.test.ts`
- Delete: `src/data/about-corpus.ts`

- [ ] **Step 1: Rewrite the prompt test**

Replace the entire contents of `src/lib/ask-prompt.test.ts` with:
```ts
import { buildSystemPrompt, buildOutOfScopePrompt, isInScope, EXAMPLE_PROMPTS } from "./ask-prompt";
import type { RetrievedChunk } from "@/lib/knowledge/types";

const chunk = (over: Partial<RetrievedChunk> = {}): RetrievedChunk => ({
  id: "note:softer-crust", source: "note", title: "Softer crust",
  text: "Steam the first ten minutes for a softer crust.", url: "/notes/softer-crust", score: 0.9, ...over,
});

test("system prompt embeds the retrieved context and grounding rules", () => {
  const p = buildSystemPrompt([chunk()]);
  expect(p).toMatch(/Softer crust/);
  expect(p).toMatch(/softer crust/);
  expect(p).toMatch(/ONLY from the CONTEXT/i);
  expect(p).toMatch(/Mari/);
});

test("out-of-scope prompt is in-voice and offers example questions", () => {
  const p = buildOutOfScopePrompt();
  expect(p).toMatch(/Mari/);
  expect(EXAMPLE_PROMPTS.some((q) => p.includes(q))).toBe(true);
});

test("rejects empty or overlong questions", () => {
  expect(isInScope("")).toBe(false);
  expect(isInScope("x".repeat(501))).toBe(false);
  expect(isInScope("What do you bake?")).toBe(true);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/lib/ask-prompt.test.ts`
Expected: FAIL — `buildOutOfScopePrompt` / `EXAMPLE_PROMPTS` don't exist and `buildSystemPrompt` takes no args yet.

- [ ] **Step 3: Rewrite the prompt module**

Replace the entire contents of `src/lib/ask-prompt.ts` with:
```ts
import type { RetrievedChunk } from "@/lib/knowledge/types";

export const EXAMPLE_PROMPTS = [
  "how do you get a softer sourdough crust?",
  "what's the highest you've trekked?",
  "which fast bowlers did you grow up idolising?",
  "where should I eat in Bengaluru?",
];

const IDENTITY =
  `You are Mariprasad Ramakrishna ("Mari"), replying to visitors on your personal ` +
  `website in your own first-person voice: warm, a little dry, and concise. You bowl ` +
  `fast and bake slow. You're based in Bengaluru and work as a full-stack engineer / ` +
  `tech lead. You are 185 cm tall and weigh 75 kg (as of May 2026).`;

const RULES =
  `Rules:\n` +
  `- Answer ONLY from the CONTEXT below. Never use outside or web knowledge.\n` +
  `- Never invent specifics (dates, scores, place names, ratings, opinions) absent from the CONTEXT.\n` +
  `- Keep it to 1-3 short sentences, the way you'd reply to a curious stranger.\n` +
  `- Speak as "I"/"me". Never mention "context", "sources", or that you are an AI.`;

export function isInScope(question: string): boolean {
  const q = question.trim();
  return q.length > 0 && q.length <= 500;
}

export function buildSystemPrompt(chunks: RetrievedChunk[]): string {
  const context = chunks.map((c) => `[${c.title}] ${c.text}`).join("\n\n");
  return `${IDENTITY}\n\n${RULES}\n\nCONTEXT:\n${context}`;
}

export function buildOutOfScopePrompt(): string {
  const examples = EXAMPLE_PROMPTS.map((q) => `"${q}"`).join(", ");
  return (
    `${IDENTITY}\n\n` +
    `The visitor just asked about something you have nothing on — it's outside your ` +
    `world (your site only covers your baking, cricket, travel, places, films, running, ` +
    `and work). In ONE or TWO warm, slightly self-deprecating sentences, say you wish you ` +
    `could help but that's not your area, then invite them to ask something you've ` +
    `actually lived. Naturally weave in two or three of these example questions: ${examples}. ` +
    `Speak as "I"/"me"; never mention that you are an AI.`
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/lib/ask-prompt.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Delete the retired corpus**

Run: `git rm src/data/about-corpus.ts`
Expected: file removed. (Task 7 removes its last importer; confirm nothing else imports it:)
Run: `git grep -n "about-corpus" -- "src" || echo "no references"`
Expected: only the route still references it until Task 7 — that's fine within this branch, but if Task 7 is done first, expect "no references".

- [ ] **Step 6: Commit**

```bash
git add src/lib/ask-prompt.ts src/lib/ask-prompt.test.ts
git commit -m "feat(ask): retrieval-grounded persona prompt + out-of-scope deflection; retire about-corpus"
```

---

## Task 7: API route — retrieve, stream, attach sources

**Files:**
- Rewrite: `src/app/api/ask/route.ts`

> Before editing, skim `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md` (repo convention — this Next version differs from training data).

- [ ] **Step 1: Rewrite the route**

Replace the entire contents of `src/app/api/ask/route.ts` with:
```ts
import { openai } from "@ai-sdk/openai";
import { streamText, createDataStreamResponse } from "ai";
import { retrieve } from "@/lib/knowledge/retrieve";
import { buildSystemPrompt, buildOutOfScopePrompt, isInScope } from "@/lib/ask-prompt";

// Node runtime: the route imports the embeddings index (too large for the edge
// bundle limit) and runs cosine similarity in-process.
export const runtime = "nodejs";

// Public, unauthenticated endpoint: cap the payload to blunt cost-abuse.
const MAX_MESSAGES = 20;
const MAX_TOTAL_CHARS = 6000;

export async function POST(req: Request) {
  const { messages } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("Ask me something about my baking, cricket, travels, or work.", { status: 400 });
  }
  const trimmed = messages.slice(-MAX_MESSAGES);
  const totalChars = trimmed.reduce((n: number, m: { content?: unknown }) => n + String(m?.content ?? "").length, 0);
  const last = String(trimmed[trimmed.length - 1]?.content ?? "");
  if (!isInScope(last) || totalChars > MAX_TOTAL_CHARS) {
    return new Response("Ask me something short about my baking, cricket, travels, or work.", { status: 400 });
  }

  const chunks = await retrieve(last);

  // Nothing relevant → warm, in-voice deflection (generated, so it varies).
  if (chunks.length === 0) {
    return createDataStreamResponse({
      execute: (dataStream) => {
        const result = streamText({
          model: openai("gpt-4o-mini"),
          system: buildOutOfScopePrompt(),
          messages: trimmed,
          temperature: 0.6,
          maxTokens: 120,
        });
        result.mergeIntoDataStream(dataStream);
      },
    });
  }

  // Grounded answer + real source chips (built by us, not the model).
  const sources = chunks
    .filter((c) => c.url)
    .map((c) => ({ title: c.title, url: c.url as string }));

  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.writeData({ sources });
      const result = streamText({
        model: openai("gpt-4o-mini"),
        system: buildSystemPrompt(chunks),
        messages: trimmed,
        temperature: 0.4,
        maxTokens: 220,
      });
      result.mergeIntoDataStream(dataStream);
    },
  });
}
```

- [ ] **Step 2: Type-check & lint the route**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors. (If `tsc` isn't wired, run `npx next build` later in Step 3 of Task 8 to catch type errors.)

- [ ] **Step 3: Verify no dangling about-corpus references remain**

Run: `git grep -n "about-corpus" -- src || echo "clean"`
Expected: `clean`.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/ask/route.ts
git commit -m "feat(ask): grounded retrieval route on node runtime with source chips"
```

---

## Task 8: AskMari component — microcopy + source chips, then verify live

**Files:**
- Rewrite: `src/components/ask/AskMari.tsx`

- [ ] **Step 1: Rewrite the component**

Replace the entire contents of `src/components/ask/AskMari.tsx` with:
```tsx
"use client";
import { useChat } from "ai/react";

type Source = { title: string; url: string };

export default function AskMari() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, data } =
    useChat({ api: "/api/ask" });

  // Sources are pushed via dataStream.writeData({ sources }); take the latest payload.
  const sources: Source[] = (() => {
    const withSources = (data ?? []).filter(
      (d): d is { sources: Source[] } =>
        !!d && typeof d === "object" && "sources" in d && Array.isArray((d as { sources: unknown }).sources),
    );
    return withSources.length ? withSources[withSources.length - 1].sources : [];
  })();

  return (
    <div className="rounded-2xl border border-ink/15 bg-paper/50 p-5">
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {messages.map((m) => (
          <p key={m.id} className={m.role === "user" ? "text-ink-soft" : "text-ink"}>
            <span className="label mr-2">{m.role === "user" ? "you" : "mari"}</span>
            {m.content}
          </p>
        ))}
        {sources.length > 0 && !isLoading && (
          <div className="flex flex-wrap gap-2 pl-1">
            {sources.map((s, i) => (
              <a key={`${s.url}-${i}`} href={s.url} className="label text-terracotta hover:underline">
                from {s.title} →
              </a>
            ))}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={input} onChange={handleInputChange}
          placeholder="Ask me about something I've actually done…"
          className="flex-1 rounded-lg border border-ink/20 bg-paper px-3 py-2 text-ink outline-none focus:border-terracotta"
        />
        <button type="submit" disabled={isLoading}
          className="rounded-lg bg-terracotta px-4 py-2 text-paper disabled:opacity-50">
          {isLoading ? "…" : "Ask"}
        </button>
      </form>
      <p className="mt-2 label text-ink-soft">
        Answers come only from my own notes, places, and projects — never the web.
      </p>
      {error && (
        <p className="mt-3 text-sm text-terracotta">
          Hmm, that didn&apos;t go through — try again in a moment.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build to catch type errors**

Run: `npm run build`
Expected: build succeeds (this also runs `prebuild` → regenerates the index). If `OPENAI_API_KEY` isn't available in the shell, run `npm run build:knowledge` first with `.env.local` present, or temporarily skip `prebuild` — but the committed index from Task 4 lets the app build regardless.

- [ ] **Step 3: Verify live in the dev server**

The dev server is managed via the preview tools. Reload it, then:
1. `preview_eval` → `window.location.reload()`
2. `preview_fill` the input (`input[placeholder^="Ask me about"]`) with `how do you get a softer crust?` and submit (`preview_click` the Ask button).
3. `preview_snapshot` → confirm an in-voice answer appears AND a "from Softer crust →" style chip renders beneath it.
4. `preview_fill` with an out-of-scope question like `what is a constellation?`, submit, `preview_snapshot` → confirm a warm deflection with example prompts and NO source chips.
5. `preview_console_logs level=error` → confirm clean.

Fix any issues in source, re-check from sub-step 1.

- [ ] **Step 4: Commit**

```bash
git add src/components/ask/AskMari.tsx
git commit -m "feat(ask): in-voice microcopy + grounded source chips"
```

---

## Task 9: Nightly index refresh (GitHub Action)

**Files:**
- Create: `.github/workflows/refresh-knowledge.yml`

**Prerequisite (one-time, by Mari):** add repo secrets `OPENAI_API_KEY` and `AIRTABLE_TOKEN` (GitHub → Settings → Secrets and variables → Actions). Assumes Vercel auto-deploys on push to `master`.

- [ ] **Step 1: Create the workflow**

`.github/workflows/refresh-knowledge.yml`:
```yaml
name: Refresh knowledge index
on:
  schedule:
    - cron: "30 20 * * *" # 02:00 IST daily
  workflow_dispatch: {}

permissions:
  contents: write

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build:knowledge
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          AIRTABLE_TOKEN: ${{ secrets.AIRTABLE_TOKEN }}
      - name: Commit refreshed index if changed
        run: |
          if ! git diff --quiet -- src/data/knowledge-index.json; then
            git config user.name "github-actions[bot]"
            git config user.email "github-actions[bot]@users.noreply.github.com"
            git add src/data/knowledge-index.json
            git commit -m "chore(knowledge): nightly index refresh"
            git push
          else
            echo "index unchanged"
          fi
```

- [ ] **Step 2: Validate YAML locally**

Run: `node -e "const fs=require('fs');const s=fs.readFileSync('.github/workflows/refresh-knowledge.yml','utf8');if(!/build:knowledge/.test(s))throw new Error('missing build step');console.log('ok')"`
Expected: `ok`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/refresh-knowledge.yml
git commit -m "ci(knowledge): nightly index refresh workflow"
```

---

## Final verification

- [ ] Run the whole suite: `npm test` → all green.
- [ ] `npm run build` → succeeds.
- [ ] Manually exercise `/api/ask` for: a baking question (grounded + chips), a places question (if `AIRTABLE_TOKEN` set), and an out-of-scope question (deflection). Confirm none reach the open web and none fabricate facts.

---

## Phase 2 backlog (not in this plan)

- Voice **capture**: iOS Shortcut (dictate → text → POST to the Thoughts table).
- Voice **answers** (TTS) + voice **questions** (STT) as an additive layer over this text pipeline.
- Visitor "leave a thought" guestbook (open write endpoint → needs spam protection).
- Spotify top-tracks/artists as a durable source.
- Optional dedicated `/ask` search page; model upgrades.
```
