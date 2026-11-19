import Link from "next/link";
import { CourseProgress } from "@/components/progress-widgets";
import { accent } from "@/lib/accent";
import { chapterHref, chapterKey } from "@/lib/courses";
import type { Chapter, Course } from "@/lib/types";

export function CourseIcon({ course, size = "md" }: { course: Pick<Course, "icon" | "accent">; size?: "md" | "lg" }) {
  const a = accent[course.accent];
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-2xl ${a.tint} ${a.text} ${
        size === "lg" ? "h-16 w-16 text-3xl" : "h-11 w-11 text-xl"
      }`}
    >
      {course.icon}
    </span>
  );
}

export function CourseCard({ course }: { course: Course }) {
  const a = accent[course.accent];
  return (
    <Link href={`/courses/${course.slug}`} className="card lift group flex h-full flex-col p-6">
      <div className="flex items-start justify-between">
        <CourseIcon course={course} />
        <span className="text-xs text-muted">阶段 {course.stage}</span>
      </div>
      <h3 className="mt-6 text-xl font-semibold tracking-tight text-fg">{course.title}</h3>
      <p className={`mt-0.5 text-sm font-medium ${a.text}`}>{course.subtitle}</p>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-muted">{course.description}</p>
      <p className="mt-5 text-xs text-muted">
        {course.chapters.length} 个章节 · 约 {course.totalMinutes} 分钟
      </p>
      <div className="mt-3">
        <CourseProgress keys={course.chapters.map(chapterKey)} barClass={a.bar} />
      </div>
    </Link>
  );
}

export function ChapterCard({ chapter, accentKey }: { chapter: Chapter; accentKey: Course["accent"] }) {
  const a = accent[accentKey];
  return (
    <Link href={chapterHref(chapter)} className="card lift group flex h-full flex-col p-6">
      <p className="text-xs text-muted">
        <span className={`font-semibold ${a.text}`}>{chapter.courseTitle}</span> · {chapter.level} · {chapter.minutes} 分钟
      </p>
      <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-fg">{chapter.title}</h3>
      <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-muted">{chapter.summary}</p>
      <span className="mt-5 text-sm font-medium text-accent group-hover:underline">阅读章节 ›</span>
    </Link>
  );
}
