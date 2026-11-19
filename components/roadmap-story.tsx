"use client";

import { motion, useScroll, useSpring } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { easeApple } from "@/components/reveal";

export interface RoadmapStep {
  stage: number;
  title: string;
  en: string;
  desc: string;
  courses: { slug: string; title: string; subtitle: string; text: string; tint: string; icon: string }[];
}

/**
 * Sticky-scroll storytelling: the heading stays pinned while the four stages
 * scroll past; a thin scroll-linked line (scaleY only) shows how far you are.
 */
export function RoadmapStory({ steps }: { steps: RoadmapStep[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <div ref={ref} className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="text-sm font-semibold text-accent">学习路线</p>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
          四个阶段，
          <br />
          循序渐进。
        </h2>
        <p className="mt-5 max-w-md text-lg leading-8 text-muted">
          每一步都建立在上一步之上：先理解模型，再连接知识，然后让它行动，最后把它可靠地交付到生产环境。
        </p>
        <div className="mt-8 hidden h-40 w-px overflow-hidden bg-line lg:block" aria-hidden>
          <motion.div className="h-full w-full origin-top bg-accent" style={{ scaleY: progress }} />
        </div>
      </div>

      <ol className="space-y-6">
        {steps.map((step) => (
          <motion.li
            key={step.stage}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            transition={{ duration: 0.8, ease: easeApple }}
            className="rounded-[2rem] bg-surface p-8 sm:p-10"
          >
            <p className="text-sm font-medium text-muted">
              阶段 {step.stage} · {step.en}
            </p>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight text-fg">{step.title}</h3>
            <p className="mt-3 text-[17px] leading-7 text-muted">{step.desc}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {step.courses.map((c) => (
                <Link
                  key={c.slug}
                  href={`/courses/${c.slug}`}
                  className="lift flex items-center gap-3 rounded-2xl bg-card p-4"
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${c.tint} ${c.text}`} aria-hidden>
                    {c.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-fg">{c.title}</span>
                    <span className="block truncate text-sm text-muted">{c.subtitle}</span>
                  </span>
                </Link>
              ))}
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
