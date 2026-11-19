import Link from "next/link";
import { CourseProgress } from "@/components/progress-widgets";
import { accent } from "@/lib/accent";
import { chapterHref, chapterKey } from "@/lib/courses";
import type { Chapter, Course } from "@/lib/types";

export function CourseCard({ course }: { course: Course }) {
  const a = accent[course.accent];
  return (
    <Link
      href={`/courses/${course.slug}`}
      className={`group glass relative flex flex-col overflow-hidden rounded-2xl p-5 transition duration-300 hover:-translate-y-1 ${a.border} ${a.glow}`}
    >
      <div className="flex items-start justify-between">
        <span className={`grid h-11 w-11 place-items-center rounded-xl text-xl ${a.bg} ${a.text}`}>
          {course.icon}
        </span>
        <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-slate-400">
          STAGE 0{course.stage}
        </span>
      </div>
      <h3 className="mt-4 font-display text-lg font-bold tracking-wide text-white">{course.title}</h3>
      <p className={`text-sm ${a.text}`}>{course.subtitle}</p>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-400">{course.description}</p>
      <div className="mt-4 flex gap-3 text-xs text-slate-500">
        <span>{course.chapters.length} 章节</span>
        <span>·</span>
        <span>约 {course.totalMinutes} 分钟</span>
      </div>
      <div className="mt-3">
        <CourseProgress keys={course.chapters.map(chapterKey)} barClass={a.bar} />
      </div>
    </Link>
  );
}

export function ChapterCard({ chapter, accentKey }: { chapter: Chapter; accentKey: Course["accent"] }) {
  const a = accent[accentKey];
  return (
    <Link
      href={chapterHref(chapter)}
      className={`group glass flex flex-col rounded-2xl p-5 transition duration-300 hover:-translate-y-1 ${a.border} ${a.glow}`}
    >
      <div className="flex items-center gap-2 text-[11px]">
        <span className={`rounded px-1.5 py-0.5 font-medium ${a.bg} ${a.text}`}>{chapter.courseTitle}</span>
        <span className="text-slate-500">
          {chapter.level} · {chapter.minutes} min
        </span>
      </div>
      <h3 className="mt-3 font-semibold leading-7 text-white group-hover:text-cyan-100">{chapter.title}</h3>
      <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-slate-400">{chapter.summary}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {chapter.tags.slice(0, 3).map((t) => (
          <span key={t} className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-slate-400">
            {t}
          </span>
        ))}
      </div>
    </Link>
  );
}
