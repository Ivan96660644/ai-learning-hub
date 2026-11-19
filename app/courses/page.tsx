import type { Metadata } from "next";
import Link from "next/link";
import { CourseCard, CourseIcon } from "@/components/cards";
import { PageHeader } from "@/components/page-header";
import { ChapterStatus } from "@/components/progress-widgets";
import { Reveal } from "@/components/reveal";
import { chapterHref, chapterKey, courses } from "@/lib/courses";

export const metadata: Metadata = {
  title: "课程目录",
  description: "LLM Fundamentals、Prompt Engineering、RAG、AI Agents、MCP、Model Evaluation 与 LLMOps 七门课程。",
};

export default function CoursesPage() {
  return (
    <div className="container-x">
      <PageHeader
        eyebrow="课程目录"
        title="按推荐顺序学习。"
        desc="七门课程、四个阶段。点击课程查看详情，或直接跳转到任意章节。"
      />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map((c, i) => (
          <Reveal as="li" key={c.slug} delay={(i % 4) * 0.06}>
            <CourseCard course={c} />
          </Reveal>
        ))}
      </ul>

      <h2 className="mb-6 mt-24 text-3xl font-semibold tracking-tight text-fg">全部章节</h2>
      <div className="grid gap-5 lg:grid-cols-2">
        {courses.map((c) => (
          <Reveal key={c.slug} className="rounded-3xl bg-surface p-6">
            <Link href={`/courses/${c.slug}`} className="flex items-center gap-3">
              <CourseIcon course={c} />
              <span>
                <span className="block font-semibold text-fg hover:text-accent">{c.title}</span>
                <span className="block text-sm text-muted">{c.subtitle}</span>
              </span>
            </Link>
            <ul className="mt-4 divide-y divide-line">
              {c.chapters.map((ch, i) => (
                <li key={ch.slug}>
                  <Link href={chapterHref(ch)} className="group flex items-center gap-4 py-3.5">
                    <span className="w-5 text-sm tabular-nums text-muted">{i + 1}</span>
                    <span className="flex-1 text-[15px] text-fg group-hover:text-accent">{ch.title}</span>
                    <span className="hidden text-xs text-muted sm:inline">{ch.minutes} 分钟</span>
                    <ChapterStatus chapterKey={chapterKey(ch)} />
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
