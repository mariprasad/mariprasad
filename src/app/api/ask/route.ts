import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { buildSystemPrompt, isInScope } from "@/lib/ask-prompt";

export const runtime = "edge";

// Public, unauthenticated endpoint: cap the payload to blunt cost-abuse.
const MAX_MESSAGES = 20;
const MAX_TOTAL_CHARS = 6000;

export async function POST(req: Request) {
  const { messages } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("Ask me something about cricket, baking, travel, or my work.", { status: 400 });
  }
  // Keep only the most recent turns, and reject oversized histories.
  const trimmed = messages.slice(-MAX_MESSAGES);
  const totalChars = trimmed.reduce((n, m) => n + String(m?.content ?? "").length, 0);
  const last = trimmed[trimmed.length - 1]?.content ?? "";
  if (!isInScope(String(last)) || totalChars > MAX_TOTAL_CHARS) {
    return new Response("Ask me something short about cricket, baking, travel, or my work.", { status: 400 });
  }
  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: buildSystemPrompt(),
    messages: trimmed,
    temperature: 0.4,
    maxTokens: 220,
  });
  return result.toDataStreamResponse();
}
