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
