import { CRICKET } from "@/data/cricket";
import { VISITED } from "@/data/travel";
import { EXPERIENCE, PROJECTS, FEATURED } from "@/data/work";
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
  const featured: RawDoc = {
    id: "work:featured",
    source: "work",
    title: FEATURED.title,
    text: `${FEATURED.title} at ${FEATURED.company}: ${FEATURED.blurb} Stack: ${FEATURED.stack.join(", ")}.`,
    url: "/work",
  };
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
  return [featured, ...projects, ...roles];
}

export async function collectMovement(): Promise<RawDoc[]> {
  return [{
    id: "movement:overview",
    source: "movement" as const,
    title: "Movement",
    text: "I hold a basic mountaineering certificate from ABVMAS, Himachal. I've trekked up to 15,500 ft and finished my first 10k trail run.",
    url: "/movement",
  }];
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
