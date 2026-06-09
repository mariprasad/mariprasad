import Reveal from "@/components/motion/Reveal";
import AskMari from "@/components/ask/AskMari";

export default function Intro() {
  return (
    <Reveal as="section" className="mx-auto max-w-5xl px-5 py-16">
      <p className="text-2xl leading-relaxed text-ink max-w-2xl">
        I build software for a living and bread for the joy of it. Somewhere between a
        fast outswinger and a 72-hour sourdough is roughly where you&apos;ll find me —
        plus a few mountains and a lot of train journeys.
      </p>
      <div id="ask-mari-slot" className="mt-10 max-w-2xl">
        <p className="label text-terracotta">Curious about something? Ask me.</p>
        <div className="mt-3"><AskMari /></div>
      </div>
    </Reveal>
  );
}
