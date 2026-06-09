import { PROFILE } from "@/data/profile";

export default function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-5 pt-24 pb-20">
      <p className="label text-terracotta">{PROFILE.location} · slow-fermented since last July</p>
      <h1 className="mt-6 text-5xl sm:text-7xl leading-[0.95] font-semibold text-ink">
        {PROFILE.name}
      </h1>
      <p className="mt-6 text-xl sm:text-2xl text-ink-soft max-w-xl">
        — {PROFILE.tagline}.
      </p>
    </section>
  );
}
