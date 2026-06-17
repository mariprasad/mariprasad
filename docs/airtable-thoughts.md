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

## Phase 2: voice capture

An iOS/Android Shortcut can append rows here: *Dictate Text → Get Contents of URL*
`POST https://api.airtable.com/v0/appOjONooljd6cwwi/Thoughts` with a write-scoped
token and body `{"fields": {"Thought": "<dictation>", "Topic": "...", "Date": "..."}}`.
Use a **separate write-scoped** Personal Access Token for the Shortcut — never the
site's read-only token.
