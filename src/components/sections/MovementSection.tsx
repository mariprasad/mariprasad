import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

const STATS = [
  { label: "Highest trek", value: "15,500 ft" },
  { label: "ABVMAS, Himachal", value: "Mountaineering cert" },
  { label: "First trail run", value: "10k" },
];

export default function MovementSection() {
  return (
    <Reveal as="section" className="mx-auto max-w-5xl px-5 py-20">
      <div className="flex items-baseline justify-between">
        <h2 className="text-4xl text-ink">Movement</h2>
        <Link href="/movement" className="label text-terracotta hover:underline">The full climb →</Link>
      </div>
      <div className="mt-8 grid sm:grid-cols-3 gap-5">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-pine/30 bg-pine/5 p-5">
            <p className="text-2xl font-display text-ink">{s.value}</p>
            <p className="label text-pine mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
