import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
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
      <p className="label text-terracotta">{`${meta.proofTime} proof${meta.difficulty ? ` · ${meta.difficulty}` : ""}`}</p>
      <h1 className="mt-3 text-4xl text-ink">{meta.title}</h1>
      {meta.cover && (
        <div className={meta.cutout
          ? "relative mt-6 aspect-[3/2] grid place-items-center"
          : "relative mt-6 aspect-[3/2] overflow-hidden rounded-xl"}>
          <Image src={meta.cover} alt={meta.title} fill
            className={meta.cutout
              ? "object-contain p-2 drop-shadow-[0_6px_8px_rgba(35,48,38,0.20)] drop-shadow-[0_22px_26px_rgba(35,48,38,0.28)]"
              : "object-cover"}
            sizes="100vw" />
        </div>
      )}
      <div className="prose prose-stone mt-8 max-w-none text-ink">
        <MDXRemote source={content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
      </div>
      {meta.photos && meta.photos.length > 0 && (
        <div className="mt-10"><PhotoGallery photos={meta.photos} alt={meta.title} /></div>
      )}
    </article>
  );
}
