import Reveal from "@/components/motion/Reveal";
import { CRICKET } from "@/data/cricket";

export default function CricketSection() {
  return (
    <Reveal as="section" className="mx-auto max-w-5xl px-5 py-20">
      <p className="label text-terracotta">Pace</p>
      <h2 className="mt-2 text-4xl text-ink">{CRICKET.role}</h2>
      <p className="mt-4 text-ink-soft max-w-xl">
        Raised on {CRICKET.loves}. The heroes:{" "}
        <span className="text-ink">{CRICKET.heroes.join(", ")}</span>. With a bat in hand,
        no one taught me more than {CRICKET.batsman}. And come IPL, it&apos;s {CRICKET.team} — always.
      </p>
    </Reveal>
  );
}
