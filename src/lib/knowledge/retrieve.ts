import { embed, cosineSimilarity } from "ai";
import index from "@/data/knowledge-index.json";
import { embeddingModel } from "./embedding";
import type { KnowledgeChunk, RetrievedChunk } from "./types";

export const TOP_K = 6;
export const MIN_SCORE = 0.28;

const CHUNKS = index as unknown as KnowledgeChunk[];

/** Pure ranking — no network. Exported for testing. */
export function rank(
  queryVec: number[],
  chunks: KnowledgeChunk[],
  k: number = TOP_K,
  minScore: number = MIN_SCORE,
): RetrievedChunk[] {
  return chunks
    .map((c) => ({
      id: c.id,
      source: c.source,
      title: c.title,
      text: c.text,
      url: c.url,
      score: cosineSimilarity(queryVec, c.vector),
    }))
    .filter((c) => c.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

/** Embed the question and return the most relevant chunks. */
export async function retrieve(
  question: string,
  k: number = TOP_K,
  minScore: number = MIN_SCORE,
): Promise<RetrievedChunk[]> {
  if (!question.trim() || !Array.isArray(CHUNKS) || CHUNKS.length === 0) return [];
  if (!Array.isArray(CHUNKS[0]?.vector)) return []; // guard a malformed index
  const { embedding } = await embed({ model: embeddingModel(), value: question });
  return rank(embedding, CHUNKS, k, minScore);
}
