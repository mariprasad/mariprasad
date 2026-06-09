import { ABOUT_CORPUS } from "@/data/about-corpus";

export function buildSystemPrompt(): string {
  return `${ABOUT_CORPUS}\n\nAnswer in 1-3 short sentences. Stay warm and first-person.`;
}

export function isInScope(question: string): boolean {
  const q = question.trim();
  return q.length > 0 && q.length <= 500;
}
