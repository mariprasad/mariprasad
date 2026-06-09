"use client";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

export default function Lightbox({
  src, alt, onClose,
}: { src: string | null; alt: string; onClose: () => void }) {
  return (
    <AnimatePresence>
      {src && (
        <motion.div
          role="dialog" aria-modal="true" aria-label={alt}
          className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-6"
          onClick={onClose}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}
            className="relative w-full max-w-3xl aspect-[3/2]">
            <Image src={src} alt={alt} fill className="object-contain" sizes="100vw" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
