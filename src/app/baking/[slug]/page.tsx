import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import PhotoGallery from "@/components/media/PhotoGallery";
import { getRecipe, getRecipeSlugs } from "@/lib/content";

export function generateStaticParams() {
  return getRecipeSlugs().map((slug) => ({ slug }));
}

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let recipe;
  try { recipe = getRecipe(slug); } catch { notFound(); }
  const { meta, content } = recipe!;
  return (
    <article className="mx-auto max-w-2xl px-5 py-16">
      <p className="label text-terracotta">{meta.proofTime} proof · {meta.difficulty ?? ""}</p>
      <h1 className="mt-3 text-4xl text-ink">{meta.title}</h1>
      {meta.cover && (
        <div className="relative mt-6 aspect-[3/2] overflow-hidden rounded-xl">
          <Image src={meta.cover} alt={meta.title} fill className="object-cover" sizes="100vw" />
        </div>
      )}
      <div className="prose prose-stone mt-8 max-w-none text-ink">
        <MDXRemote source={content} />
      </div>
      {meta.photos && meta.photos.length > 0 && (
        <div className="mt-10"><PhotoGallery photos={meta.photos} alt={meta.title} /></div>
      )}
    </article>
  );
}
