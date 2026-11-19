import type { Accent } from "@/lib/types";

/** Static class maps so Tailwind can detect every class. */
export const accent: Record<
  Accent,
  { text: string; border: string; bg: string; glow: string; bar: string }
> = {
  cyan: {
    text: "text-cyan-300",
    border: "hover:border-cyan-400/60",
    bg: "bg-cyan-400/10",
    glow: "group-hover:shadow-[0_0_40px_-8px_rgba(34,211,238,0.55)]",
    bar: "from-cyan-400 to-sky-500",
  },
  pink: {
    text: "text-fuchsia-300",
    border: "hover:border-fuchsia-400/60",
    bg: "bg-fuchsia-400/10",
    glow: "group-hover:shadow-[0_0_40px_-8px_rgba(232,121,249,0.55)]",
    bar: "from-fuchsia-400 to-pink-500",
  },
  lime: {
    text: "text-lime-300",
    border: "hover:border-lime-400/60",
    bg: "bg-lime-400/10",
    glow: "group-hover:shadow-[0_0_40px_-8px_rgba(163,230,53,0.5)]",
    bar: "from-lime-300 to-emerald-400",
  },
  violet: {
    text: "text-violet-300",
    border: "hover:border-violet-400/60",
    bg: "bg-violet-400/10",
    glow: "group-hover:shadow-[0_0_40px_-8px_rgba(167,139,250,0.55)]",
    bar: "from-violet-400 to-indigo-500",
  },
  amber: {
    text: "text-amber-300",
    border: "hover:border-amber-400/60",
    bg: "bg-amber-400/10",
    glow: "group-hover:shadow-[0_0_40px_-8px_rgba(251,191,36,0.5)]",
    bar: "from-amber-300 to-orange-500",
  },
  sky: {
    text: "text-sky-300",
    border: "hover:border-sky-400/60",
    bg: "bg-sky-400/10",
    glow: "group-hover:shadow-[0_0_40px_-8px_rgba(56,189,248,0.55)]",
    bar: "from-sky-300 to-blue-500",
  },
  rose: {
    text: "text-rose-300",
    border: "hover:border-rose-400/60",
    bg: "bg-rose-400/10",
    glow: "group-hover:shadow-[0_0_40px_-8px_rgba(251,113,133,0.55)]",
    bar: "from-rose-400 to-fuchsia-500",
  },
};
