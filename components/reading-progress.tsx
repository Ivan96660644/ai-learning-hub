"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Thin scroll-linked reading indicator under the nav (transform only). */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-12 z-30 h-0.5 origin-left bg-accent"
      style={{ scaleX }}
    />
  );
}
