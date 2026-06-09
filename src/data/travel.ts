export type Zone = "South" | "West" | "Central" | "North" | "Northeast";
export type Region = { id: string; name: string; zone: Zone; ut?: boolean };

export const VISITED: Region[] = [
  { id: "KA", name: "Karnataka", zone: "South" },
  { id: "KL", name: "Kerala", zone: "South" },
  { id: "TN", name: "Tamil Nadu", zone: "South" },
  { id: "PY", name: "Puducherry", zone: "South", ut: true },
  { id: "AP", name: "Andhra Pradesh", zone: "South" },
  { id: "TG", name: "Telangana", zone: "South" },
  { id: "MH", name: "Maharashtra", zone: "West" },
  { id: "GA", name: "Goa", zone: "West" },
  { id: "GJ", name: "Gujarat", zone: "West" },
  { id: "RJ", name: "Rajasthan", zone: "West" },
  { id: "MP", name: "Madhya Pradesh", zone: "Central" },
  { id: "DL", name: "Delhi", zone: "North", ut: true },
  { id: "PB", name: "Punjab", zone: "North" },
  { id: "HP", name: "Himachal Pradesh", zone: "North" },
  { id: "JK", name: "Jammu & Kashmir", zone: "North", ut: true },
  { id: "LA", name: "Ladakh", zone: "North", ut: true },
  { id: "BR", name: "Bihar", zone: "Northeast" },
  { id: "WB", name: "West Bengal", zone: "Northeast" },
  { id: "ML", name: "Meghalaya", zone: "Northeast" },
  { id: "AS", name: "Assam", zone: "Northeast" },
];

export function visitedCount(): number {
  return new Set(VISITED.map((v) => v.id)).size;
}

export function byZone(): Record<Zone, Region[]> {
  const out = { South: [], West: [], Central: [], North: [], Northeast: [] } as Record<Zone, Region[]>;
  for (const r of VISITED) out[r.zone].push(r);
  return out;
}
