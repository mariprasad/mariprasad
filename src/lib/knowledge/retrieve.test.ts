import { rank } from "./retrieve";
import type { KnowledgeChunk } from "./types";

const chunk = (id: string, vector: number[]): KnowledgeChunk => ({
  id, source: "note", title: id, text: id, hash: id, vector,
});

test("ranks by cosine similarity, highest first, above threshold", () => {
  const query = [1, 0];
  const chunks = [
    chunk("near", [0.9, 0.1]),
    chunk("orthogonal", [0, 1]),
    chunk("exact", [1, 0]),
  ];
  const out = rank(query, chunks, 6, 0.5);
  expect(out.map((c) => c.id)).toEqual(["exact", "near"]); // orthogonal (score 0) dropped
  expect(out[0].score).toBeGreaterThan(out[1].score);
});

test("respects top-k", () => {
  const query = [1, 0];
  const chunks = [chunk("a", [1, 0]), chunk("b", [0.9, 0.1]), chunk("c", [0.8, 0.2])];
  expect(rank(query, chunks, 2, 0).length).toBe(2);
});
