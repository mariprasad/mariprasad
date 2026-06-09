# mariprasad.com — Design Spec

**Date:** 2026-06-09
**Owner:** Mariprasad Ramakrishna
**Status:** Approved (brainstorming) — ready for implementation planning

---

## 1. Overview

A personal website at **mariprasad.com** — a warm, "flour-dusted corner of the internet" that leads with who Mari *is* (cricket, baking, travel, mountains, films) while giving his engineering work a proper, credible home. Personality-first (~60/40 personal-to-professional), inspired in spirit by yashbhardwaj.com but warmer and more handmade.

**Throughline:** *a fast bowler who bakes slow* — speed and patience, leather and dough, sea-level and 15,500 ft.

**Tagline:** "Mariprasad Ramakrishna — likes to bowl fast and bake slow."

### Goals
- A beautiful, smoothly-animated personal site that feels like Mari.
- Rich, self-updatable content areas for baking, travel, movement, and films.
- A tasteful AI feature ("Ask Mari") that doubles as a live demo of his LLM engineering skill.
- Easy for Mari to maintain (author content as files; live integrations where they're zero-upkeep).

### Non-goals
- SEO optimization (explicitly not a priority).
- A job-board/recruiter-first portfolio (work is woven in, not the headline).
- Live GitHub activity, Apple Health steps, or Apple Music now-playing (see Deferred).

---

## 2. Aesthetic Direction — "Textured / Crafted"

The warmest, most handmade of the directions explored. Refined enough to carry engineering, tactile enough to feel personal.

- **Palette:**
  - Paper/kraft background: `#efe6d6` → `#e3d5bd` (subtle warm gradient)
  - Espresso ink (text): `#3d2f1e`
  - Baked-terracotta accent: `#a8553a`
  - Muted pine green (mountains/travel): `#5b6e4f`
- **Typography:**
  - Display headings: `Fraunces` (soft, characterful serif)
  - Body: `Inter`
  - Small labels / metadata (dates, proof times, coordinates): `JetBrains Mono`
- **Texture:** very subtle paper grain; faint dotted / topographic line motifs in the Movement + Travel sections.
- **Motion** (Motion / Framer Motion):
  - Organic easing, tactile hovers, elements that *assemble* (ingredients settling, a route line drawing itself).
  - Scroll-triggered fades and gentle parallax. Smooth, never flashy.
  - **Must respect `prefers-reduced-motion`** — animations degrade to simple fades/instant.

---

## 3. Information Architecture

### Homepage — single animated scroll
1. **Hero** — name + "likes to bowl fast and bake slow," a local chip (e.g. Bengaluru + temp — optional, static or weather API later), subtle texture.
2. **Intro** — 2–3 warm sentences on who Mari is. Hosts the **Ask Mari** prompt (§5).
3. **Pace / Cricket** — bowling identity (right-arm fast) + fandom (Steyn, McGrath, Brett Lee, fast bowling; Sachin; RCB / IPL) as a tasteful strip.
4. **The Bakery** — teaser of recent bakes → links to `/baking`.
5. **Movement** — treks (ABVMAS cert, 15,500 ft), the first 10k trail run, Strava activity → links to `/movement`.
6. **On the Map** — solo travel across 20 states & UTs → links to `/travel`.
7. **Now Watching** — Letterboxd-fed recent films strip → links to `/movies`.
8. **The Work** — short, confident summary + the flight-search LLM case study → links to `/work`.
9. **Footer** — socials (LinkedIn, GitHub, email), "built with…" note, Spotify now-playing slot.

### Sub-pages (depth where content earns it)
- `/baking` — recipes + process notes + photos.
- `/travel` — interactive India map + state log + photos.
- `/movement` — treks, the 10k run, Strava feed, milestone stats.
- `/movies` — Letterboxd feed + watchlist.
- `/work` — case studies (flight-search LLM pipeline et al.), resume link.

---

## 4. Section Content Detail

- **Cricket:** Mari bowls (right-arm fast). Fandom: Dale Steyn, Glenn McGrath, Brett Lee, fast bowling generally; Sachin Tendulkar; RCB (IPL). Presented as identity + a fan strip, not a stats dashboard.
- **Baking:** baking since last July (2024). Has baked many milk breads, semi-sourdough breads (~24h), true sourdoughs (~3 days / 72h), and has had honest "glorious failures" with croissants (eventually to be conquered). Recipes + process + photos. Voice is honest and warm.
- **Cooking:** cooks occasionally these days — light mention, may fold into Baking or Intro, not its own section in v1.
- **Movement:**
  - Trekking — basic mountaineering certificate from **ABVMAS, Himachal**; trekked up to **15,500 ft** (cross-linked with Travel since treks are geography too).
  - Running — finished first **10k trail run**.
  - Strava activity (connect-to-activate, §6).
  - Optional hand-set milestone stats (e.g. "15,500 ft", "first 10k").
- **Travel:** solo travel across **20 states & UTs** (section labeled "States & UTs" for accuracy):
  - South: Karnataka, Kerala, Tamil Nadu, Puducherry, Andhra Pradesh, Telangana
  - West: Maharashtra, Goa, Gujarat, Rajasthan
  - Central: Madhya Pradesh
  - North: Delhi, Punjab, Himachal Pradesh, Jammu & Kashmir, Ladakh
  - East / Northeast: Bihar, West Bengal, Meghalaya, Assam
  - Headline stat: "20 states & UTs, solo."
- **Work:** 10+ yr full-stack engineer / technical lead. Headline case study: server-side **LLM flight-search pipeline** (OpenAI API, JSON-schema structured outputs, Zod validation, anti-hallucination grounding against a live airport API) at Techtree Labs. Prior: YouKraft (tech lead), Thrillark, Crain Communications, Global Citizen. Resume link + selected highlights. (Full history lives in the resume, not necessarily all on-page.)

---

## 5. "Ask Mari" — AI Feature

A quiet, on-brand chat ("Curious about something? Ask me.") where visitors ask about Mari's cricket, baking, travels, or work and get answers **in his voice**.

- **Architecture:** Next.js API route → OpenAI API. Mari's bio/hobby/work facts live in a **structured content file**, injected as grounded context. The corpus is small enough that **no vector DB is needed**.
- **Grounding:** schema-constrained outputs + grounded strictly against the provided content, so it won't fabricate facts Mari didn't give it — a live demo of the exact skill on his resume.
- **Guardrails:** scoped to "about Mari" topics; rate-limited per IP; graceful fallback on error/quota; **streamed** responses for a smooth feel.
- **Secrets:** OpenAI key server-side only (env var), never exposed to the client.

---

## 6. Integrations

| Integration | Purpose | Status | Notes |
|---|---|---|---|
| **OpenAI API** | Ask Mari | v1 (active) | Server-side API route; grounded; streamed. |
| **Letterboxd RSS** | Movies "recently watched" + watchlist | v1 (active) | Fetched & cached server-side; rendered as poster cards. Zero manual upkeep once Mari logs films on Letterboxd. |
| **Strava API** | Movement: recent activity / totals | **Connect-to-activate** | Build the slot now; goes live after one-time OAuth. Mari to provide account. |
| **Spotify API** | Footer now-playing / recently played | **Connect-to-activate** | Build the slot now; goes live after one-time OAuth. Mari may play on Spotify when he wants it reflected. |
| **GitHub** | Socials link | v1 (link-only) | Live contributions feed deferred (account currently sparse); ~10-line switch-on later. |

---

## 7. Content & Data Model

Designed so Mari can update content by editing files, with live data where it's zero-upkeep.

- **Recipes & travel logs → MDX** files with structured frontmatter. Recipe frontmatter includes a **per-bake `proofTime`** field showing the real time for *that* bake (`overnight`, `24h`, `72h / 3 days`) — never a hardcoded blanket value. The decorative homepage bakery label is duration-agnostic (e.g. "slow-fermented since last July").
- **Photos** stored in-repo (or a content folder), rendered through **`next/image`** (auto-resize, lazy-load, modern formats) with a **tasteful lightbox gallery** (masonry per section). Payloads kept small.
- **Travel** → a data file of states/UTs visited (with optional per-place notes), driving an **interactive India map** (highlighted regions) + a list.
- **Movies** → Letterboxd RSS, fetched + cached server-side, rendered as poster cards (TMDB only if extra metadata/art is needed).
- **"About Mari" corpus** → a structured content file powering the Ask Mari grounding (single source of truth for bio facts).

---

## 8. Tech Stack & Deployment

- **Framework:** Next.js (App Router), predominantly **static generation** (no per-request SSR cost); React Server Components so static content ships ~no client JS; interactive islands (animations, Ask Mari) hydrate only where needed.
- **Styling:** Tailwind CSS.
- **Animation:** Motion (Framer Motion).
- **Content:** MDX.
- **Images:** `next/image`.
- **AI:** OpenAI API via Next.js API route.
- **Hosting:** Vercel (free tier), domain `mariprasad.com`.
- **Secrets:** environment variables for OpenAI, and later Strava/Spotify OAuth tokens.

---

## 9. Module / Component Boundaries

Each unit has one clear purpose and a defined interface, understandable and testable in isolation:

- **Layout & theme** — global paper texture, fonts, color tokens, reduced-motion handling.
- **Homepage sections** — one component per scroll section (Hero, Intro, Cricket, Bakery, Movement, Map, NowWatching, Work, Footer), each self-contained.
- **MDX content pipeline** — recipe/travel-log loader + frontmatter schema + renderer.
- **PhotoGallery / Lightbox** — reusable, fed an array of images; no knowledge of which section.
- **IndiaMap** — fed a list of visited region codes; renders highlights; no other deps.
- **AskMari** — chat UI island + `/api/ask` route + grounding corpus loader; isolated from the rest.
- **Integration fetchers** — `letterboxd`, `strava`, `spotify` each a small server-side module returning typed data, each independently togglable.

---

## 10. Accessibility & Performance
- Respect `prefers-reduced-motion`.
- Semantic HTML, keyboard-navigable nav, lightbox, and chat; sufficient color contrast on the kraft palette.
- Lazy-load images and below-the-fold sections; keep client JS to interactive islands.

---

## 11. Deferred / Out of Scope (v1)
- Live GitHub contributions feed (account sparse) — link-only for now.
- Apple Health daily steps (no public API) — possibly hand-set milestone stats instead.
- Apple Music now-playing (no public API) — using Spotify slot instead.
- Cooking as its own section — folded into Baking/Intro for now.

---

## 12. Open Content Items (Mari to provide; can be stubbed)
- ✅ States & UTs visited (provided — 20, listed in §4).
- Recent **GitHub** URL; any additional social links (LinkedIn captured: linkedin.com/in/mariprasadr).
- **Strava** account (to activate Movement feed).
- **Spotify** authorization (to activate now-playing).
- **Letterboxd** username (to activate Movies feed).
- Baking recipes + process notes + photos; travel & trek photos.
- Intro/about copy for the Ask Mari corpus (can be drafted from resume + this spec, then refined by Mari).

---

## 13. High-Level Build Phases
(Detailed sequencing to be produced by the implementation-planning step.)
1. Scaffold Next.js + Tailwind + Motion + MDX; theme tokens, fonts, texture, reduced-motion.
2. Homepage shell + all section components with placeholder content and scroll animations.
3. Content pipeline: MDX recipes/travel logs + frontmatter; PhotoGallery/Lightbox.
4. Sub-pages: `/baking`, `/travel` (IndiaMap), `/movement`, `/movies`, `/work`.
5. Ask Mari: grounding corpus + `/api/ask` route + streamed chat island.
6. Integrations: Letterboxd (active); Strava + Spotify slots (connect-to-activate).
7. Polish: accessibility pass, performance pass, real content wiring, deploy to Vercel + domain.
