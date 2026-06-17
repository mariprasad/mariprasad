import { getSavedPlaces } from "@/lib/airtable-places";
import type { RawDoc } from "../types";

export async function collectPlaces(): Promise<RawDoc[]> {
  try {
    const places = await getSavedPlaces();
    return places.map((p): RawDoc => {
      const bits = [
        p.region && `in ${p.region}`,
        p.food && `known for ${p.food}`,
        typeof p.rating === "number" && `I rated it ${p.rating}/5`,
        p.tag && `(${p.tag})`,
        p.note,
      ].filter(Boolean).join(". ");
      return {
        id: `place:${p.id}`,
        source: "place",
        title: p.name,
        text: bits ? `${p.name} — ${bits}.` : `${p.name}.`,
        url: "/travel",
        date: p.date,
      };
    });
  } catch {
    return [];
  }
}
