import type { Accent } from "@/lib/types";

/**
 * Restrained per-course tints (system-color inspired). Used only for small
 * icons, labels and progress bars — never for large glowing surfaces.
 * Static class strings so Tailwind can detect them.
 */
export const accent: Record<Accent, { text: string; tint: string; bar: string }> = {
  cyan: {
    text: "text-teal-600 dark:text-teal-400",
    tint: "bg-teal-500/10",
    bar: "bg-teal-500",
  },
  pink: {
    text: "text-pink-600 dark:text-pink-400",
    tint: "bg-pink-500/10",
    bar: "bg-pink-500",
  },
  lime: {
    text: "text-green-600 dark:text-green-400",
    tint: "bg-green-500/10",
    bar: "bg-green-500",
  },
  violet: {
    text: "text-violet-600 dark:text-violet-400",
    tint: "bg-violet-500/10",
    bar: "bg-violet-500",
  },
  amber: {
    text: "text-orange-600 dark:text-orange-400",
    tint: "bg-orange-500/10",
    bar: "bg-orange-500",
  },
  sky: {
    text: "text-sky-600 dark:text-sky-400",
    tint: "bg-sky-500/10",
    bar: "bg-sky-500",
  },
  rose: {
    text: "text-rose-600 dark:text-rose-400",
    tint: "bg-rose-500/10",
    bar: "bg-rose-500",
  },
};
