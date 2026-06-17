"use client";
import { useChat } from "ai/react";

type Source = { title: string; url: string };

export default function AskMari() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, data } =
    useChat({ api: "/api/ask" });

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
            <span className="label mr-2">{m.role === "user" ? "you" : "mari"}</span>
            {m.content}
          </p>
        ))}
        {sources.length > 0 && !isLoading && (
          <div className="flex flex-wrap gap-2 pl-1">
            {sources.map((s, i) => (
              <a key={`${s.url}-${i}`} href={s.url} className="label text-terracotta hover:underline">
                from {s.title} →
              </a>
            ))}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={input} onChange={handleInputChange}
          placeholder="Ask me about a bake, a trek, a solo trip…"
          className="flex-1 rounded-lg border border-ink/20 bg-paper px-3 py-2 text-ink outline-none focus:border-terracotta"
        />
        <button type="submit" disabled={isLoading}
          className="rounded-lg bg-terracotta px-4 py-2 text-paper disabled:opacity-50">
          {isLoading ? "…" : "Ask"}
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
