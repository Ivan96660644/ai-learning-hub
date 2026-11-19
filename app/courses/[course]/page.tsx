import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChapterStatus, CourseProgress } from "@/components/progress-widgets";
import { accent } from "@/lib/accent";
import { chapterHref, chapterKey, courses, getCourse } from "@/lib/courses";

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
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/courses" className="hover:text-cyan-300">
          课程目录
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">{course.title}</span>
      </nav>

      <header className="glass relative overflow-hidden rounded-3xl p-6 sm:p-10">
        <div className={`absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br ${a.bar} opacity-20 blur-3xl`} />
        <span className={`grid h-14 w-14 place-items-center rounded-2xl text-2xl ${a.bg} ${a.text}`}>{course.icon}</span>
        <h1 className="mt-5 font-display text-3xl font-black tracking-wide text-white sm:text-4xl">{course.title}</h1>
        <p className={`mt-1 text-lg ${a.text}`}>{course.subtitle}</p>
        <p className="mt-4 max-w-2xl leading-7 text-slate-300">{course.description}</p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-400">
          <span>STAGE 0{course.stage}</span>
          <span>{course.chapters.length} 章节</span>
          <span>约 {course.totalMinutes} 分钟</span>
        </div>
        <div className="mt-6 max-w-sm">
          <CourseProgress keys={course.chapters.map(chapterKey)} barClass={a.bar} />
        </div>
        <Link
          href={chapterHref(course.chapters[0])}
          className="neon-btn mt-6 inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white hover:brightness-110"
        >
          开始本课程 →
        </Link>
      </header>

      <h2 className="mb-4 mt-12 text-xl font-bold text-white">章节列表</h2>
      <ol className="space-y-3">
        {course.chapters.map((ch, i) => (
          <li key={ch.slug}>
            <Link
              href={chapterHref(ch)}
              className={`group glass flex items-start gap-4 rounded-2xl p-5 transition hover:-translate-y-0.5 ${a.border}`}
            >
              <span className={`font-display text-2xl font-black ${a.text} opacity-70`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white group-hover:text-cyan-100">{ch.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-400">{ch.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-slate-300">{ch.level}</span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-slate-300">{ch.minutes} min</span>
                  {ch.tags.map((t) => (
                    <span key={t} className="rounded-full border border-white/10 px-2 py-0.5 text-slate-400">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <ChapterStatus chapterKey={chapterKey(ch)} />
            </Link>
          </li>
        ))}
      </ol>

      {nextCourse && (
        <Link
          href={`/courses/${nextCourse.slug}`}
          className="glass mt-10 flex items-center justify-between rounded-2xl p-5 transition hover:border-fuchsia-400/50"
        >
          <span className="text-sm text-slate-400">下一门课程</span>
          <span className="font-semibold text-white">{nextCourse.title} →</span>
        </Link>
      )}
    </div>
  );
}
