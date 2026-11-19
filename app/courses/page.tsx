import type { Metadata } from "next";
import Link from "next/link";
import { CourseCard } from "@/components/cards";
import { PageHeader } from "@/components/page-header";
import { ChapterStatus } from "@/components/progress-widgets";
import { accent } from "@/lib/accent";
import { chapterHref, chapterKey, courses } from "@/lib/courses";

export const metadata: Metadata = { title: "课程目录" };

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <PageHeader
        en="Catalog"
        title="课程目录"
        desc="按推荐顺序排列的 7 门课程。点击课程查看详情，或直接跳转到任意章节。"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map((c) => (
          <CourseCard key={c.slug} course={c} />
        ))}
      </div>

      <h2 className="mb-4 mt-14 text-xl font-bold text-white">全部章节</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {courses.map((c) => (
          <div key={c.slug} className="glass rounded-2xl p-5">
            <Link href={`/courses/${c.slug}`} className="flex items-center gap-2">
              <span className={`text-lg ${accent[c.accent].text}`}>{c.icon}</span>
              <span className="font-display font-bold tracking-wide text-white hover:text-cyan-200">{c.title}</span>
              <span className="text-sm text-slate-500">{c.subtitle}</span>
            </Link>
            <ul className="mt-3 divide-y divide-white/5">
              {c.chapters.map((ch, i) => (
                <li key={ch.slug}>
                  <Link href={chapterHref(ch)} className="group flex items-center gap-3 py-3">
                    <span className="font-mono text-xs text-slate-500">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1 text-sm text-slate-300 group-hover:text-white">{ch.title}</span>
                    <span className="hidden text-xs text-slate-500 sm:inline">{ch.minutes} min</span>
                    <ChapterStatus chapterKey={chapterKey(ch)} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
