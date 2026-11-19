import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article-body";
import { ChapterStatus, CompleteButton } from "@/components/progress-widgets";
import { accent } from "@/lib/accent";
import { allChapters, chapterHref, chapterKey, getChapter } from "@/lib/courses";
import type { Chapter, Course } from "@/lib/types";

export function generateStaticParams() {
  return allChapters.map((c) => ({ course: c.courseSlug, chapter: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/courses/[course]/[chapter]">): Promise<Metadata> {
  const { course, chapter } = await params;
  const data = getChapter(course, chapter);
  return data ? { title: data.chapter.title, description: data.chapter.summary } : {};
}

export default async function ChapterPage({ params }: PageProps<"/courses/[course]/[chapter]">) {
  const { course: courseSlug, chapter: chapterSlug } = await params;
  const data = getChapter(courseSlug, chapterSlug);
  if (!data) notFound();
  const { course, chapter, prev, next } = data;
  const a = accent[course.accent];
  const key = chapterKey(chapter);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_200px]">
        {/* Chapter navigation */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <details className="glass group rounded-2xl lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm text-slate-200">
              <span>
                <span className={a.text}>{course.title}</span> · 章节导航
              </span>
              <span className="transition group-open:rotate-180">▾</span>
            </summary>
            <div className="px-2 pb-3">
              <ChapterNav course={course} current={chapter} />
            </div>
          </details>
          <div className="glass hidden rounded-2xl p-3 lg:block">
            <Link href={`/courses/${course.slug}`} className="block px-2 pb-3 pt-1">
              <span className={`text-xs ${a.text}`}>{course.subtitle}</span>
              <span className="block font-display font-bold tracking-wide text-white">{course.title}</span>
            </Link>
            <ChapterNav course={course} current={chapter} />
          </div>
        </aside>

        {/* Article */}
        <article className="min-w-0">
          <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-slate-500">
            <Link href="/courses" className="hover:text-cyan-300">
              课程
            </Link>
            <span>/</span>
            <Link href={`/courses/${course.slug}`} className="hover:text-cyan-300">
              {course.title}
            </Link>
          </nav>
          <header className="border-b border-white/10 pb-6">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className={`rounded-full px-2.5 py-0.5 ${a.bg} ${a.text}`}>{chapter.level}</span>
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-slate-300">⏱ {chapter.minutes} 分钟</span>
            </div>
            <h1 className="mt-4 text-2xl font-black leading-snug text-white sm:text-4xl">{chapter.title}</h1>
            <p className="mt-3 leading-7 text-slate-400">{chapter.summary}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {chapter.tags.map((t) => (
                <Link
                  key={t}
                  href={`/search?q=${encodeURIComponent(t)}`}
                  className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-slate-400 hover:border-cyan-400/50 hover:text-cyan-200"
                >
                  #{t}
                </Link>
              ))}
            </div>
          </header>

          <div className="mt-6">
            <ArticleBody blocks={chapter.blocks} />
          </div>

          <div className="glass mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl p-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-semibold text-white">读完了吗？</p>
              <p className="text-sm text-slate-400">标记完成后，进度会保存在本地浏览器中。</p>
            </div>
            <CompleteButton chapterKey={key} />
          </div>

          <nav className="mt-6 grid gap-4 sm:grid-cols-2" aria-label="上一篇 / 下一篇">
            {prev ? <PagerLink chapter={prev} dir="prev" /> : <span />}
            {next && <PagerLink chapter={next} dir="next" />}
          </nav>
        </article>

        {/* On-page TOC */}
        <aside className="hidden xl:block">
          <div className="sticky top-24">
            <p className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.25em] text-fuchsia-300">
              On this page
            </p>
            <ul className="space-y-2 border-l border-white/10 text-sm">
              {chapter.headings.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="-ml-px block border-l border-transparent pl-3 text-slate-400 hover:border-cyan-300 hover:text-cyan-200">
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ChapterNav({ course, current }: { course: Course; current: Chapter }) {
  return (
    <ol className="space-y-1">
      {course.chapters.map((ch, i) => {
        const active = ch.slug === current.slug;
        return (
          <li key={ch.slug}>
            <Link
              href={chapterHref(ch)}
              aria-current={active ? "page" : undefined}
              className={`flex items-start gap-2 rounded-xl px-2 py-2 text-sm leading-6 transition ${
                active ? "bg-fuchsia-500/15 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="mt-0.5 font-mono text-[11px] text-slate-500">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1">{ch.title}</span>
              <ChapterStatus chapterKey={chapterKey(ch)} />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

function PagerLink({ chapter, dir }: { chapter: Chapter; dir: "prev" | "next" }) {
  return (
    <Link
      href={chapterHref(chapter)}
      className={`glass group rounded-2xl p-5 transition hover:border-cyan-400/50 ${dir === "next" ? "sm:text-right" : ""}`}
    >
      <p className="text-xs text-slate-500">
        {dir === "prev" ? "← 上一篇" : "下一篇 →"} · {chapter.courseTitle}
      </p>
      <p className="mt-1.5 font-semibold text-white group-hover:text-cyan-100">{chapter.title}</p>
    </Link>
  );
}
