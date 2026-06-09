import { VISITED } from "@/data/travel";

export function norm(s: string): string {
  return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "");
}

// Map normalized TopoJSON feature-name variants onto our canonical region names.
const ALIASES: Record<string, string> = {
  nctofdelhi: "delhi",
  delhinct: "delhi",
};

const visitedNorm = new Set(VISITED.map((v) => norm(v.name)));

export function isVisitedName(featureName: string): boolean {
  const n = norm(featureName);
  return visitedNorm.has(n) || visitedNorm.has(ALIASES[n] ?? "");
}
