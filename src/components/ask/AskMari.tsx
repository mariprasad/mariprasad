"use client";
import { useEffect, useState } from "react";
import { useChat } from "ai/react";

type Source = { title: string; url: string };

// Rotating placeholder — hints at the range (films, code, cricket, baking, food,
// travel) and sparks a question, without fixing a narrow list.
const PROMPTS = [
  "Best film I saw this year?",
  "Why Next.js?",
  "Fastest I've bowled?",
  "A bake worth the 3-day wait?",
  "Where should I eat in Bengaluru?",
  "A trek that nearly broke me?",
];

export default function AskMari() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, data } =
    useChat({ api: "/api/ask" });

  const [promptIdx, setPromptIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPromptIdx((i) => (i + 1) % PROMPTS.length), 3500);
    return () => clearInterval(id);
  }, []);

  // Sources are pushed via dataStream.writeData({ sources }); take the latest payload.
  const sources: Source[] = (() => {
    const withSources = (data ?? []).filter(
      (d): d is { sources: Source[] } =>
        !!d && typeof d === "object" && "sources" in d && Array.isArray((d as { sources: unknown }).sources),
    );
    return withSources.length ? withSources[withSources.length - 1].sources : [];
  })();

  return (
    <div className="rounded-2xl border border-ink/15 bg-paper/50 p-5">
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {messages.map((m) => (
          <p key={m.id} className={m.role === "user" ? "text-ink-soft" : "text-ink"}>
            {m.role === "user"
              ? <span className="label mr-2">you</span>
              : <span className="label mr-2" style={{ textTransform: "none" }}>Mari</span>}
            {m.content}
          </p>
        ))}
        {sources.length > 0 && !isLoading && (
          <div className="flex flex-wrap gap-2 pl-1">
            {sources.map((s, i) => {
              const external = /^https?:\/\//.test(s.url);
              return (
                <a
                  key={`${s.url}-${i}`}
                  href={s.url}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="label text-terracotta hover:underline"
                >
                  from {s.title} →
                </a>
              );
            })}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={input} onChange={handleInputChange}
          placeholder={PROMPTS[promptIdx]}
          className="flex-1 rounded-lg border border-ink/20 bg-paper px-3 py-2 text-ink outline-none focus:border-terracotta"
        />
        <button type="submit" disabled={isLoading}
          className="rounded-lg bg-terracotta px-4 py-2 text-paper disabled:opacity-50">
          {isLoading ? "…" : "Go"}
        </button>
      </form>
      {error && (
        <p className="mt-3 text-sm text-terracotta">
          Hmm, that didn&apos;t go through — try again in a moment.
        </p>
      )}
    </div>
  );
}
