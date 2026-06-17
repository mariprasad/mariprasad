import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { embedMany } from "ai";
import { embeddingModel } from "../src/lib/knowledge/embedding";
import { chunkText } from "../src/lib/knowledge/chunk";
import { ALL_SOURCES } from "../src/lib/knowledge/sources";
import type { RawDoc, KnowledgeChunk } from "../src/lib/knowledge/types";

const OUT = path.join(process.cwd(), "src/data/knowledge-index.json");

// Best-effort .env.local loader so local runs pick up OPENAI_API_KEY / AIRTABLE_TOKEN.
// In CI, real env vars are already set and take precedence.
function loadEnvLocal(): void {
  const f = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, "utf8").split("\n")) {
    const m = /^([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line.trim());
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const sha1 = (s: string) => crypto.createHash("sha1").update(s).digest("hex");

async function main(): Promise<void> {
  loadEnvLocal();

  // 1. Collect every source (a failing source warns but doesn't abort the build).
  const raw: RawDoc[] = [];
  for (const collect of ALL_SOURCES) {
    try {
      raw.push(...(await collect()));
    } catch (e) {
      console.warn(`[build-knowledge] source failed, skipping:`, e);
    }
  }

  // 2. Chunk long docs.
  const docs: RawDoc[] = [];
  for (const d of raw) {
    const parts = chunkText(d.text);
    if (parts.length <= 1) {
      docs.push({ ...d, text: parts[0] ?? d.text });
    } else {
      parts.forEach((text, i) => docs.push({ ...d, id: `${d.id}#${i}`, text }));
    }
  }

  // 3. Reuse vectors for unchanged text (incremental embedding).
  const prev: KnowledgeChunk[] = fs.existsSync(OUT)
    ? (JSON.parse(fs.readFileSync(OUT, "utf8")) as KnowledgeChunk[])
    : [];
  const cache = new Map(prev.map((c) => [c.hash, c.vector]));

  const out: KnowledgeChunk[] = [];
  const toEmbed: RawDoc[] = [];
  for (const d of docs) {
    const hash = sha1(d.text);
    const cached = cache.get(hash);
    if (cached) {
      out.push({ ...d, hash, vector: cached });
    } else {
      toEmbed.push(d);
      out.push({ ...d, hash, vector: [] }); // filled below
    }
  }

  // 4. Embed only new/changed chunks.
  if (toEmbed.length > 0) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is required to embed new chunks");
    }
    const { embeddings } = await embedMany({
      model: embeddingModel(),
      values: toEmbed.map((d) => d.text),
    });
    const byId = new Map(toEmbed.map((d, i) => [d.id, embeddings[i]]));
    for (const c of out) {
      if (c.vector.length === 0) c.vector = byId.get(c.id) as number[];
    }
  }

  fs.writeFileSync(OUT, JSON.stringify(out));
  console.log(`[build-knowledge] wrote ${out.length} chunks (${toEmbed.length} newly embedded) -> ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
