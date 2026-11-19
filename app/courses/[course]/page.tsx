import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { CourseIcon } from "@/components/cards";
import { ChapterStatus, CourseProgress } from "@/components/progress-widgets";
import { Reveal } from "@/components/reveal";
import { accent } from "@/lib/accent";
import { chapterHref, chapterKey, courses, getCourse } from "@/lib/courses";

const d = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

export function generateStaticParams() {
  return courses.map((c) => ({ course: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/courses/[course]">): Promise<Metadata> {
  const { course: slug } = await params;
  const course = getCourse(slug);
  return course ? { title: `${course.title} · ${course.subtitle}`, description: course.description } : {};
}

export default async function CoursePage({ params }: PageProps<"/courses/[course]">) {
  const { course: slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();
  const a = accent[course.accent];
  const idx = courses.indexOf(course);
  const nextCourse = courses[idx + 1];

  return (
    <div className="container-x max-w-5xl">
      <nav aria-label="面包屑" className="pt-8 text-sm text-muted">
        <Link href="/courses" className="hover:text-fg">
          课程
        </Link>
        <span className="mx-2" aria-hidden>
          ›
        </span>
        <span className="text-fg" aria-current="page">
          {course.title}
        </span>
      </nav>

      <header className="pb-14 pt-12 text-center sm:pt-16">
        <div className="hero-in flex justify-center" style={d(0)}>
          <CourseIcon course={course} size="lg" />
        </div>
        <p className={`hero-in mt-6 text-lg font-semibold ${a.text}`} style={d(80)}>
          {course.subtitle}
        </p>
        <h1 className="hero-in mt-1 text-4xl font-semibold tracking-tight text-fg sm:text-6xl" style={d(160)}>
          {course.title}
        </h1>
        <p className="hero-in mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl" style={d(240)}>
          {course.description}
        </p>
        <p className="hero-in mt-4 text-sm text-muted" style={d(300)}>
          阶段 {course.stage} · {course.chapters.length} 个章节 · 约 {course.totalMinutes} 分钟
        </p>
        <div className="hero-in mx-auto mt-8 max-w-xs" style={d(360)}>
          <CourseProgress keys={course.chapters.map(chapterKey)} barClass={a.bar} />
        </div>
        <div className="hero-in mt-8" style={d(420)}>
          <Link href={chapterHref(course.chapters[0])} className="btn-primary">
            开始本课程
          </Link>
        </div>
      </header>

      <h2 className="mb-6 text-2xl font-semibold tracking-tight text-fg">章节</h2>
      <ol className="space-y-4">
        {course.chapters.map((ch, i) => (
          <Reveal as="li" key={ch.slug} delay={i * 0.06}>
            <Link href={chapterHref(ch)} className="card lift group flex items-start gap-5 p-6 sm:p-8">
              <span className="text-3xl font-semibold tabular-nums text-muted/60">{String(i + 1).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-semibold tracking-tight text-fg group-hover:text-accent">{ch.title}</h3>
                <p className="mt-2 leading-7 text-muted">{ch.summary}</p>
                <p className="mt-3 text-sm text-muted">
                  {ch.level} · {ch.minutes} 分钟 · {ch.tags.join(" · ")}
                </p>
              </div>
              <ChapterStatus chapterKey={chapterKey(ch)} />
            </Link>
          </Reveal>
        ))}
      </ol>

      {nextCourse && (
        <Reveal className="mt-12">
          <Link
            href={`/courses/${nextCourse.slug}`}
            className="flex items-center justify-between rounded-3xl bg-surface p-6 transition-colors hover:bg-line"
          >
            <span className="text-sm text-muted">下一门课程</span>
            <span className="font-semibold text-accent">{nextCourse.title} ›</span>
          </Link>
        </Reveal>
      )}
    </div>
  );
}
