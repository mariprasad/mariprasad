import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { getNote, getNoteSlugs } from "@/lib/content";

export function generateStaticParams() {
  return getNoteSlugs().map((slug) => ({ slug }));
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let note;
  try { note = getNote(slug); } catch { notFound(); }
  const { meta, content } = note!;
  const isBuild = meta.category === "build";
  return (
    <article className="mx-auto max-w-2xl px-5 py-16">
      <p className="label text-terracotta">{isBuild ? "Building this site" : "Baking note"} · {meta.date}</p>
      <h1 className="mt-3 text-4xl text-ink">{meta.title}</h1>
      <div className="prose prose-stone mt-8 max-w-none text-ink">
        <MDXRemote source={content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
      </div>
      <Link href={isBuild ? "/work" : "/baking"} className="label text-terracotta hover:underline mt-12 inline-block">
        {isBuild ? "← Back to the work" : "← Back to the bakery"}
      </Link>
    </article>
  );
}
