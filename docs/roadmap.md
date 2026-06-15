# mariprasad.com — roadmap & parked ideas

A running list of everything we said "let's do this later." We'll work through it together. Newest thoughts at the top of each group.

## Content sections (need content/photos from Mari)
- **Kajjaya — Deepawali sweet: STORY SHIPPED 2026-06-16** as a baking note at `src/content/notes/kajjaya.mdx` (`/notes/kajjaya`) — the family story (mum's crunchy version, grandpa's soft-with-mashed-banana, the big Diwali batch shared round the neighbourhood for ~a month). **Still parked:** Mari to send the (tricky) **making process** — then either expand the note or promote it to a full Kajjaya recipe (the bench photo `DSCF0546.jpg` would be the cover).
- **Pencil sketches** — mostly portrait sketches → its own gallery section (same photo pipeline as travel).
- **Farming** — a section: a line on what/why you farm + photos.
- **Herping & frogs** — "the wild I share my corner with." Small nature section or a field-note article. One workshop so far; grow it over time.

## Living map & check-ins (Airtable)
- **Wishlist roulette** — every few weeks, randomly pick one "on the list" place and nudge Mari (email/notification) to actually go. (Parked 2026-06-12.)
- **Give check-ins their own home** — pull "Lately saved" out of `/travel` into its own page (or the homepage) so you can see *all* your check-ins, not just a strip.
- **Photos per check-in** — attach a photo when logging a place (Airtable attachments need a hosted URL from a Shortcut, so this needs a workaround).
- **Hand-fix approximate pins** — hollow pins on the map are state-centroid guesses; correct the ones that matter by filling real Lat/Lng in Airtable.
- ~~Interactive India map~~ → **shipped 2026-06-12** as the zoomable pin map on `/travel`.
- ~~Google Maps history backfill~~ → **shipped 2026-06-12** (reviews + 56 saved lists → Airtable; `parse-takeout-places.mjs`, `parse-saved-lists.mjs`, `geocode-airtable.mjs`).

## Ask Mari
- **Answer in Mari's real voice** — add a style note + 3–5 few-shot examples of how you'd actually answer, into the grounding. Needs you to write a few sample answers.
- **Rate-limit `/api/ask`** before sharing the site widely — it's a public, OpenAI-backed endpoint (e.g. Vercel KV / Upstash).

## Look & feel
- **Theme refresh v2 — "Chettinad floor" background** (parked 2026-06-12). Mari finds the current terrazzo-green background a bit boring. Reference: https://flysoar.ai/ (likes its background treatment — grab its palette/texture with a browser when we pick this up). Direction: build the background from **Athangudi tile colors** + the **texture of red oxide floors from Chettinad**; we already use mosaic tiles (origin unknown). Could pair with the existing "Athangudi-tile accent strips" idea below.
- **Floating bubble / constellation nav** — the "Mari sun + section bubbles" navigation, as a homepage showpiece. (Parked; bar stays simple for now.)
- **Per-section accent colors** — give each section its own tribal-bold colour (baking = mustard, travel = teal, movement = green, movies = purple…) to push the bold/folk vibe.
- **Athangudi-tile accent strips** — tile motif in the header, dividers, footer (the Chettinad nod), on top of the terrazzo-green base.

## Connect-to-activate (when you have the accounts/auth)
- **Apple Health on the site** (steps / resting HR / sleep / move) — parked 2026-06-15. Apple Health has **no web API** (on-device only, by design), so the phone must *push* the data out. Reuse the `/api/log-place` pattern: an iOS **Shortcut automation** reads Health samples and POSTs to a new `/api/log-health` route (LOG_SECRET-guarded) → store (Airtable or similar) → site reads it. Two parts, same shape as the travel data: **backfill history** by parsing the one-time Health "Export All Health Data" `export.xml` (like `parse-takeout-places.mjs`), then **live** daily appends via the Shortcut. No Apple Developer account / native app / cost needed. Watch metrics ride along via the iPhone Health app. Strava already covers workouts/runs — Health adds the everyday stuff. Open Qs (Mari to decide): which metrics, auto-daily vs manual.
- **Strava feed** (Movement) — add `STRAVA_*` env vars + do the one-time OAuth.
- **Spotify now-playing** (footer) — add `SPOTIFY_*` env vars + OAuth.
- **GitHub live activity** — deferred (account is sparse for now).

## Minor polish
- Re-add `antialiased` + sticky-footer behaviour (dropped in an early refactor).
- Type vitest globals so a full `tsc` over tests is clean.
