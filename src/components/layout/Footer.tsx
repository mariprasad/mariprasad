import { PROFILE } from "@/data/profile";
import NowPlaying from "./NowPlaying";

export default function Footer() {
  const { socials, email } = PROFILE;
  return (
    <footer className="mx-auto max-w-5xl px-5 py-16 border-t border-ink/10 mt-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-soft">Built slowly, like the bread. © Mariprasad Ramakrishna.</p>
        <NowPlaying />
      </div>
      <div className="mt-4 flex gap-4 text-sm">
        <a href={socials.linkedin} className="text-ink hover:text-terracotta">LinkedIn</a>
        {socials.github && <a href={socials.github} className="text-ink hover:text-terracotta">GitHub</a>}
        <a href={`mailto:${email}`} className="text-ink hover:text-terracotta">Email</a>
      </div>
    </footer>
  );
}
