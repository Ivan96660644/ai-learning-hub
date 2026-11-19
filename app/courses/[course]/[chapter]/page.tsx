import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article-body";
import { ChapterStatus, CompleteButton } from "@/components/progress-widgets";
import { ReadingProgress } from "@/components/reading-progress";
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
  return data
    ? {
        title: data.chapter.title,
        description: data.chapter.summary,
        openGraph: { type: "article", title: data.chapter.title, description: data.chapter.summary },
      }
    : {};
}

export default async function ChapterPage({ params }: PageProps<"/courses/[course]/[chapter]">) {
  const { course: courseSlug, chapter: chapterSlug } = await params;
  const data = getChapter(courseSlug, chapterSlug);
  if (!data) notFound();
  const { course, chapter, prev, next } = data;
  const a = accent[course.accent];
  const key = chapterKey(chapter);

  return (
    <>
      <ReadingProgress />
      <div className="container-x py-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_200px] xl:gap-14">
          {/* Chapter navigation */}
          <aside className="lg:sticky lg:top-20 lg:self-start" aria-label="章节导航">
            <details className="group rounded-2xl bg-surface lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm text-fg">
                <span>
                  <span className={`font-semibold ${a.text}`}>{course.title}</span> · 章节导航
                </span>
                <span className="text-muted transition-transform group-open:rotate-180" aria-hidden>
                  ⌄
                </span>
              </summary>
              <div className="px-2 pb-3">
                <ChapterNav course={course} current={chapter} />
              </div>
            </details>
            <div className="hidden lg:block">
              <Link href={`/courses/${course.slug}`} className="block px-2 pb-4">
                <span className={`block text-xs font-semibold ${a.text}`}>{course.subtitle}</span>
                <span className="block font-semibold text-fg hover:text-accent">{course.title}</span>
              </Link>
              <ChapterNav course={course} current={chapter} />
            </div>
          </aside>

          {/* Article */}
          <article className="min-w-0 max-w-3xl">
            <nav aria-label="面包屑" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted">
              <Link href="/courses" className="hover:text-fg">
                课程
              </Link>
              <span aria-hidden>›</span>
              <Link href={`/courses/${course.slug}`} className="hover:text-fg">
                {course.title}
              </Link>
            </nav>
            <header className="border-b border-line pb-8">
              <p className="text-sm text-muted">
                <span className={`font-semibold ${a.text}`}>{chapter.level}</span> · 约 {chapter.minutes} 分钟阅读
              </p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-5xl">
                {chapter.title}
              </h1>
              <p className="mt-4 text-lg leading-8 text-muted sm:text-xl">{chapter.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {chapter.tags.map((t) => (
                  <Link
                    key={t}
                    href={`/search?q=${encodeURIComponent(t)}`}
                    className="rounded-full bg-surface px-3 py-1 text-xs text-muted transition-colors hover:bg-line hover:text-fg"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </header>

            <div className="mt-4">
              <ArticleBody blocks={chapter.blocks} />
            </div>

            <div className="mt-16 flex flex-col items-start justify-between gap-5 rounded-3xl bg-surface p-6 sm:flex-row sm:items-center sm:p-8">
              <div>
                <p className="text-lg font-semibold text-fg">读完了吗？</p>
                <p className="mt-1 text-sm text-muted">标记完成后，进度会保存在本地浏览器中。</p>
              </div>
              <CompleteButton chapterKey={key} />
            </div>

            <nav className="mt-6 grid gap-4 sm:grid-cols-2" aria-label="上一篇 / 下一篇">
              {prev ? <PagerLink chapter={prev} dir="prev" /> : <span />}
              {next && <PagerLink chapter={next} dir="next" />}
            </nav>
          </article>

          {/* On-page TOC */}
          <aside className="hidden xl:block" aria-label="本页目录">
            <div className="sticky top-20">
              <p className="mb-3 text-xs font-semibold text-fg">本页内容</p>
              <ul className="space-y-2.5 text-[13px]">
                {chapter.headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="block leading-5 text-muted transition-colors hover:text-accent">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function ChapterNav({ course, current }: { course: Course; current: Chapter }) {
  return (
    <ol className="space-y-0.5">
      {course.chapters.map((ch, i) => {
        const active = ch.slug === current.slug;
        return (
          <li key={ch.slug}>
            <Link
              href={chapterHref(ch)}
              aria-current={active ? "page" : undefined}
              className={`flex items-start gap-2.5 rounded-xl px-2.5 py-2 text-[13px] leading-5 transition-colors ${
                active ? "bg-surface font-medium text-fg" : "text-muted hover:text-fg"
              }`}
            >
              <span className="mt-px w-4 tabular-nums">{i + 1}</span>
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
      className={`card lift group p-6 ${dir === "next" ? "sm:text-right" : ""}`}
    >
      <p className="text-xs text-muted">
        {dir === "prev" ? "‹ 上一篇" : "下一篇 ›"} · {chapter.courseTitle}
      </p>
      <p className="mt-1.5 font-semibold text-fg group-hover:text-accent">{chapter.title}</p>
    </Link>
  );
}
