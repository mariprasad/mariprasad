import Reveal from "@/components/motion/Reveal";
import AskMari from "@/components/ask/AskMari";

export default function Intro() {
  return (
    <Reveal as="section" className="mx-auto max-w-5xl px-5 py-16">
      <p className="text-2xl leading-relaxed text-ink max-w-2xl">
        Code, bread, cricket. In no particular order. I like baking sourdough,
        cooking, runs that occasionally become walks, cycling when the mood strikes,
        getting away to the hills, and wondering how quick I might&rsquo;ve bowled if
        I had taken cricket a bit more seriously.
      </p>
      <div id="ask-mari-slot" className="mt-10 max-w-2xl">
        <p className="label text-terracotta">Curious about something? Ask me.</p>
        <div className="mt-3"><AskMari /></div>
      </div>
    </Reveal>
  );
}
