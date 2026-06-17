# Airtable "Thoughts" table

Loose thoughts/opinions that feed "Ask Mari" search. Read by
`src/lib/knowledge/sources/thoughts.ts` and folded into the knowledge index on
each build / nightly refresh.

## Where

- **Base:** `appOjONooljd6cwwi` (the same base as `Places`).
- **Table name:** `Thoughts` (exact, case-sensitive).

The site's existing `AIRTABLE_TOKEN` is scoped to this base, so a new table in it
is automatically readable — no token change needed.

## Fields (names are case-sensitive — they must match exactly)

| Field     | Type             | Required | Notes |
|-----------|------------------|----------|-------|
| `Topic`   | Single line text | no       | Short tag, e.g. "baking", "cricket", "life". Used as the source-chip title; defaults to "A thought" when blank. **Make this the primary field.** |
| `Thought` | Long text        | yes      | The thought itself — this is what gets embedded and answered from. Rows with empty `Thought` are skipped. |
| `Date`    | Date             | no       | When the thought was had. Optional. |

> **Why `Topic` is the primary field:** Airtable's primary field can't be a Long
> text type, so `Thought` (long text) can't be primary. Set the primary field to
> `Topic` (single line text), then add `Thought` and `Date` as additional fields.

## Create it (Airtable UI, ~1 min)

1. Open the base, add a new table, name it `Thoughts`.
2. Rename the auto-created primary field to `Topic` (keep it single line text).
3. Add a field `Thought`, type **Long text**.
4. Add a field `Date`, type **Date**.
5. Add a test row (e.g. Topic "baking", Thought "Sourdough is mostly patience and a warm spot").

## Verify

After adding a row, locally:

```bash
npm run build:knowledge   # picks up the new thought (incremental embed)
```

Then ask Mari something the thought answers — it should reply in voice and cite it.
In production, the nightly workflow (or next deploy) refreshes it automatically.

## Phase 2: voice capture (iOS Shortcut)

Speak a thought; it lands as a row here and is searchable on the next rebuild.

### Token

Create a **separate** Personal Access Token for the Shortcut — never the site's
read-only token:

- Scope: `data.records:write` (add `data.records:read` if you want save confirmation).
- Access: base `appOjONooljd6cwwi` only.

This token lives inside the Shortcut on your device.

### The request

```
POST https://api.airtable.com/v0/appOjONooljd6cwwi/Thoughts
Authorization: Bearer <WRITE_TOKEN>
Content-Type: application/json

{ "fields": { "Thought": "<dictation>", "Topic": "<optional>", "Date": "2026-06-17" } }
```

Airtable's Date field accepts an ISO `yyyy-MM-dd` string. `Thought` is the only
field that matters; `Topic`/`Date` are optional.

### Shortcut actions (Shortcuts app → new shortcut, name it "Note a thought")

1. **Dictate Text** — captures speech → variable *Dictated Text*.
2. *(optional)* **Date** → **Format Date** (Custom format `yyyy-MM-dd`) → *Formatted Date*.
3. **Dictionary** — build the body:
   - Key `fields` → type **Dictionary**:
     - `Thought` (Text) = *Dictated Text*
     - `Date` (Text) = *Formatted Date*  *(optional)*
     - `Topic` (Text) = a fixed tag, or skip *(optional)*
4. **Get Contents of URL**:
   - URL: `https://api.airtable.com/v0/appOjONooljd6cwwi/Thoughts`
   - Method: **POST**
   - Headers: `Authorization` = `Bearer <WRITE_TOKEN>`, `Content-Type` = `application/json`
   - Request Body: **JSON** = the Dictionary from step 3.
5. *(optional)* **Show Notification** — "Thought saved" (or check the response for an `id`).

Trigger hands-free with "Hey Siri, note a thought", or add it to the Home Screen /
Back Tap.

### Notes

- Topic by voice is awkward; easiest is to leave it blank (defaults to "A thought")
  or hardcode a tag. You can always set Topic later in Airtable.
- The thought becomes searchable on the next index rebuild — nightly in prod, or
  `npm run build:knowledge` locally.
