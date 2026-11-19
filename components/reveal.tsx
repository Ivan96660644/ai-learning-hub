"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export const easeApple = [0.22, 1, 0.36, 1] as const;

/**
 * Fades + lifts content the first time it scrolls into view.
 * Uses only opacity/transform, so it never causes layout shift.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.7, ease: easeApple, delay }}
    >
      {children}
    </Comp>
  );
}
