# mariprasad.com — roadmap & parked ideas

A running list of everything we said "let's do this later." We'll work through it together. Newest thoughts at the top of each group.

## Content sections (need content/photos from Mari)
- **Pencil sketches** — mostly portrait sketches → its own gallery section (same photo pipeline as travel).
- **Farming** — a section: a line on what/why you farm + photos.
- **Herping & frogs** — "the wild I share my corner with." Small nature section or a field-note article. One workshop so far; grow it over time.

## Living map & check-ins (Airtable)
- **Give check-ins their own home** — pull "Lately saved" out of `/travel` into its own page (or the homepage) so you can see *all* your check-ins, not just a strip.
- **Interactive India map** — hover/tap a region → what you ate there, why you loved it, a fact, a photo peek. (Food/notes can come from the Airtable check-ins, grouped by region.)
- **Photos per check-in** — attach a photo when logging a place (Airtable attachments need a hosted URL from a Shortcut, so this needs a workaround).
- **Google Maps history backfill** — one-time Google Takeout export (Saved/Reviews from web, Timeline from the Maps phone app) → bulk-import past places into the Airtable base. No paid Maps API needed.

## Ask Mari
- **Answer in Mari's real voice** — add a style note + 3–5 few-shot examples of how you'd actually answer, into the grounding. Needs you to write a few sample answers.
- **Rate-limit `/api/ask`** before sharing the site widely — it's a public, OpenAI-backed endpoint (e.g. Vercel KV / Upstash).

## Look & feel
- **Floating bubble / constellation nav** — the "Mari sun + section bubbles" navigation, as a homepage showpiece. (Parked; bar stays simple for now.)
- **Per-section accent colors** — give each section its own tribal-bold colour (baking = mustard, travel = teal, movement = green, movies = purple…) to push the bold/folk vibe.
- **Athangudi-tile accent strips** — tile motif in the header, dividers, footer (the Chettinad nod), on top of the terrazzo-green base.

## Connect-to-activate (when you have the accounts/auth)
- **Strava feed** (Movement) — add `STRAVA_*` env vars + do the one-time OAuth.
- **Spotify now-playing** (footer) — add `SPOTIFY_*` env vars + OAuth.
- **GitHub live activity** — deferred (account is sparse for now).

## Minor polish
- Re-add `antialiased` + sticky-footer behaviour (dropped in an early refactor).
- Type vitest globals so a full `tsc` over tests is clean.
