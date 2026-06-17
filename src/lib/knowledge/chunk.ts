/**
 * Split prose into chunks no larger than `maxChars`, preferring paragraph
 * boundaries. A single oversized paragraph is emitted as its own chunk.
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
    if (buf.length >= maxChars) {
      chunks.push(buf);
      buf = "";
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}
