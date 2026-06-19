import { buildSystemPrompt, buildOutOfScopePrompt, buildGreetingPrompt, isInScope, isGreeting, EXAMPLE_PROMPTS } from "./ask-prompt";
import type { RetrievedChunk } from "@/lib/knowledge/types";

const chunk = (over: Partial<RetrievedChunk> = {}): RetrievedChunk => ({
  id: "note:softer-crust", source: "note", title: "Softer crust",
  text: "Steam the first ten minutes for a softer crust.", url: "/notes/softer-crust", score: 0.9, ...over,
});

test("system prompt embeds the retrieved context and grounding rules", () => {
  const p = buildSystemPrompt([chunk()]);
  expect(p).toMatch(/Softer crust/);
  expect(p).toMatch(/softer crust/);
  expect(p).toMatch(/ONLY from the CONTEXT/i);
  expect(p).toMatch(/Mari/);
});

test("out-of-scope prompt is in-voice and offers example questions", () => {
  const p = buildOutOfScopePrompt();
  expect(p).toMatch(/Mari/);
  expect(EXAMPLE_PROMPTS.some((q) => p.includes(q))).toBe(true);
});

test("rejects empty or overlong questions", () => {
  expect(isInScope("")).toBe(false);
  expect(isInScope("x".repeat(501))).toBe(false);
  expect(isInScope("What do you bake?")).toBe(true);
});

test("detects bare greetings", () => {
  for (const g of ["hey", "Hi", "hello!", "Hey there", "yo", "good morning", "what's up?", "namaste"]) {
    expect(isGreeting(g)).toBe(true);
  }
});

test("does not treat greeting-prefixed questions as bare greetings", () => {
  // these should fall through to normal retrieval, not the greeting branch
  for (const q of ["hey, what's your best bake?", "hi, where should I eat?", "where do you go bouldering?"]) {
    expect(isGreeting(q)).toBe(false);
  }
});

test("greeting prompt greets back in-voice and offers example questions", () => {
  const p = buildGreetingPrompt();
  expect(p).toMatch(/Mari/);
  expect(p).toMatch(/greet/i);
  expect(EXAMPLE_PROMPTS.some((q) => p.includes(q))).toBe(true);
});
