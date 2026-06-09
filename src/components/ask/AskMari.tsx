"use client";
import { useChat } from "ai/react";

export default function AskMari() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({ api: "/api/ask" });
  return (
    <div className="rounded-2xl border border-ink/15 bg-paper/50 p-5">
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {messages.map((m) => (
          <p key={m.id} className={m.role === "user" ? "text-ink-soft" : "text-ink"}>
            <span className="label mr-2">{m.role === "user" ? "you" : "mari"}</span>
            {m.content}
          </p>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={input} onChange={handleInputChange}
          placeholder="Ask me about a bake, a trek, the bowling…"
          className="flex-1 rounded-lg border border-ink/20 bg-paper px-3 py-2 text-ink outline-none focus:border-terracotta"
        />
        <button type="submit" disabled={isLoading}
          className="rounded-lg bg-terracotta px-4 py-2 text-paper disabled:opacity-50">
          {isLoading ? "…" : "Ask"}
        </button>
      </form>
    </div>
  );
}
