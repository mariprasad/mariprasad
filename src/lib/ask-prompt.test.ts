import { buildSystemPrompt, isInScope } from "./ask-prompt";

test("system prompt embeds the corpus and grounding rule", () => {
  const p = buildSystemPrompt();
  expect(p).toMatch(/Dale Steyn/);
  expect(p).toMatch(/Only use facts/i);
});

test("rejects empty or overlong questions", () => {
  expect(isInScope("")).toBe(false);
  expect(isInScope("x".repeat(501))).toBe(false);
  expect(isInScope("What do you bake?")).toBe(true);
});
