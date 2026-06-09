# mariprasad.com Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build mariprasad.com — a warm, animated personal site (cricket, baking, travel, movement, films) with a grounded "Ask Mari" AI feature and live Letterboxd/Strava/Spotify slots — on Next.js, deployed to Vercel.

**Architecture:** Next.js (App Router, TypeScript), statically generated where possible with React Server Components for content and client islands only for animation and the Ask Mari chat. Content (recipes, travel logs) authored as MDX files parsed with gray-matter. Live data via small server-side fetcher modules (Letterboxd RSS active; Strava/Spotify connect-to-activate with graceful fallback). Styling with Tailwind CSS v4; animation with Motion (`motion/react`); AI chat with the Vercel AI SDK + OpenAI.

**Tech Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Motion (`motion`) · MDX (`next-mdx-remote` + `gray-matter`) · `next/image` · Vercel AI SDK (`ai`, `@ai-sdk/openai`) · `fast-xml-parser` · Vitest + Testing Library · Vercel hosting.

**Testing philosophy (read before executing):**
- **Strict TDD** (failing test → minimal impl → pass) for all *logic* modules: MDX/frontmatter, travel data, Letterboxd RSS parsing, Ask Mari prompt/grounding builder, Strava/Spotify fetchers' fallback behavior.
- **Smoke render tests** (Testing Library: renders, contains expected text/links/roles) for components. Write them after the component skeleton — they guard content/accessibility, not pixels.
- **Build verification** (`npm run build` succeeds, `npm run dev` renders) is the gate for visual/animation work. Manual visual confirmation in the browser is expected and noted per task.
- Every task ends in a commit. Conventional-commit prefixes (`feat:`, `test:`, `chore:`, `style:`).

**Conventions:**
- Path alias `@/*` → project root `src/*`.
- All client components carry `'use client'`; default to Server Components.
- Colors/fonts referenced via Tailwind theme tokens defined in Task 2 — never hardcode hex in components.
- Respect `prefers-reduced-motion` everywhere via the `Reveal` primitive (Task 3).

---

## File Structure (decomposition map)

```
src/
  app/
    layout.tsx                 # root layout: fonts, <body> texture, header/footer
    page.tsx                   # homepage: composes section components in order
    globals.css                # Tailwind v4 import + @theme tokens + texture + reduced-motion
    baking/page.tsx            # recipe index
    baking/[slug]/page.tsx     # single recipe (MDX)
    travel/page.tsx            # India map + state log
    movement/page.tsx          # treks + 10k + Strava
    movies/page.tsx            # Letterboxd feed + watchlist
    work/page.tsx              # case studies + resume
    api/ask/route.ts           # Ask Mari streaming endpoint
  components/
    layout/Header.tsx
    layout/Footer.tsx
    layout/NowPlaying.tsx      # Spotify slot (connect-to-activate)
    motion/Reveal.tsx          # scroll-reveal primitive (reduced-motion aware)
    sections/Hero.tsx
    sections/Intro.tsx
    sections/BakerySection.tsx
    sections/WorkSection.tsx
    sections/CricketSection.tsx
    sections/MovementSection.tsx
    sections/MapSection.tsx
    sections/NowWatchingSection.tsx
    ask/AskMari.tsx            # chat island (client)
    media/PhotoGallery.tsx     # grid + lightbox
    media/Lightbox.tsx
    map/IndiaMap.tsx           # d3-geo + TopoJSON, highlights visited
  content/
    recipes/*.mdx              # authored bakes
    travel-logs/*.mdx          # optional travel write-ups
  data/
    profile.ts                 # name, socials, tagline, milestone stats
    travel.ts                  # visited states/UTs + metadata
    cricket.ts                 # bowling identity + fan list
    work.ts                    # case studies / experience highlights
    about-corpus.ts            # grounding text for Ask Mari
  lib/
    content.ts                 # MDX file loader + frontmatter types
    letterboxd.ts              # RSS fetch + parse
    strava.ts                  # connect-to-activate fetcher
    spotify.ts                 # connect-to-activate fetcher
    motion.ts                  # shared easing/variants constants
  test/
    setup.ts                   # Testing Library + jsdom setup
```

---

## Phase 0 — Foundation

### Task 1: Scaffold Next.js into the existing repo

**Files:**
- Create: whole Next.js app skeleton in repo root (alongside existing `docs/`, `.git`, `.gitignore`).

- [ ] **Step 1: Move docs aside so create-next-app sees a clean dir**

Run (from repo root `C:\Users\ASUS\OneDrive\Desktop\mariprasad-site`):
```bash
mv docs ../_docs_tmp
```

- [ ] **Step 2: Scaffold**

Run:
```bash
npx create-next-app@latest . --ts --app --tailwind --eslint --src-dir --import-alias "@/*" --use-npm --no-turbopack
```
Accept defaults for any remaining prompts. Expected: a Next.js app generated in the current directory.

- [ ] **Step 3: Restore docs and confirm git still intact**

Run:
```bash
rm -rf docs && mv ../_docs_tmp docs && git status
```
Expected: untracked Next.js files listed; `docs/` still present; `.git` intact.

- [ ] **Step 4: Verify dev server boots**

Run:
```bash
npm run dev
```
Open http://localhost:3000 — expect the Next.js starter page. Stop the server (Ctrl-C).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app (ts, app router, tailwind)"
```

---

### Task 2: Theme tokens, fonts, texture, reduced-motion

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace globals.css with theme tokens + texture**

Replace the entire contents of `src/app/globals.css` with:
```css
@import "tailwindcss";

@theme {
  --color-paper: #efe6d6;
  --color-paper-deep: #e3d5bd;
  --color-ink: #3d2f1e;
  --color-ink-soft: #6b573a;
  --color-terracotta: #a8553a;
  --color-pine: #5b6e4f;
  --font-display: var(--font-fraunces), ui-serif, Georgia, serif;
  --font-body: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-mono-jb), ui-monospace, monospace;
}

:root { color-scheme: light; }

body {
  background-color: var(--color-paper);
  background-image:
    linear-gradient(135deg, var(--color-paper), var(--color-paper-deep)),
    radial-gradient(rgba(201, 180, 143, 0.35) 0.5px, transparent 0.5px);
  background-size: cover, 6px 6px;
  background-attachment: fixed;
  color: var(--color-ink);
  font-family: var(--font-body);
}

h1, h2, h3 { font-family: var(--font-display); }
.label { font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.7rem; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Wire fonts in layout.tsx**

Replace `src/app/layout.tsx` with:
```tsx
import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-jb" });

export const metadata: Metadata = {
  title: "Mariprasad Ramakrishna",
  description: "Likes to bowl fast and bake slow.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${inter.variable} ${mono.variable}`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create placeholder Header/Footer so layout compiles**

Create `src/components/layout/Header.tsx`:
```tsx
import Link from "next/link";

const links = [
  ["Baking", "/baking"],
  ["Travel", "/travel"],
  ["Movement", "/movement"],
  ["Movies", "/movies"],
  ["Work", "/work"],
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-sm bg-paper/70 border-b border-ink/10">
      <nav className="mx-auto max-w-5xl flex items-center justify-between px-5 py-3">
        <Link href="/" className="label text-ink">mari</Link>
        <ul className="flex gap-4 text-sm text-ink-soft">
          {links.map(([label, href]) => (
            <li key={href}><Link href={href} className="hover:text-terracotta transition-colors">{label}</Link></li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
```

Create `src/components/layout/Footer.tsx`:
```tsx
export default function Footer() {
  return (
    <footer className="mx-auto max-w-5xl px-5 py-16 text-sm text-ink-soft border-t border-ink/10 mt-24">
      <p>Built slowly, like the bread. © Mariprasad Ramakrishna.</p>
    </footer>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build succeeds, no type errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: theme tokens, fonts, paper texture, reduced-motion, layout shell"
```

---

### Task 3: Install test tooling + Motion + the Reveal primitive

**Files:**
- Create: `vitest.config.ts`, `src/test/setup.ts`, `src/lib/motion.ts`, `src/components/motion/Reveal.tsx`, `src/components/motion/Reveal.test.tsx`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Install deps**

Run:
```bash
npm i motion
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Vitest config + setup**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", globals: true, setupFiles: ["./src/test/setup.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

Create `src/test/setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

Add to `package.json` `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Shared motion constants**

Create `src/lib/motion.ts`:
```ts
export const EASE_ORGANIC = [0.22, 1, 0.36, 1] as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_ORGANIC } },
};
```

- [ ] **Step 4: Write the Reveal smoke test**

Create `src/components/motion/Reveal.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import Reveal from "./Reveal";

test("renders its children", () => {
  render(<Reveal><p>hello dough</p></Reveal>);
  expect(screen.getByText("hello dough")).toBeInTheDocument();
});
```

- [ ] **Step 5: Run it — expect failure (module missing)**

Run: `npm test -- Reveal`
Expected: FAIL — cannot find `./Reveal`.

- [ ] **Step 6: Implement Reveal**

Create `src/components/motion/Reveal.tsx`:
```tsx
"use client";
import { motion } from "motion/react";
import { fadeUp } from "@/lib/motion";

export default function Reveal({
  children, className, as = "div",
}: { children: React.ReactNode; className?: string; as?: "div" | "section" }) {
  const M = as === "section" ? motion.section : motion.div;
  return (
    <M
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </M>
  );
}
```

- [ ] **Step 7: Run test — expect pass**

Run: `npm test -- Reveal`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: vitest + motion; Reveal scroll primitive with test"
```

---

## Phase 1 — Content & data foundations (TDD)

### Task 4: MDX content pipeline + frontmatter types

**Files:**
- Create: `src/lib/content.ts`, `src/lib/content.test.ts`, `src/content/recipes/milk-bread.mdx` (seed)
- Install: `gray-matter`, `next-mdx-remote`

- [ ] **Step 1: Install**

Run: `npm i gray-matter next-mdx-remote`

- [ ] **Step 2: Seed one recipe so tests have a fixture**

Create `src/content/recipes/milk-bread.mdx`:
```mdx
---
title: Everyday Milk Bread
date: 2024-08-12
proofTime: overnight
difficulty: easy
summary: The soft, pillowy loaf that started it all.
cover: /photos/baking/milk-bread/cover.jpg
photos:
  - /photos/baking/milk-bread/crumb.jpg
---

A tangzhong-based milk bread. Soft crumb, thin crust, gone by breakfast.
```

- [ ] **Step 3: Write failing tests for the loader**

Create `src/lib/content.test.ts`:
```ts
import { getRecipeSlugs, getRecipe } from "./content";

test("lists recipe slugs from the content dir", () => {
  expect(getRecipeSlugs()).toContain("milk-bread");
});

test("parses frontmatter and body for a recipe", () => {
  const r = getRecipe("milk-bread");
  expect(r.meta.title).toBe("Everyday Milk Bread");
  expect(r.meta.proofTime).toBe("overnight");
  expect(r.content).toContain("tangzhong");
});
```

- [ ] **Step 4: Run — expect failure**

Run: `npm test -- content`
Expected: FAIL — `./content` not found.

- [ ] **Step 5: Implement the loader**

Create `src/lib/content.ts`:
```ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const RECIPES_DIR = path.join(process.cwd(), "src/content/recipes");

export type RecipeMeta = {
  title: string;
  date: string;
  proofTime: string;   // "overnight" | "24h" | "72h / 3 days" etc.
  difficulty?: string;
  summary: string;
  cover?: string;
  photos?: string[];
};

export type Recipe = { slug: string; meta: RecipeMeta; content: string };

export function getRecipeSlugs(): string[] {
  return fs.readdirSync(RECIPES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getRecipe(slug: string): Recipe {
  const raw = fs.readFileSync(path.join(RECIPES_DIR, `${slug}.mdx`), "utf8");
  const { data, content } = matter(raw);
  return { slug, meta: data as RecipeMeta, content };
}

export function getAllRecipes(): Recipe[] {
  return getRecipeSlugs()
    .map(getRecipe)
    .sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1));
}
```

- [ ] **Step 6: Run — expect pass**

Run: `npm test -- content`
Expected: PASS (both tests).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: MDX recipe loader with frontmatter types and tests"
```

---

### Task 5: Travel data + region helpers

**Files:**
- Create: `src/data/travel.ts`, `src/data/travel.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/data/travel.test.ts`:
```ts
import { VISITED, visitedCount, byZone } from "./travel";

test("has 20 unique visited regions", () => {
  const ids = VISITED.map((v) => v.id);
  expect(new Set(ids).size).toBe(20);
  expect(visitedCount()).toBe(20);
});

test("groups regions by zone", () => {
  expect(byZone().South.map((v) => v.name)).toContain("Karnataka");
  expect(byZone().Northeast.map((v) => v.name)).toContain("Meghalaya");
});
```

- [ ] **Step 2: Run — expect failure**

Run: `npm test -- travel`
Expected: FAIL — `./travel` not found.

- [ ] **Step 3: Implement**

Create `src/data/travel.ts`:
```ts
export type Zone = "South" | "West" | "Central" | "North" | "Northeast";
export type Region = { id: string; name: string; zone: Zone; ut?: boolean };

export const VISITED: Region[] = [
  { id: "KA", name: "Karnataka", zone: "South" },
  { id: "KL", name: "Kerala", zone: "South" },
  { id: "TN", name: "Tamil Nadu", zone: "South" },
  { id: "PY", name: "Puducherry", zone: "South", ut: true },
  { id: "AP", name: "Andhra Pradesh", zone: "South" },
  { id: "TG", name: "Telangana", zone: "South" },
  { id: "MH", name: "Maharashtra", zone: "West" },
  { id: "GA", name: "Goa", zone: "West" },
  { id: "GJ", name: "Gujarat", zone: "West" },
  { id: "RJ", name: "Rajasthan", zone: "West" },
  { id: "MP", name: "Madhya Pradesh", zone: "Central" },
  { id: "DL", name: "Delhi", zone: "North", ut: true },
  { id: "PB", name: "Punjab", zone: "North" },
  { id: "HP", name: "Himachal Pradesh", zone: "North" },
  { id: "JK", name: "Jammu & Kashmir", zone: "North", ut: true },
  { id: "LA", name: "Ladakh", zone: "North", ut: true },
  { id: "BR", name: "Bihar", zone: "Northeast" },
  { id: "WB", name: "West Bengal", zone: "Northeast" },
  { id: "ML", name: "Meghalaya", zone: "Northeast" },
  { id: "AS", name: "Assam", zone: "Northeast" },
];

export function visitedCount(): number {
  return new Set(VISITED.map((v) => v.id)).size;
}

export function byZone(): Record<Zone, Region[]> {
  const out = { South: [], West: [], Central: [], North: [], Northeast: [] } as Record<Zone, Region[]>;
  for (const r of VISITED) out[r.zone].push(r);
  return out;
}
```

> Note: `id` values are ISO-3166-2:IN codes (handy stable keys for lists/UI). The IndiaMap in Task 14 matches visited regions to TopoJSON features by **name** (via `src/lib/geo.ts`), not by these ids. "East/Northeast" is collapsed into the `Northeast` zone label for display; the travel page header reads "East & Northeast".

- [ ] **Step 4: Run — expect pass**

Run: `npm test -- travel`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: travel data (20 states/UTs) with zone helpers and tests"
```

---

### Task 6: Static profile/cricket/work data + Ask Mari corpus

**Files:**
- Create: `src/data/profile.ts`, `src/data/cricket.ts`, `src/data/work.ts`, `src/data/about-corpus.ts`

- [ ] **Step 1: profile.ts**

Create `src/data/profile.ts`:
```ts
export const PROFILE = {
  name: "Mariprasad Ramakrishna",
  tagline: "likes to bowl fast and bake slow",
  location: "Bengaluru, India",
  email: "mari2prasad@gmail.com",
  socials: {
    linkedin: "https://www.linkedin.com/in/mariprasadr",
    github: "", // TODO: Mari to provide recent GitHub URL
  },
  letterboxdUser: "", // TODO: Mari to provide Letterboxd username
  milestones: [
    { label: "Highest trek", value: "15,500 ft" },
    { label: "First trail run", value: "10k" },
    { label: "States & UTs, solo", value: "20" },
    { label: "Baking since", value: "Jul 2024" },
  ],
};
```

- [ ] **Step 2: cricket.ts**

Create `src/data/cricket.ts`:
```ts
export const CRICKET = {
  role: "Right-arm fast — I bowl.",
  heroes: ["Dale Steyn", "Glenn McGrath", "Brett Lee"],
  loves: "fast bowling in all its forms",
  batsman: "Sachin Tendulkar",
  team: "Royal Challengers Bengaluru (IPL)",
};
```

- [ ] **Step 3: work.ts**

Create `src/data/work.ts`:
```ts
export type Role = { company: string; title: string; period: string; blurb: string };

export const FEATURED = {
  title: "LLM Flight-Search Pipeline",
  company: "Techtree Labs",
  blurb:
    "A server-side flight-search pipeline using the OpenAI API with JSON-schema structured outputs, Zod validation, and anti-hallucination grounding against a live airport API.",
  stack: ["Next.js", "Node.js", "OpenAI API", "Zod", "PostgreSQL"],
};

export const EXPERIENCE: Role[] = [
  { company: "Techtree Labs", title: "Full-Stack / Founding Engineer", period: "Apr 2024 – present", blurb: "End-to-end React/Next.js + Node features for Karnataka Govt MGNREGA and utravel.com; shipped the LLM flight-search pipeline." },
  { company: "YouKraft", title: "Tech Lead", period: "Sep 2021 – Dec 2022", blurb: "Marketplace platform with role-based admin, GraphQL APIs, Prisma + PostgreSQL, Next.js frontend." },
  { company: "Thrillark", title: "Frontend Developer", period: "Jan 2020 – May 2021", blurb: "Travel activity booking UIs with React + Sass." },
  { company: "Crain Communications", title: "Senior Frontend Developer", period: "Jul 2016 – Oct 2019", blurb: "Analytics dashboards and D3.js data-viz, NYC." },
  { company: "Global Citizen", title: "Frontend Developer", period: "Jun 2015 – Jul 2016", blurb: "Campaign web apps on a Django backend, NYC." },
];

export const RESUME_URL = "/Mariprasad_Ramakrishna_Resume.pdf";
```

> Place a copy of the resume PDF at `public/Mariprasad_Ramakrishna_Resume.pdf` in this task.

- [ ] **Step 4: about-corpus.ts (Ask Mari grounding)**

Create `src/data/about-corpus.ts`:
```ts
// Single source of truth for the Ask Mari grounding context.
// Keep this factual and first-person; the model may ONLY use what's here.
export const ABOUT_CORPUS = `
You are answering as Mariprasad Ramakrishna ("Mari"), in a warm, concise first-person voice.

IDENTITY
- Full-stack engineer & technical lead, 10+ years (React/Next.js, Node.js, LLM features). Based in Bengaluru.
- Tagline: "likes to bowl fast and bake slow."

CRICKET
- Plays cricket; bowls right-arm fast.
- Heroes: Dale Steyn, Glenn McGrath, Brett Lee; loves fast bowling generally.
- Favourite batsman: Sachin Tendulkar. IPL team: Royal Challengers Bengaluru.

BAKING (since July 2024)
- Many milk breads; semi-sourdough breads (~24h); true sourdough (~3 days / 72h).
- Tried croissants, failed honestly so far, intends to conquer them.
- Cooks occasionally these days.

MOVEMENT
- Basic mountaineering certificate from ABVMAS, Himachal.
- Trekked up to 15,500 ft. Finished first 10k trail run.

TRAVEL
- Solo travel across 20 states & UTs of India.

WORK HIGHLIGHT
- Built a server-side LLM flight-search pipeline (OpenAI API, JSON-schema structured outputs, Zod validation, grounding against a live airport API) at Techtree Labs.

RULES
- Only use facts above. If asked something not covered, say you're not sure / it's not something on the site, and offer what you do know. Never invent specifics (scores, dates, places) not listed.
`.trim();
```

- [ ] **Step 5: Type-check**

Run: `npm run build` (or `npx tsc --noEmit`)
Expected: no type errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: profile, cricket, work data + Ask Mari grounding corpus"
```

---

## Phase 2 — Homepage sections

> Pattern for every section component: a Server Component exporting a `<section>` wrapped in `Reveal`, using theme tokens, with a smoke test asserting key text/links. Build verification + browser check confirm visuals.

### Task 7: Hero section

**Files:**
- Create: `src/components/sections/Hero.tsx`, `src/components/sections/Hero.test.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Write smoke test**

Create `src/components/sections/Hero.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import Hero from "./Hero";

test("shows name and tagline", () => {
  render(<Hero />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mariprasad");
  expect(screen.getByText(/bowl fast and bake slow/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run — expect failure**

Run: `npm test -- Hero`
Expected: FAIL — `./Hero` not found.

- [ ] **Step 3: Implement Hero**

Create `src/components/sections/Hero.tsx`:
```tsx
import { PROFILE } from "@/data/profile";

export default function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-5 pt-24 pb-20">
      <p className="label text-terracotta">{PROFILE.location} · slow-fermented since last July</p>
      <h1 className="mt-6 text-5xl sm:text-7xl leading-[0.95] font-semibold text-ink">
        {PROFILE.name}
      </h1>
      <p className="mt-6 text-xl sm:text-2xl text-ink-soft max-w-xl">
        — {PROFILE.tagline}.
      </p>
    </section>
  );
}
```

- [ ] **Step 4: Mount on homepage**

Replace `src/app/page.tsx` with:
```tsx
import Hero from "@/components/sections/Hero";

export default function Home() {
  return (
    <>
      <Hero />
    </>
  );
}
```

- [ ] **Step 5: Run test + build**

Run: `npm test -- Hero` → PASS. Then `npm run dev`, open http://localhost:3000, confirm the hero renders on paper texture. Stop server.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: hero section"
```

---

### Task 8: Intro section (+ Ask Mari mount slot)

**Files:**
- Create: `src/components/sections/Intro.tsx`, `src/components/sections/Intro.test.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Smoke test**

Create `src/components/sections/Intro.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import Intro from "./Intro";

test("renders intro copy and an ask prompt", () => {
  render(<Intro />);
  expect(screen.getByText(/curious about something/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run — expect failure**

Run: `npm test -- Intro` → FAIL.

- [ ] **Step 3: Implement (AskMari mounted later in Task 22; placeholder slot for now)**

Create `src/components/sections/Intro.tsx`:
```tsx
import Reveal from "@/components/motion/Reveal";

export default function Intro() {
  return (
    <Reveal as="section" className="mx-auto max-w-5xl px-5 py-16">
      <p className="text-2xl leading-relaxed text-ink max-w-2xl">
        I build software for a living and bread for the joy of it. Somewhere between a
        fast outswinger and a 72-hour sourdough is roughly where you&apos;ll find me —
        plus a few mountains and a lot of train journeys.
      </p>
      <div id="ask-mari-slot" className="mt-10 max-w-2xl">
        <p className="label text-terracotta">Curious about something? Ask me.</p>
      </div>
    </Reveal>
  );
}
```

- [ ] **Step 4: Add to homepage** (after `<Hero />`):
```tsx
import Intro from "@/components/sections/Intro";
// ...
<Hero />
<Intro />
```

- [ ] **Step 5: Test + build** → `npm test -- Intro` PASS; `npm run build` succeeds.

- [ ] **Step 6: Commit**
```bash
git add -A && git commit -m "feat: intro section with ask-mari slot"
```

---

### Task 9: Bakery teaser section

**Files:**
- Create: `src/components/sections/BakerySection.tsx`, `.test.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Smoke test**

Create `src/components/sections/BakerySection.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import BakerySection from "./BakerySection";

test("teases recent bakes and links to /baking", () => {
  render(<BakerySection />);
  expect(screen.getByText(/the bakery/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /all bakes|baking/i })).toHaveAttribute("href", "/baking");
});
```

- [ ] **Step 2: Run — expect failure** → `npm test -- BakerySection` FAIL.

- [ ] **Step 3: Implement** (pulls up to 3 most recent recipes via the loader)

Create `src/components/sections/BakerySection.tsx`:
```tsx
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/motion/Reveal";
import { getAllRecipes } from "@/lib/content";

export default function BakerySection() {
  const recent = getAllRecipes().slice(0, 3);
  return (
    <Reveal as="section" className="mx-auto max-w-5xl px-5 py-20">
      <div className="flex items-baseline justify-between">
        <h2 className="text-4xl text-ink">The Bakery</h2>
        <Link href="/baking" className="label text-terracotta hover:underline">All bakes →</Link>
      </div>
      <p className="mt-3 text-ink-soft max-w-xl">Milk breads, semi-sourdoughs, the occasional honest croissant failure.</p>
      <div className="mt-8 grid sm:grid-cols-3 gap-5">
        {recent.map((r) => (
          <Link key={r.slug} href={`/baking/${r.slug}`} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-paper-deep">
              {r.meta.cover && (
                <Image src={r.meta.cover} alt={r.meta.title} fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width:640px) 100vw, 33vw" />
              )}
            </div>
            <p className="mt-3 font-display text-lg text-ink">{r.meta.title}</p>
            <p className="label text-ink-soft">{r.meta.proofTime}</p>
          </Link>
        ))}
      </div>
    </Reveal>
  );
}
```

- [ ] **Step 4: Add to homepage** after `<Intro />`:
```tsx
import BakerySection from "@/components/sections/BakerySection";
// ...
<Intro />
<BakerySection />
```

- [ ] **Step 5: Test + build** → test PASS; build succeeds (cover image may 404 until photos added — acceptable; `next/image` renders the box).

- [ ] **Step 6: Commit**
```bash
git add -A && git commit -m "feat: bakery teaser section pulling recent recipes"
```

---

### Task 10: Work section

**Files:**
- Create: `src/components/sections/WorkSection.tsx`, `.test.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Smoke test**

Create `src/components/sections/WorkSection.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import WorkSection from "./WorkSection";

test("features the LLM pipeline and links to /work", () => {
  render(<WorkSection />);
  expect(screen.getByText(/flight-search/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /work/i })).toHaveAttribute("href", "/work");
});
```

- [ ] **Step 2: Run — expect failure** → FAIL.

- [ ] **Step 3: Implement**

Create `src/components/sections/WorkSection.tsx`:
```tsx
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import { FEATURED } from "@/data/work";

export default function WorkSection() {
  return (
    <Reveal as="section" className="mx-auto max-w-5xl px-5 py-20">
      <div className="flex items-baseline justify-between">
        <h2 className="text-4xl text-ink">The Work</h2>
        <Link href="/work" className="label text-terracotta hover:underline">More work →</Link>
      </div>
      <div className="mt-8 rounded-2xl border border-ink/10 bg-paper/40 p-7">
        <p className="label text-pine">{FEATURED.company} · featured</p>
        <h3 className="mt-2 text-2xl text-ink">{FEATURED.title}</h3>
        <p className="mt-3 text-ink-soft max-w-2xl">{FEATURED.blurb}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {FEATURED.stack.map((s) => (
            <li key={s} className="label rounded-full border border-ink/15 px-3 py-1 text-ink-soft">{s}</li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
```

- [ ] **Step 4: Add to homepage** after `<BakerySection />`.

- [ ] **Step 5: Test + build** → PASS / success.

- [ ] **Step 6: Commit**
```bash
git add -A && git commit -m "feat: work section with featured LLM pipeline"
```

---

### Task 11: Cricket section

**Files:**
- Create: `src/components/sections/CricketSection.tsx`, `.test.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Smoke test**

Create `src/components/sections/CricketSection.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import CricketSection from "./CricketSection";

test("shows bowling identity and heroes", () => {
  render(<CricketSection />);
  expect(screen.getByText(/i bowl/i)).toBeInTheDocument();
  expect(screen.getByText(/Dale Steyn/)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run — expect failure** → FAIL.

- [ ] **Step 3: Implement**

Create `src/components/sections/CricketSection.tsx`:
```tsx
import Reveal from "@/components/motion/Reveal";
import { CRICKET } from "@/data/cricket";

export default function CricketSection() {
  return (
    <Reveal as="section" className="mx-auto max-w-5xl px-5 py-20">
      <p className="label text-terracotta">Pace</p>
      <h2 className="mt-2 text-4xl text-ink">{CRICKET.role}</h2>
      <p className="mt-4 text-ink-soft max-w-xl">
        Raised on {CRICKET.loves}. The heroes:{" "}
        <span className="text-ink">{CRICKET.heroes.join(", ")}</span>. With a bat in hand,
        no one taught me more than {CRICKET.batsman}. And come IPL, it&apos;s {CRICKET.team} — always.
      </p>
    </Reveal>
  );
}
```

- [ ] **Step 4: Add to homepage** after `<WorkSection />`.

- [ ] **Step 5: Test + build** → PASS / success.

- [ ] **Step 6: Commit**
```bash
git add -A && git commit -m "feat: cricket section"
```

---

### Task 12: Movement section

**Files:**
- Create: `src/components/sections/MovementSection.tsx`, `.test.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Smoke test**

Create `src/components/sections/MovementSection.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import MovementSection from "./MovementSection";

test("shows trek altitude and 10k milestone and links to /movement", () => {
  render(<MovementSection />);
  expect(screen.getByText(/15,500 ft/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /movement/i })).toHaveAttribute("href", "/movement");
});
```

- [ ] **Step 2: Run — expect failure** → FAIL.

- [ ] **Step 3: Implement** (Strava feed wired in Task 23; static milestones now)

Create `src/components/sections/MovementSection.tsx`:
```tsx
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

const STATS = [
  { label: "Highest trek", value: "15,500 ft" },
  { label: "ABVMAS, Himachal", value: "Mountaineering cert" },
  { label: "First trail run", value: "10k" },
];

export default function MovementSection() {
  return (
    <Reveal as="section" className="mx-auto max-w-5xl px-5 py-20">
      <div className="flex items-baseline justify-between">
        <h2 className="text-4xl text-ink">Movement</h2>
        <Link href="/movement" className="label text-terracotta hover:underline">The full climb →</Link>
      </div>
      <div className="mt-8 grid sm:grid-cols-3 gap-5">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-pine/30 bg-pine/5 p-5">
            <p className="text-2xl font-display text-ink">{s.value}</p>
            <p className="label text-pine mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
```

- [ ] **Step 4: Add to homepage** after `<CricketSection />`.

- [ ] **Step 5: Test + build** → PASS / success.

- [ ] **Step 6: Commit**
```bash
git add -A && git commit -m "feat: movement section with milestone stats"
```

---

### Task 13: Map section (uses IndiaMap, built in Task 14)

> Build `IndiaMap` first (Task 14), then this section. Ordered this way so the section's test can rely on the map. If executing strictly top-down, implement Task 14 before this task's Step 3.

**Files:**
- Create: `src/components/sections/MapSection.tsx`, `.test.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Smoke test**

Create `src/components/sections/MapSection.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import MapSection from "./MapSection";

test("headlines the 20-region stat and links to /travel", () => {
  render(<MapSection />);
  expect(screen.getByText(/20/).textContent).toMatch(/20/);
  expect(screen.getByRole("link", { name: /map|travel/i })).toHaveAttribute("href", "/travel");
});
```

- [ ] **Step 2: Run — expect failure** → FAIL.

- [ ] **Step 3: Implement**

Create `src/components/sections/MapSection.tsx`:
```tsx
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import IndiaMap from "@/components/map/IndiaMap";
import { visitedCount } from "@/data/travel";

export default function MapSection() {
  return (
    <Reveal as="section" className="mx-auto max-w-5xl px-5 py-20">
      <div className="flex items-baseline justify-between">
        <h2 className="text-4xl text-ink">On the Map</h2>
        <Link href="/travel" className="label text-terracotta hover:underline">The full map →</Link>
      </div>
      <p className="mt-3 text-ink-soft">
        <span className="text-ink font-display text-2xl">{visitedCount()}</span> states &amp; UTs, solo.
      </p>
      <div className="mt-6 max-w-md mx-auto">
        <IndiaMap />
      </div>
    </Reveal>
  );
}
```

- [ ] **Step 4: Add to homepage** after `<MovementSection />`.

- [ ] **Step 5: Test + build** → PASS / success.

- [ ] **Step 6: Commit**
```bash
git add -A && git commit -m "feat: map section with visited-count headline"
```

---

### Task 14: IndiaMap component (d3-geo + TopoJSON, highlight visited)

**Approach:** Load an India-states **TopoJSON**, convert to GeoJSON features (`topojson-client`), project with `d3-geo` (`geoMercator().fitSize(...)`), generate each state's path `d` with `geoPath`, and color states by matching their name to our travel data. `d3-geo` is pure math, so this stays a **Server Component** (no client JS). No hand-pasted path data.

**Files:**
- Create: `src/components/map/IndiaMap.tsx`, `src/components/map/IndiaMap.test.tsx`, `src/lib/geo.ts`, `src/lib/geo.test.ts`
- Add asset: `src/data/india.topo.json`
- Install: `d3-geo`, `topojson-client` (+ types)

- [ ] **Step 1: Install + fetch a current India-states TopoJSON**

Run:
```bash
npm i d3-geo topojson-client
npm i -D @types/d3-geo @types/topojson-client
```
Fetch a TopoJSON with **current (post-2019) boundaries** — i.e. Telangana and Ladakh present as separate states/UTs. Known source: `udit-001/india-maps-data` (states TopoJSON). Save it:
```bash
curl -L -o src/data/india.topo.json https://raw.githubusercontent.com/udit-001/india-maps-data/main/topojson/india.json
```
> Verify the file: open it and note (a) the key under `objects` (e.g. `india`), and (b) the per-feature name property (commonly `st_nm`, sometimes `NAME_1`). The component reads these defensively, but confirm Ladakh appears as its own feature — if the file predates the 2019 split, pick another source, else the Step 4 test will (correctly) fail with a count of 19.

- [ ] **Step 2: TDD the name-matcher**

Create `src/lib/geo.test.ts`:
```ts
import { norm, isVisitedName } from "./geo";

test("normalizes names (case, ampersand, punctuation)", () => {
  expect(norm("Jammu & Kashmir")).toBe("jammuandkashmir");
  expect(norm("Tamil Nadu")).toBe("tamilnadu");
});

test("matches visited states including the Delhi alias", () => {
  expect(isVisitedName("Karnataka")).toBe(true);
  expect(isVisitedName("NCT of Delhi")).toBe(true); // alias → Delhi
  expect(isVisitedName("Ladakh")).toBe(true);
  expect(isVisitedName("Uttar Pradesh")).toBe(false); // not visited
});
```

- [ ] **Step 3: Run — expect failure** → `npm test -- geo` FAIL.

- [ ] **Step 4: Implement the matcher**

Create `src/lib/geo.ts`:
```ts
import { VISITED } from "@/data/travel";

export function norm(s: string): string {
  return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "");
}

// Map normalized TopoJSON feature-name variants onto our canonical region names.
const ALIASES: Record<string, string> = {
  nctofdelhi: "delhi",
  delhinct: "delhi",
};

const visitedNorm = new Set(VISITED.map((v) => norm(v.name)));

export function isVisitedName(featureName: string): boolean {
  const n = norm(featureName);
  return visitedNorm.has(n) || visitedNorm.has(ALIASES[n] ?? "");
}
```

- [ ] **Step 5: Run test — expect pass** → PASS.

- [ ] **Step 6: Write the IndiaMap smoke test**

Create `src/components/map/IndiaMap.test.tsx`:
```tsx
import { render } from "@testing-library/react";
import IndiaMap from "./IndiaMap";
import { VISITED } from "@/data/travel";

test("renders state paths and marks exactly the visited ones", () => {
  const { container } = render(<IndiaMap />);
  const all = container.querySelectorAll("path");
  expect(all.length).toBeGreaterThan(20); // full country outline
  const visited = container.querySelectorAll('[data-visited="true"]');
  expect(visited.length).toBe(VISITED.length); // 20
});
```

- [ ] **Step 7: Run — expect failure** → `npm test -- IndiaMap` FAIL.

- [ ] **Step 8: Implement IndiaMap (server component)**

Create `src/components/map/IndiaMap.tsx`:
```tsx
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection } from "geojson";
import topo from "@/data/india.topo.json";
import { isVisitedName } from "@/lib/geo";

const W = 500, H = 560;

function getFeatureName(props: Record<string, unknown> | null): string {
  if (!props) return "";
  return String(props.st_nm ?? props.NAME_1 ?? props.name ?? "");
}

export default function IndiaMap() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = topo as any;
  const objectKey = Object.keys(t.objects)[0];
  const fc = feature(t, t.objects[objectKey]) as unknown as FeatureCollection;
  const projection = geoMercator().fitSize([W, H], fc);
  const path = geoPath(projection);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label="Map of India with the states and union territories Mari has visited highlighted"
      className="w-full h-auto">
      {fc.features.map((f, i) => {
        const name = getFeatureName(f.properties as Record<string, unknown>);
        const visited = isVisitedName(name);
        return (
          <path key={i} d={path(f) ?? ""}
            data-visited={visited ? "true" : "false"}
            className={visited ? "fill-terracotta/80 stroke-paper" : "fill-paper-deep stroke-ink/15"}
            strokeWidth={0.5}>
            <title>{name}</title>
          </path>
        );
      })}
    </svg>
  );
}
```
> Requires `resolveJsonModule` (default `true` in Next's tsconfig) and `@types/geojson` (transitively present via `@types/d3-geo`; if TS complains, run `npm i -D @types/geojson`).

- [ ] **Step 9: Run test + build** → `npm test -- IndiaMap` PASS; `npm run build` succeeds. Browser-check: a real projected India with the 20 visited regions in terracotta.

- [ ] **Step 10: Commit**
```bash
git add -A && git commit -m "feat: IndiaMap via d3-geo + TopoJSON, visited regions matched by name"
```

---

### Task 15: NowWatching section (static placeholder; Letterboxd wired in Task 21)

**Files:**
- Create: `src/components/sections/NowWatchingSection.tsx`, `.test.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Smoke test**

Create `src/components/sections/NowWatchingSection.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import NowWatchingSection from "./NowWatchingSection";

test("renders heading and links to /movies", () => {
  render(<NowWatchingSection films={[]} />);
  expect(screen.getByText(/now watching/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /watchlist|movies/i })).toHaveAttribute("href", "/movies");
});
```

- [ ] **Step 2: Run — expect failure** → FAIL.

- [ ] **Step 3: Implement** (accepts a `films` prop; homepage passes [] for now, real data in Task 21)

Create `src/components/sections/NowWatchingSection.tsx`:
```tsx
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/motion/Reveal";
import type { Film } from "@/lib/letterboxd";

export default function NowWatchingSection({ films }: { films: Film[] }) {
  return (
    <Reveal as="section" className="mx-auto max-w-5xl px-5 py-20">
      <div className="flex items-baseline justify-between">
        <h2 className="text-4xl text-ink">Now Watching</h2>
        <Link href="/movies" className="label text-terracotta hover:underline">Full watchlist →</Link>
      </div>
      {films.length === 0 ? (
        <p className="mt-4 text-ink-soft">Recently-watched films will appear here.</p>
      ) : (
        <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
          {films.slice(0, 8).map((f) => (
            <a key={f.url} href={f.url} className="shrink-0 w-28">
              {f.poster && <Image src={f.poster} alt={f.title} width={112} height={168} className="rounded-md" />}
              <p className="mt-2 text-sm text-ink truncate">{f.title}</p>
            </a>
          ))}
        </div>
      )}
    </Reveal>
  );
}
```
> This imports the `Film` type from `@/lib/letterboxd` — fully defined in Task 21. To keep this task self-contained and compiling now, Step 4 creates a minimal stub of that file with the same `Film` shape; Task 21 expands it with the parser/fetcher.

- [ ] **Step 4: Create the letterboxd type stub now** so this compiles:

Create `src/lib/letterboxd.ts` (will be expanded in Task 21):
```ts
export type Film = { title: string; url: string; poster?: string; watchedAt?: string };
```

- [ ] **Step 5: Add to homepage** after `<MapSection />`, passing empty films:
```tsx
import NowWatchingSection from "@/components/sections/NowWatchingSection";
// ...
<MapSection />
<NowWatchingSection films={[]} />
```

- [ ] **Step 6: Test + build** → PASS / success. Browser-check the homepage now scrolls Hero → Intro → Bakery → Work → Cricket → Movement → Map → NowWatching → Footer.

- [ ] **Step 7: Commit**
```bash
git add -A && git commit -m "feat: now-watching section (placeholder films)"
```

---

## Phase 3 — Sub-pages & media

### Task 16: PhotoGallery + Lightbox

**Files:**
- Create: `src/components/media/PhotoGallery.tsx`, `src/components/media/Lightbox.tsx`, `src/components/media/PhotoGallery.test.tsx`

- [ ] **Step 1: Smoke + interaction test**

Create `src/components/media/PhotoGallery.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PhotoGallery from "./PhotoGallery";

const photos = ["/a.jpg", "/b.jpg"];

test("renders thumbnails and opens lightbox on click", async () => {
  render(<PhotoGallery photos={photos} alt="bake" />);
  const thumbs = screen.getAllByRole("button", { name: /view photo/i });
  expect(thumbs).toHaveLength(2);
  await userEvent.click(thumbs[0]);
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run — expect failure** → FAIL.

- [ ] **Step 3: Implement Lightbox**

Create `src/components/media/Lightbox.tsx`:
```tsx
"use client";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

export default function Lightbox({
  src, alt, onClose,
}: { src: string | null; alt: string; onClose: () => void }) {
  return (
    <AnimatePresence>
      {src && (
        <motion.div
          role="dialog" aria-modal="true" aria-label={alt}
          className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-6"
          onClick={onClose}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}
            className="relative w-full max-w-3xl aspect-[3/2]">
            <Image src={src} alt={alt} fill className="object-contain" sizes="100vw" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Implement PhotoGallery**

Create `src/components/media/PhotoGallery.tsx`:
```tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import Lightbox from "./Lightbox";

export default function PhotoGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <>
      <div className="columns-2 sm:columns-3 gap-3 [&>button]:mb-3">
        {photos.map((src) => (
          <button key={src} type="button" aria-label={`View photo of ${alt}`}
            onClick={() => setActive(src)}
            className="block w-full overflow-hidden rounded-lg">
            <Image src={src} alt={alt} width={400} height={500}
              className="w-full h-auto object-cover hover:opacity-90 transition-opacity" />
          </button>
        ))}
      </div>
      <Lightbox src={active} alt={alt} onClose={() => setActive(null)} />
    </>
  );
}
```

- [ ] **Step 5: Run test + build** → PASS / success.

- [ ] **Step 6: Commit**
```bash
git add -A && git commit -m "feat: PhotoGallery with animated lightbox"
```

---

### Task 17: /baking index + recipe pages

**Files:**
- Create: `src/app/baking/page.tsx`, `src/app/baking/[slug]/page.tsx`

- [ ] **Step 1: Index page**

Create `src/app/baking/page.tsx`:
```tsx
import Link from "next/link";
import Image from "next/image";
import { getAllRecipes } from "@/lib/content";

export const metadata = { title: "Baking — Mariprasad" };

export default function BakingIndex() {
  const recipes = getAllRecipes();
  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <h1 className="text-5xl text-ink">The Bakery</h1>
      <p className="mt-3 text-ink-soft max-w-xl">Every bake since July 2024 — proofs, crumbs, and the honest failures.</p>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((r) => (
          <Link key={r.slug} href={`/baking/${r.slug}`} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-paper-deep">
              {r.meta.cover && <Image src={r.meta.cover} alt={r.meta.title} fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width:640px) 100vw, 33vw" />}
            </div>
            <h2 className="mt-3 text-xl text-ink">{r.meta.title}</h2>
            <p className="label text-ink-soft">{r.meta.proofTime} · {r.meta.difficulty ?? "—"}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Recipe detail page (renders MDX + gallery)**

Create `src/app/baking/[slug]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import PhotoGallery from "@/components/media/PhotoGallery";
import { getRecipe, getRecipeSlugs } from "@/lib/content";

export function generateStaticParams() {
  return getRecipeSlugs().map((slug) => ({ slug }));
}

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let recipe;
  try { recipe = getRecipe(slug); } catch { notFound(); }
  const { meta, content } = recipe!;
  return (
    <article className="mx-auto max-w-2xl px-5 py-16">
      <p className="label text-terracotta">{meta.proofTime} proof · {meta.difficulty ?? ""}</p>
      <h1 className="mt-3 text-4xl text-ink">{meta.title}</h1>
      {meta.cover && (
        <div className="relative mt-6 aspect-[3/2] overflow-hidden rounded-xl">
          <Image src={meta.cover} alt={meta.title} fill className="object-cover" sizes="100vw" />
        </div>
      )}
      <div className="prose prose-stone mt-8 max-w-none text-ink">
        <MDXRemote source={content} />
      </div>
      {meta.photos && meta.photos.length > 0 && (
        <div className="mt-10"><PhotoGallery photos={meta.photos} alt={meta.title} /></div>
      )}
    </article>
  );
}
```

- [ ] **Step 3: Install typography plugin** (for `.prose`):

Run: `npm i -D @tailwindcss/typography`
Add to `src/app/globals.css` after the `@import`:
```css
@plugin "@tailwindcss/typography";
```

- [ ] **Step 4: Build + browser-check**

Run: `npm run build` → success. `npm run dev`, visit `/baking` and `/baking/milk-bread`, confirm the MDX renders. Stop server.

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: baking index + MDX recipe pages with gallery"
```

---

### Task 18: /travel page

**Files:**
- Create: `src/app/travel/page.tsx`

- [ ] **Step 1: Implement**

Create `src/app/travel/page.tsx`:
```tsx
import IndiaMap from "@/components/map/IndiaMap";
import { byZone, visitedCount } from "@/data/travel";

export const metadata = { title: "Travel — Mariprasad" };

const ZONE_LABELS: Record<string, string> = {
  South: "South", West: "West", Central: "Central", North: "North", Northeast: "East & Northeast",
};

export default function TravelPage() {
  const zones = byZone();
  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <h1 className="text-5xl text-ink">On the Map</h1>
      <p className="mt-3 text-ink-soft">{visitedCount()} states &amp; UTs, mostly solo, mostly by train.</p>
      <div className="mt-10 grid md:grid-cols-2 gap-10 items-start">
        <div className="max-w-md"><IndiaMap /></div>
        <div className="space-y-6">
          {Object.entries(zones).map(([zone, regions]) =>
            regions.length === 0 ? null : (
              <div key={zone}>
                <h2 className="label text-pine">{ZONE_LABELS[zone] ?? zone}</h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {regions.map((r) => (
                    <li key={r.id} className="rounded-full border border-ink/15 px-3 py-1 text-sm text-ink">
                      {r.name}{r.ut ? " (UT)" : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build + browser-check** `/travel`. → success.

- [ ] **Step 3: Commit**
```bash
git add -A && git commit -m "feat: travel page with map and zoned state list"
```

---

### Task 19: /movement page

**Files:**
- Create: `src/app/movement/page.tsx`
- (Strava feed added in Task 23; static content now.)

- [ ] **Step 1: Implement**

Create `src/app/movement/page.tsx`:
```tsx
export const metadata = { title: "Movement — Mariprasad" };

const TREKS = [
  { name: "Up to 15,500 ft", note: "The highest I've stood. Thin air, wide silence." },
  { name: "ABVMAS, Himachal", note: "Basic mountaineering certificate." },
  { name: "First 10k trail run", note: "One finish line, many more to come." },
];

export default function MovementPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-5xl text-ink">Movement</h1>
      <p className="mt-3 text-ink-soft max-w-xl">
        Bowling keeps me honest, the mountains keep me humble, and running keeps me going.
      </p>
      <div id="strava-slot" className="mt-10" />
      <ul className="mt-6 space-y-5">
        {TREKS.map((t) => (
          <li key={t.name} className="rounded-xl border border-pine/30 bg-pine/5 p-5">
            <p className="text-xl font-display text-ink">{t.name}</p>
            <p className="mt-1 text-ink-soft">{t.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Build + browser-check** → success.

- [ ] **Step 3: Commit**
```bash
git add -A && git commit -m "feat: movement page"
```

---

### Task 20: /work page

**Files:**
- Create: `src/app/work/page.tsx`

- [ ] **Step 1: Implement**

Create `src/app/work/page.tsx`:
```tsx
import { FEATURED, EXPERIENCE, RESUME_URL } from "@/data/work";

export const metadata = { title: "Work — Mariprasad" };

export default function WorkPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-5xl text-ink">The Work</h1>
      <p className="mt-3 text-ink-soft max-w-xl">
        10+ years across frontend architecture, Node APIs, and lately LLM-powered features.
        <a href={RESUME_URL} className="text-terracotta underline ml-1">Résumé (PDF)</a>.
      </p>

      <section className="mt-10 rounded-2xl border border-ink/10 bg-paper/40 p-7">
        <p className="label text-pine">{FEATURED.company} · featured</p>
        <h2 className="mt-2 text-2xl text-ink">{FEATURED.title}</h2>
        <p className="mt-3 text-ink-soft">{FEATURED.blurb}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {FEATURED.stack.map((s) => (
            <li key={s} className="label rounded-full border border-ink/15 px-3 py-1 text-ink-soft">{s}</li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="label text-pine">Experience</h2>
        <ul className="mt-4 space-y-6">
          {EXPERIENCE.map((r) => (
            <li key={r.company} className="border-l-2 border-ink/15 pl-4">
              <p className="text-lg text-ink">{r.title} · {r.company}</p>
              <p className="label text-ink-soft">{r.period}</p>
              <p className="mt-1 text-ink-soft">{r.blurb}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Confirm resume asset exists** at `public/Mariprasad_Ramakrishna_Resume.pdf` (added in Task 6). If missing, copy it there now.

- [ ] **Step 3: Build + browser-check** → success.

- [ ] **Step 4: Commit**
```bash
git add -A && git commit -m "feat: work page with featured project and experience"
```

---

## Phase 4 — Dynamic features & integrations

### Task 21: Letterboxd fetcher (TDD) + /movies page + wire NowWatching

**Files:**
- Modify: `src/lib/letterboxd.ts` (expand the stub)
- Create: `src/lib/letterboxd.test.ts`, `src/app/movies/page.tsx`
- Modify: `src/app/page.tsx` (pass real films)
- Install: `fast-xml-parser`

- [ ] **Step 1: Install**

Run: `npm i fast-xml-parser`

- [ ] **Step 2: Write failing parser test (pure function, fixture-based)**

Create `src/lib/letterboxd.test.ts`:
```ts
import { parseLetterboxdRss } from "./letterboxd";

const SAMPLE = `<?xml version="1.0"?>
<rss><channel>
  <item>
    <title>Dune: Part Two, 2024 - ★★★★½</title>
    <link>https://letterboxd.com/mari/film/dune-part-two/</link>
    <letterboxd:watchedDate>2026-05-10</letterboxd:watchedDate>
    <description><![CDATA[<p><img src="https://image.tmdb.org/poster.jpg"/></p>]]></description>
  </item>
</channel></rss>`;

test("parses title, url, poster, and watched date", () => {
  const films = parseLetterboxdRss(SAMPLE);
  expect(films[0].title).toBe("Dune: Part Two");
  expect(films[0].url).toContain("/film/dune-part-two/");
  expect(films[0].poster).toContain("poster.jpg");
  expect(films[0].watchedAt).toBe("2026-05-10");
});
```

- [ ] **Step 3: Run — expect failure** → `npm test -- letterboxd` FAIL.

- [ ] **Step 4: Implement parser + fetcher**

Replace `src/lib/letterboxd.ts` with:
```ts
import { XMLParser } from "fast-xml-parser";
import { PROFILE } from "@/data/profile";

export type Film = { title: string; url: string; poster?: string; watchedAt?: string };

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", cdataPropName: "cdata" });

export function parseLetterboxdRss(xml: string): Film[] {
  const doc = parser.parse(xml);
  const items = doc?.rss?.channel?.item;
  const list = Array.isArray(items) ? items : items ? [items] : [];
  return list.map((it: any): Film => {
    const rawTitle: string = String(it.title ?? "");
    const title = rawTitle.split(",")[0].split(" - ")[0].trim();
    const desc: string = it.description?.cdata ?? it.description ?? "";
    const poster = /<img[^>]+src="([^"]+)"/.exec(desc)?.[1];
    return {
      title,
      url: String(it.link ?? ""),
      poster,
      watchedAt: it["letterboxd:watchedDate"] ? String(it["letterboxd:watchedDate"]) : undefined,
    };
  });
}

export async function getRecentFilms(): Promise<Film[]> {
  const user = PROFILE.letterboxdUser;
  if (!user) return []; // not configured yet
  try {
    const res = await fetch(`https://letterboxd.com/${user}/rss/`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return parseLetterboxdRss(await res.text());
  } catch {
    return [];
  }
}
```

- [ ] **Step 5: Run test — expect pass** → PASS.

- [ ] **Step 6: /movies page**

Create `src/app/movies/page.tsx`:
```tsx
import Image from "next/image";
import { getRecentFilms } from "@/lib/letterboxd";
import { PROFILE } from "@/data/profile";

export const metadata = { title: "Movies — Mariprasad" };

export default async function MoviesPage() {
  const films = await getRecentFilms();
  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <h1 className="text-5xl text-ink">Now Watching</h1>
      {!PROFILE.letterboxdUser ? (
        <p className="mt-3 text-ink-soft">Letterboxd feed coming soon.</p>
      ) : films.length === 0 ? (
        <p className="mt-3 text-ink-soft">Couldn&apos;t load films right now.</p>
      ) : (
        <div className="mt-10 grid grid-cols-3 sm:grid-cols-5 gap-5">
          {films.map((f) => (
            <a key={f.url} href={f.url} className="group">
              {f.poster && <Image src={f.poster} alt={f.title} width={185} height={278}
                className="rounded-md w-full h-auto" />}
              <p className="mt-2 text-sm text-ink">{f.title}</p>
              {f.watchedAt && <p className="label text-ink-soft">{f.watchedAt}</p>}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Allow TMDB/Letterboxd image hosts** in `next.config.ts`:
```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "a.ltrbxd.com" },
      { protocol: "https", hostname: "**.ltrbxd.com" },
    ],
  },
};
export default nextConfig;
```

- [ ] **Step 8: Wire homepage** to pass real films. In `src/app/page.tsx` make the component async:
```tsx
import { getRecentFilms } from "@/lib/letterboxd";
// ...
export default async function Home() {
  const films = await getRecentFilms();
  return (
    <>
      <Hero />
      <Intro />
      <BakerySection />
      <WorkSection />
      <CricketSection />
      <MovementSection />
      <MapSection />
      <NowWatchingSection films={films} />
    </>
  );
}
```

- [ ] **Step 9: Build + browser-check** (`/movies` shows "coming soon" until `letterboxdUser` set — expected). → success.

- [ ] **Step 10: Commit**
```bash
git add -A && git commit -m "feat: Letterboxd parser/fetcher (tested) + movies page wired"
```

---

### Task 22: Ask Mari — API route + chat island

**Files:**
- Create: `src/app/api/ask/route.ts`, `src/lib/ask-prompt.ts`, `src/lib/ask-prompt.test.ts`, `src/components/ask/AskMari.tsx`
- Modify: `src/components/sections/Intro.tsx` (mount AskMari)
- Install: `ai`, `@ai-sdk/openai`, `zod`

- [ ] **Step 1: Install**

Run: `npm i ai@^4 @ai-sdk/openai zod`

> **Version note (read this):** the code in Steps 6–8 targets **Vercel AI SDK v4**, where the chat hook is `import { useChat } from "ai/react"` and the route returns `result.toDataStreamResponse()`. If you instead install AI SDK **v5**, those moved: hook is `import { useChat } from "@ai-sdk/react"`, the response helper is `toUIMessageStreamResponse()`, and `maxTokens` is configured differently. Pin v4 as above to use the code verbatim, or adapt the two call-sites if you deliberately choose v5. Verify the current API against the installed version's docs before debugging.

- [ ] **Step 2: TDD the prompt/grounding builder**

Create `src/lib/ask-prompt.test.ts`:
```ts
import { buildSystemPrompt, isInScope } from "./ask-prompt";

test("system prompt embeds the corpus and grounding rule", () => {
  const p = buildSystemPrompt();
  expect(p).toMatch(/Dale Steyn/);
  expect(p).toMatch(/Only use facts/i);
});

test("rejects empty or overlong questions", () => {
  expect(isInScope("")).toBe(false);
  expect(isInScope("x".repeat(501))).toBe(false);
  expect(isInScope("What do you bake?")).toBe(true);
});
```

- [ ] **Step 3: Run — expect failure** → FAIL.

- [ ] **Step 4: Implement the builder**

Create `src/lib/ask-prompt.ts`:
```ts
import { ABOUT_CORPUS } from "@/data/about-corpus";

export function buildSystemPrompt(): string {
  return `${ABOUT_CORPUS}\n\nAnswer in 1-3 short sentences. Stay warm and first-person.`;
}

export function isInScope(question: string): boolean {
  const q = question.trim();
  return q.length > 0 && q.length <= 500;
}
```

- [ ] **Step 5: Run test — expect pass** → PASS.

- [ ] **Step 6: API route (streaming)**

Create `src/app/api/ask/route.ts`:
```ts
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { buildSystemPrompt, isInScope } from "@/lib/ask-prompt";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const last = messages?.[messages.length - 1]?.content ?? "";
  if (!isInScope(String(last))) {
    return new Response("Ask me something short about cricket, baking, travel, or my work.", { status: 400 });
  }
  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: buildSystemPrompt(),
    messages,
    temperature: 0.4,
    maxTokens: 220,
  });
  return result.toDataStreamResponse();
}
```
> Requires `OPENAI_API_KEY` in env (Step 9). Model id `gpt-4o-mini` is a cost-appropriate default; adjust if desired.

- [ ] **Step 7: Chat island**

Create `src/components/ask/AskMari.tsx`:
```tsx
"use client";
import { useChat } from "ai/react";

export default function AskMari() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({ api: "/api/ask" });
  return (
    <div className="rounded-2xl border border-ink/15 bg-paper/50 p-5">
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {messages.map((m) => (
          <p key={m.id} className={m.role === "user" ? "text-ink-soft" : "text-ink"}>
            <span className="label mr-2">{m.role === "user" ? "you" : "mari"}</span>
            {m.content}
          </p>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={input} onChange={handleInputChange}
          placeholder="Ask me about a bake, a trek, the bowling…"
          className="flex-1 rounded-lg border border-ink/20 bg-paper px-3 py-2 text-ink outline-none focus:border-terracotta"
        />
        <button type="submit" disabled={isLoading}
          className="rounded-lg bg-terracotta px-4 py-2 text-paper disabled:opacity-50">
          {isLoading ? "…" : "Ask"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 8: Mount in Intro** — replace the `#ask-mari-slot` block in `src/components/sections/Intro.tsx`:
```tsx
import AskMari from "@/components/ask/AskMari";
// ...
      <div id="ask-mari-slot" className="mt-10 max-w-2xl">
        <p className="label text-terracotta">Curious about something? Ask me.</p>
        <div className="mt-3"><AskMari /></div>
      </div>
```
> The Intro smoke test (Task 8) still passes — it only asserts the prompt text, which remains.

- [ ] **Step 9: Env setup**

Create `.env.local` (already gitignored via `.env*.local`):
```
OPENAI_API_KEY=sk-...   # Mari to provide
```
Add `.env.example`:
```
OPENAI_API_KEY=
```

- [ ] **Step 10: Run tests + build**

Run: `npm test` (all pass), `npm run build` (success). With a real key in `.env.local`, `npm run dev` and try asking "what do you bake?" — expect a grounded streamed answer. Without a key, the request errors gracefully.

- [ ] **Step 11: Commit**
```bash
git add -A && git commit -m "feat: Ask Mari grounded streaming chat (route + island + tests)"
```

---

### Task 23: Strava fetcher (connect-to-activate) + Movement feed

**Files:**
- Create: `src/lib/strava.ts`, `src/lib/strava.test.ts`, `src/components/movement/StravaFeed.tsx`
- Modify: `src/app/movement/page.tsx` (mount feed in `#strava-slot`)

- [ ] **Step 1: TDD the fallback contract**

Create `src/lib/strava.test.ts`:
```ts
import { getRecentActivities } from "./strava";

test("returns empty list when not configured", async () => {
  delete process.env.STRAVA_REFRESH_TOKEN;
  expect(await getRecentActivities()).toEqual([]);
});
```

- [ ] **Step 2: Run — expect failure** → FAIL.

- [ ] **Step 3: Implement (graceful when env absent)**

Create `src/lib/strava.ts`:
```ts
export type Activity = { id: number; name: string; type: string; distanceKm: number; date: string };

async function getAccessToken(): Promise<string | null> {
  const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN } = process.env;
  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) return null;
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID, client_secret: STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token", refresh_token: STRAVA_REFRESH_TOKEN,
    }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return (await res.json()).access_token ?? null;
}

export async function getRecentActivities(): Promise<Activity[]> {
  const token = await getAccessToken();
  if (!token) return [];
  try {
    const res = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=5", {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const raw = await res.json();
    return (raw as any[]).map((a) => ({
      id: a.id, name: a.name, type: a.type,
      distanceKm: Math.round((a.distance / 1000) * 10) / 10,
      date: a.start_date_local,
    }));
  } catch {
    return [];
  }
}
```

- [ ] **Step 4: Run test — expect pass** → PASS.

- [ ] **Step 5: Feed component**

Create `src/components/movement/StravaFeed.tsx`:
```tsx
import { getRecentActivities } from "@/lib/strava";

export default async function StravaFeed() {
  const acts = await getRecentActivities();
  if (acts.length === 0) return null; // connect-to-activate: nothing shown until configured
  return (
    <div className="rounded-xl border border-terracotta/30 bg-terracotta/5 p-5">
      <p className="label text-terracotta">Recent on Strava</p>
      <ul className="mt-3 space-y-2">
        {acts.map((a) => (
          <li key={a.id} className="flex justify-between text-ink">
            <span>{a.name}</span>
            <span className="label text-ink-soft">{a.type} · {a.distanceKm} km</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 6: Mount in movement page** — replace `<div id="strava-slot" className="mt-10" />` with:
```tsx
import StravaFeed from "@/components/movement/StravaFeed";
// ...
      <div className="mt-10"><StravaFeed /></div>
```

- [ ] **Step 7: Add env placeholders** to `.env.example`:
```
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_REFRESH_TOKEN=
```

- [ ] **Step 8: Test + build** → PASS / success (feed renders nothing until configured — by design).

- [ ] **Step 9: Commit**
```bash
git add -A && git commit -m "feat: Strava connect-to-activate feed with graceful fallback"
```

---

### Task 24: Spotify now-playing (connect-to-activate) + footer widget

**Files:**
- Create: `src/lib/spotify.ts`, `src/lib/spotify.test.ts`, `src/components/layout/NowPlaying.tsx`
- Modify: `src/components/layout/Footer.tsx`

- [ ] **Step 1: TDD the fallback contract**

Create `src/lib/spotify.test.ts`:
```ts
import { getNowPlaying } from "./spotify";

test("returns null when not configured", async () => {
  delete process.env.SPOTIFY_REFRESH_TOKEN;
  expect(await getNowPlaying()).toBeNull();
});
```

- [ ] **Step 2: Run — expect failure** → FAIL.

- [ ] **Step 3: Implement**

Create `src/lib/spotify.ts`:
```ts
export type Track = { title: string; artist: string; url: string; isPlaying: boolean };

async function getAccessToken(): Promise<string | null> {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) return null;
  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: SPOTIFY_REFRESH_TOKEN }),
    next: { revalidate: 30 },
  });
  if (!res.ok) return null;
  return (await res.json()).access_token ?? null;
}

export async function getNowPlaying(): Promise<Track | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 30 },
    });
    if (res.status === 204 || !res.ok) return null;
    const d = await res.json();
    if (!d?.item) return null;
    return {
      title: d.item.name,
      artist: (d.item.artists ?? []).map((a: any) => a.name).join(", "),
      url: d.item.external_urls?.spotify ?? "#",
      isPlaying: Boolean(d.is_playing),
    };
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run test — expect pass** → PASS.

- [ ] **Step 5: NowPlaying widget**

Create `src/components/layout/NowPlaying.tsx`:
```tsx
import { getNowPlaying } from "@/lib/spotify";

export default async function NowPlaying() {
  const track = await getNowPlaying();
  if (!track) return null;
  return (
    <a href={track.url} className="label text-ink-soft hover:text-terracotta transition-colors">
      {track.isPlaying ? "♫ now playing" : "♫ last played"} — {track.title} · {track.artist}
    </a>
  );
}
```

- [ ] **Step 6: Mount in Footer**

Replace `src/components/layout/Footer.tsx` with:
```tsx
import { PROFILE } from "@/data/profile";
import NowPlaying from "./NowPlaying";

export default function Footer() {
  const { socials, email } = PROFILE;
  return (
    <footer className="mx-auto max-w-5xl px-5 py-16 border-t border-ink/10 mt-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-soft">Built slowly, like the bread. © Mariprasad Ramakrishna.</p>
        <NowPlaying />
      </div>
      <div className="mt-4 flex gap-4 text-sm">
        <a href={socials.linkedin} className="text-ink hover:text-terracotta">LinkedIn</a>
        {socials.github && <a href={socials.github} className="text-ink hover:text-terracotta">GitHub</a>}
        <a href={`mailto:${email}`} className="text-ink hover:text-terracotta">Email</a>
      </div>
    </footer>
  );
}
```

- [ ] **Step 7: Add env placeholders** to `.env.example`:
```
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=
```

- [ ] **Step 8: Test + build** → PASS / success (widget hidden until configured).

- [ ] **Step 9: Commit**
```bash
git add -A && git commit -m "feat: Spotify now-playing footer widget (connect-to-activate)"
```

---

## Phase 5 — Polish & deploy

### Task 25: Accessibility & reduced-motion pass

**Files:**
- Review/modify: all section components, `Header.tsx`, `Lightbox.tsx`

- [ ] **Step 1: Add keyboard close + focus handling to Lightbox**

In `src/components/media/Lightbox.tsx`, add an Escape-key handler:
```tsx
"use client";
import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

export default function Lightbox({ src, alt, onClose }: { src: string | null; alt: string; onClose: () => void }) {
  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [src, onClose]);
  // ...rest unchanged from Task 16 (AnimatePresence + motion.div dialog)
}
```
> Keep the existing JSX body; only the `useEffect` + import change.

- [ ] **Step 2: Verify reduced-motion** — in browser devtools, emulate `prefers-reduced-motion: reduce`; confirm Reveal/Lightbox animations are effectively instant (the globals.css rule from Task 2 handles this).

- [ ] **Step 3: Run a quick a11y check** — confirm headings are ordered (one `h1` per page), nav links are reachable by keyboard, and images have alt text. Fix any gaps found.

- [ ] **Step 4: Run full test suite** → `npm test` all PASS.

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: a11y pass — lightbox keyboard close, reduced-motion verified"
```

---

### Task 26: Performance pass

- [ ] **Step 1: Production build + analyze**

Run: `npm run build` then `npm start`. In the build output, confirm homepage and sub-pages are statically prerendered (marked `○` / `●`), and the `/api/ask` route is the only dynamic entry.

- [ ] **Step 2: Confirm images are lazy + sized** — every `next/image` has `sizes` (galleries) or `fill` with a sized parent. Fix any missing `sizes` warnings from the build.

- [ ] **Step 3: Lighthouse (optional)** — run Lighthouse on `npm start`; address any easy wins (e.g., font-display, image dimensions). Target ≥90 performance/accessibility.

- [ ] **Step 4: Commit any fixes**
```bash
git add -A && git commit -m "perf: ensure static prerender + sized images"
```

---

### Task 27: Deploy to Vercel + domain

- [ ] **Step 1: Push to a GitHub repo**

Create a GitHub repo (e.g. `mariprasad-site`) and push:
```bash
git remote add origin <repo-url>
git push -u origin main
```

- [ ] **Step 2: Import into Vercel** — connect the repo at vercel.com; framework auto-detected as Next.js.

- [ ] **Step 3: Set environment variables** in Vercel project settings (Production): `OPENAI_API_KEY`, and when ready `LETTERBOXD` user (via `PROFILE.letterboxdUser` edit), `STRAVA_*`, `SPOTIFY_*`. Redeploy.

- [ ] **Step 4: Add the domain** — in Vercel → Domains, add `mariprasad.com` and follow DNS instructions at the registrar.

- [ ] **Step 5: Smoke-test production** — visit the deployed site: homepage scroll, each sub-page, Ask Mari (with key set). Confirm no console errors.

- [ ] **Step 6: Final commit / tag**
```bash
git commit --allow-empty -m "chore: production deploy to mariprasad.com"
git push
```

---

## Post-launch checklist (Mari to provide, then flip on)
- [ ] Recent **GitHub** URL → set `PROFILE.socials.github`.
- [ ] **Letterboxd** username → set `PROFILE.letterboxdUser` (movies feed goes live).
- [ ] **Strava** OAuth (`STRAVA_CLIENT_ID/SECRET/REFRESH_TOKEN`) → movement feed goes live.
- [ ] **Spotify** OAuth (`SPOTIFY_CLIENT_ID/SECRET/REFRESH_TOKEN`) → now-playing goes live.
- [ ] Real **recipes** (MDX in `src/content/recipes/`) + **photos** in `public/photos/...`.
- [ ] India-states **TopoJSON** present at `src/data/india.topo.json` (fetched in Task 14; current 2019+ boundaries with Telangana + Ladakh).
- [ ] Refine **Ask Mari corpus** (`src/data/about-corpus.ts`) in your own words.
```
