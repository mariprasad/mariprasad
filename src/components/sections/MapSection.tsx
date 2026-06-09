import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import IndiaMap from "@/components/map/IndiaMap";
import { visitedCount } from "@/data/travel";

export default function MapSection() {
  return (
    <Reveal as="section" className="mx-auto max-w-5xl px-5 py-20">
      <div className="flex items-baseline justify-between">
        <h2 className="text-4xl text-ink">On the Map</h2>
        <Link href="/travel" className="label text-terracotta hover:underline">The full map →</Link>
      </div>
      <p className="mt-3 text-ink-soft">
        <span className="text-ink font-display text-2xl">{visitedCount()}</span> states &amp; UTs, solo.
      </p>
      <div className="mt-6 max-w-md mx-auto">
        <IndiaMap />
      </div>
    </Reveal>
  );
}
