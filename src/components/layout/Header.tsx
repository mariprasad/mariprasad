import Link from "next/link";

const links = [
  ["Baking", "/baking"],
  ["Travel", "/travel"],
  ["Movement", "/movement"],
  ["Movies", "/movies"],
  ["Work", "/work"],
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-sm bg-paper/80 border-b-2 border-terracotta/30">
      <nav className="mx-auto max-w-5xl flex items-center justify-between px-5 py-3">
        <Link href="/" className="label text-terracotta text-sm">mari</Link>
        <ul className="flex gap-4 text-sm text-ink-soft">
          {links.map(([label, href]) => (
            <li key={href}><Link href={href} className="hover:text-terracotta transition-colors">{label}</Link></li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
