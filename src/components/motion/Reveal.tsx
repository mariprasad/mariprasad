"use client";
import { motion } from "motion/react";
import { fadeUp } from "@/lib/motion";

export default function Reveal({
  children, className, as = "div",
}: { children: React.ReactNode; className?: string; as?: "div" | "section" }) {
  const M = as === "section" ? motion.section : motion.div;
  return (
    <M
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </M>
  );
}
