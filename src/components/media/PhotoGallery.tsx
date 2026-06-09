"use client";
import { useState } from "react";
import Image from "next/image";
import Lightbox from "./Lightbox";

export default function PhotoGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <>
      <div className="columns-2 sm:columns-3 gap-3 [&>button]:mb-3">
        {photos.map((src) => (
          <button key={src} type="button" aria-label={`View photo of ${alt}`}
            onClick={() => setActive(src)}
            className="block w-full overflow-hidden rounded-lg">
            <Image src={src} alt={alt} width={400} height={500}
              className="w-full h-auto object-cover hover:opacity-90 transition-opacity" />
          </button>
        ))}
      </div>
      <Lightbox src={active} alt={alt} onClose={() => setActive(null)} />
    </>
  );
}
