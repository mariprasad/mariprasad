export type SourceKind =
  | "recipe" | "note" | "place" | "film" | "cricket"
  | "travel" | "work" | "movement" | "profile" | "strava" | "thought" | "contact";

/** A source document before embedding. */
export type RawDoc = {
  id: string;          // stable & unique, e.g. "recipe:sourdough"
  source: SourceKind;
  title: string;       // human label shown in source chips
  text: string;        // prose that gets embedded + handed to the model
  url?: string;        // link to the real page
  date?: string;       // ISO date when known
};

/** A chunk in the built index. */
export type KnowledgeChunk = RawDoc & {
  hash: string;        // sha1 of `text`, for incremental re-embedding
  vector: number[];    // embedding
};

/** A chunk returned from retrieval, with its similarity score. */
export type RetrievedChunk = {
  id: string;
  source: SourceKind;
  title: string;
  text: string;
  url?: string;
  score: number;
};
