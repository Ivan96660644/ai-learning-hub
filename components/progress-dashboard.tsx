"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";

interface CourseData {
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  text: string;
  tint: string;
  bar: string;
  chapters: { key: string; href: string; title: string; minutes: number }[];
}

export function ProgressDashboard({ courses }: { courses: CourseData[] }) {
  const { completed, toggle, reset } = useProgress();
  const all = courses.flatMap((c) => c.chapters);
  const done = all.filter((c) => completed.has(c.key));
  const pct = Math.round((done.length / all.length) * 100);
  const minutes = done.reduce((s, c) => s + c.minutes, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["总体进度", `${pct}%`],
          ["已完成章节", `${done.length} / ${all.length}`],
          ["预计已学", `${minutes} 分钟`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl bg-surface p-6">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-fg">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((c) => {
          const n = c.chapters.filter((ch) => completed.has(ch.key)).length;
          const p = Math.round((n / c.chapters.length) * 100);
          return (
            <section key={c.slug} className="card p-6" aria-labelledby={`p-${c.slug}`}>
              <div className="flex items-center gap-3">
                <span className={`grid h-9 w-9 place-items-center rounded-xl ${c.tint} ${c.text}`} aria-hidden>
                  {c.icon}
                </span>
                <div className="min-w-0">
                  <Link id={`p-${c.slug}`} href={`/courses/${c.slug}`} className="font-semibold text-fg hover:text-accent">
                    {c.title}
                  </Link>
                  <p className="text-xs text-muted">{c.subtitle}</p>
                </div>
                <span className="ml-auto text-sm font-medium text-fg">{p}%</span>
              </div>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-line">
                <div
                  className={`h-full origin-left rounded-full ${c.bar} transition-transform duration-700`}
                  style={{ transform: `scaleX(${p / 100})` }}
                />
              </div>
              <ul className="mt-4 space-y-1">
                {c.chapters.map((ch) => {
                  const isDone = completed.has(ch.key);
                  return (
                    <li key={ch.key} className="flex items-center gap-3 py-1.5">
                      <input
                        id={`cb-${ch.key}`}
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggle(ch.key)}
                        className="h-4 w-4 shrink-0 accent-[var(--accent)]"
                      />
                      <label htmlFor={`cb-${ch.key}`} className="sr-only">
                        标记「{ch.title}」为{isDone ? "未完成" : "已完成"}
                      </label>
                      <Link
                        href={ch.href}
                        className={`text-sm hover:text-accent ${isDone ? "text-muted line-through" : "text-fg"}`}
                      >
                        {ch.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {done.length > 0 && (
        <button
          type="button"
          onClick={() => {
            if (window.confirm("确定要清空所有课程完成记录吗？（浏览时长统计不受影响）")) reset();
          }}
          className="text-sm text-red-600 hover:underline dark:text-red-400"
        >
          重置课程进度
        </button>
      )}
    </div>
  );
}
