"use client";
import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

export default function Lightbox({
  src, alt, onClose,
}: { src: string | null; alt: string; onClose: () => void }) {
  useEffect(() => {
    if (!src) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [src, onClose]);

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          role="dialog" aria-modal="true" aria-label={alt}
          className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-6"
          onClick={onClose}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}
            className="relative w-full max-w-3xl aspect-[3/2]"
          >
            <button
              type="button" aria-label="Close" onClick={onClose}
              className="absolute -top-3 -right-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-paper text-ink shadow-md hover:bg-paper-deep"
            >
              ×
            </button>
            <Image src={src} alt={alt} fill className="object-contain" sizes="100vw" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
