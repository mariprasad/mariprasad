/**
 * Split prose into chunks, preferring paragraph (blank-line) boundaries and
 * keeping each chunk within `maxChars` where possible.
 *
 * Exception: a single paragraph longer than `maxChars` is emitted whole, as its
 * own chunk — we never split mid-paragraph (it would harm embedding quality, and
 * the embedding model tolerates inputs far larger than this cap). So a returned
 * chunk may exceed `maxChars` only when it is one such oversized paragraph.
 */
export function chunkText(text: string, maxChars = 800): string[] {
  const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let buf = "";
  for (const p of paras) {
    if (buf && buf.length + p.length + 2 > maxChars) {
      chunks.push(buf);
      buf = "";
    }
    buf = buf ? `${buf}\n\n${p}` : p;
    if (buf.length > maxChars) {
      chunks.push(buf);
      buf = "";
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}
