// Append-only log of questions asked to Ask Mari, written to the Airtable
// "Questions" table (same base as Places + Thoughts). Connect-to-activate:
// no-ops until AIRTABLE_TOKEN is set. Fire-and-forget — it must NEVER throw or
// block the visitor's answer, so every failure is swallowed.
const BASE_ID = "appOjONooljd6cwwi";
const TABLE = "Questions";
const MAX_LEN = 500; // mirrors the /api/ask input guard

export type AskOutcome = "answered" | "unanswered" | "greeting";

export async function logQuestion(question: string, status: AskOutcome, topSource?: string): Promise<void> {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return;
  const q = question.trim();
  if (!q || q.length > MAX_LEN) return;

  const fields: Record<string, unknown> = { Question: q, Status: status };
  if (topSource) fields.TopSource = topSource;

  try {
    await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields, typecast: true }),
    });
  } catch {
    // logging is best-effort — never let it affect the answer
  }
}
