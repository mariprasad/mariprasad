import type { RetrievedChunk } from "@/lib/knowledge/types";

export const EXAMPLE_PROMPTS = [
  "what's your take on sourdough?",
  "got a recipe for sandwich bread?",
  "where do you go bouldering in Bangalore?",
  "where should I eat in Bengaluru?",
  "a trek that nearly broke you?",
  "which fast bowlers did you grow up idolising?",
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
  `- If the CONTEXT carries a caveat or trade-off (a technique that helps one goal but works against another), keep it — don't flatten nuance into a blanket rule.\n` +
  `- Keep it tight — usually 2-4 sentences — but give the nuance room when the question deserves it.\n` +
  `- Speak as "I"/"me". Never mention "context", "sources", or that you are an AI.`;

export function isInScope(question: string): boolean {
  const q = question.trim();
  return q.length > 0 && q.length <= 500;
}

// A bare greeting ("hey", "good morning", "what's up?") — NOT a greeting that
// carries a real question ("hey, best bake?"), which should fall through to
// normal retrieval. Used to route hellos to a warm greet-back instead of the
// "that's outside my world" deflection.
const GREETING_RE =
  /^(?:hi+|hey+|hello+|hiya|yo+|sup|wassup|what'?s up|howdy|greetings|namaste|hola|good (?:morning|afternoon|evening|day)|how(?:'?s| is) it going|how are you)(?:\s+(?:there|all|mari|everyone|folks))?[\s!.,?]*$/i;

export function isGreeting(question: string): boolean {
  return GREETING_RE.test(question.trim());
}

export function buildSystemPrompt(chunks: RetrievedChunk[]): string {
  const context = chunks.map((c) => `[${c.title}] ${c.text}`).join("\n\n");
  return `${IDENTITY}\n\n${RULES}\n\nCONTEXT:\n${context}`;
}

export function buildGreetingPrompt(): string {
  const examples = EXAMPLE_PROMPTS.map((q) => `"${q}"`).join(", ");
  return (
    `${IDENTITY}\n\n` +
    `The visitor just said hello — nothing more. Greet them back warmly in one short, ` +
    `friendly line in your own voice, then in the same breath nudge them toward what they ` +
    `can ask you. Naturally suggest two or three of these, spanning different sides of you ` +
    `(baking, the mountains, food, cricket): ${examples}. Keep it to 2-3 sentences, light ` +
    `and inviting. Speak as "I"/"me"; never mention that you are an AI.`
  );
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
