import { CRICKET } from "@/data/cricket";
import { VISITED } from "@/data/travel";
import { EXPERIENCE, PROJECTS } from "@/data/work";
import { PROFILE } from "@/data/profile";
import type { RawDoc } from "../types";

export async function collectCricket(): Promise<RawDoc[]> {
  return [{
    id: "cricket:overview",
    source: "cricket" as const,
    title: "Cricket",
    text: `I bowl right-arm fast. I love ${CRICKET.loves}. My bowling heroes are ${CRICKET.heroes.join(", ")}. Favourite batsman: ${CRICKET.batsman}. IPL team: ${CRICKET.team}.`,
    url: "/#cricket",
  }];
}

export async function collectTravel(): Promise<RawDoc[]> {
  const names = VISITED.map((v) => v.name).join(", ");
  return [{
    id: "travel:overview",
    source: "travel" as const,
    title: "Travel",
    text: `I've travelled solo across ${VISITED.length} states and union territories of India: ${names}.`,
    url: "/travel",
  }];
}

export async function collectWork(): Promise<RawDoc[]> {
  const projects: RawDoc[] = PROJECTS.map((p, i) => ({
    id: `work:project:${i}`,
    source: "work" as const,
    title: p.name,
    text: `${p.name} (${p.org}, ${p.period}): ${p.blurb} Stack: ${p.stack.join(", ")}.`,
    url: "/work",
  }));
  const roles: RawDoc[] = EXPERIENCE.map((r, i) => ({
    id: `work:role:${i}`,
    source: "work" as const,
    title: `${r.title} — ${r.company}`,
    text: `${r.title} at ${r.company} (${r.period}): ${r.blurb}`,
    url: "/work",
  }));
  return [...projects, ...roles];
}

export async function collectMovement(): Promise<RawDoc[]> {
  // Three focused docs so each embeds independently — in particular the Yunam doc, which
  // should win "hardest / a trek that broke you" questions over the easy named treks that
  // come from the saved-places list. See the 2026-06-19 broke-me design doc.
  return [
    {
      id: "movement:overview",
      source: "movement" as const,
      title: "Movement",
      text: "Movement keeps me honest — running, trekking, and time in the mountains. I hold a basic mountaineering certificate from ABVMAS in Himachal, and I finished my first 10k trail run. The mountains are where I feel smallest, and the most awake.",
      url: "/movement",
    },
    {
      id: "movement:shitidhar",
      source: "movement" as const,
      title: "Mt. Shitidhar — the hardest I've climbed",
      text: "In 2023 I did my basic mountaineering course with ABVMAS in Himachal. The big climb was Mt. Shitidhar — a 17,060 ft peak above the Beas Kund glacier — and I made it to about 15,500 ft, the highest I've ever stood. Thin air, slow steps, the whole world gone quiet and white. There were stretches where I wanted to quit and just take it easy; no one made me come up here, so part of me kept asking what the point was. But I kept moving, and I'm simply happy I did it. You choose to do these things — that's the whole point of them.",
      url: "/movement",
    },
    {
      id: "movement:yunam",
      source: "movement" as const,
      title: "Yunam Peak — the trek that broke me",
      text: "Yunam Peak, in Himachal's Lahaul, is the one that broke me. In 2025 we drove up to base camp by van — and that was the mistake. I hadn't acclimatised; the altitude hit me as acidity and nausea, and I turned back from base camp before the real summit push ever began. I didn't make it. It's the hardest lesson the mountains have taught me: respect the altitude, give the climb its time. I want to go back and finish it right.",
      url: "/movement",
    },
  ];
}

export async function collectProfile(): Promise<RawDoc[]> {
  const ms = PROFILE.milestones.map((m) => `${m.label}: ${m.value}`).join("; ");
  return [{
    id: "profile:identity",
    source: "profile" as const,
    title: "About Mari",
    text: `I'm ${PROFILE.name}, based in ${PROFILE.location}. I'm a full-stack engineer and tech lead. I'm 185 cm tall and weigh 75 kg (as of May 2026). Milestones: ${ms}.`,
    url: "/",
  }];
}
