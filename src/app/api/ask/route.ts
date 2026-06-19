import { openai } from "@ai-sdk/openai";
import { streamText, createDataStreamResponse } from "ai";
import { retrieve } from "@/lib/knowledge/retrieve";
import { buildSystemPrompt, buildOutOfScopePrompt, buildGreetingPrompt, isInScope, isGreeting } from "@/lib/ask-prompt";

// Node runtime: the route imports the embeddings index (too large for the edge
// bundle limit) and runs cosine similarity in-process.
export const runtime = "nodejs";

// Public, unauthenticated endpoint: cap the payload to blunt cost-abuse.
const MAX_MESSAGES = 20;
const MAX_TOTAL_CHARS = 6000;

export async function POST(req: Request) {
  const { messages } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("Ask me something about my baking, cricket, travels, or work.", { status: 400 });
  }
  const trimmed = messages.slice(-MAX_MESSAGES);
  const totalChars = trimmed.reduce((n: number, m: { content?: unknown }) => n + String(m?.content ?? "").length, 0);
  const last = String(trimmed[trimmed.length - 1]?.content ?? "");
  if (!isInScope(last) || totalChars > MAX_TOTAL_CHARS) {
    return new Response("Ask me something short about my baking, cricket, travels, or work.", { status: 400 });
  }

  // A bare hello -> warm greet-back with a few things they could ask (no retrieval,
  // no source chips), instead of the "that's outside my world" deflection.
  if (isGreeting(last)) {
    return createDataStreamResponse({
      execute: (dataStream) => {
        const result = streamText({
          model: openai("gpt-4o-mini"),
          system: buildGreetingPrompt(),
          messages: trimmed,
          temperature: 0.7,
          maxTokens: 160,
        });
        result.mergeIntoDataStream(dataStream);
      },
    });
  }

  const chunks = await retrieve(last);

  // Nothing relevant -> warm, in-voice deflection (generated, so it varies).
  if (chunks.length === 0) {
    return createDataStreamResponse({
      execute: (dataStream) => {
        const result = streamText({
          model: openai("gpt-4o-mini"),
          system: buildOutOfScopePrompt(),
          messages: trimmed,
          temperature: 0.6,
          maxTokens: 120,
        });
        result.mergeIntoDataStream(dataStream);
      },
    });
  }

  // Grounded answer + real source chips (built by us, not the model).
  // Dedupe by url: several retrieved chunks can come from the same page.
  const byUrl = new Map<string, { title: string; url: string }>();
  for (const c of chunks) {
    if (c.url && !byUrl.has(c.url)) byUrl.set(c.url, { title: c.title, url: c.url });
  }
  const sources = [...byUrl.values()];

  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.writeData({ sources });
      const result = streamText({
        model: openai("gpt-4o-mini"),
        system: buildSystemPrompt(chunks),
        messages: trimmed,
        temperature: 0.4,
        maxTokens: 320,
      });
      result.mergeIntoDataStream(dataStream);
    },
  });
}
