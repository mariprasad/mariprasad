import { openai } from "@ai-sdk/openai";

// Both the build script and the request-time retriever MUST use identical
// model + dimensions, or cosine similarity is meaningless.
export const EMBED_MODEL_ID = "text-embedding-3-small" as const;
export const EMBED_DIM = 512; // reduced dims keep the index small (~1/3 of 1536)

// A factory (not a singleton) so the model descriptor is built lazily at call
// time rather than at import. It's a cheap config object, safe to call per request.
export const embeddingModel = () =>
  openai.embedding(EMBED_MODEL_ID, { dimensions: EMBED_DIM });
