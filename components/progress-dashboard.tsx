"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";

interface CourseData {
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  text: string;
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
          ["累计学习", `${minutes} 分钟`],
        ].map(([label, value]) => (
          <div key={label} className="glass rounded-2xl p-5">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="mt-2 font-display text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {courses.map((c) => {
          const n = c.chapters.filter((ch) => completed.has(ch.key)).length;
          const p = Math.round((n / c.chapters.length) * 100);
          return (
            <section key={c.slug} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-xl ${c.text}`}>{c.icon}</span>
                <Link href={`/courses/${c.slug}`} className="font-display font-bold tracking-wide text-white hover:text-cyan-200">
                  {c.title}
                </Link>
                <span className="text-sm text-slate-500">{c.subtitle}</span>
                <span className="ml-auto text-sm text-slate-300">{p}%</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className={`h-full rounded-full bg-gradient-to-r ${c.bar} transition-all`} style={{ width: `${p}%` }} />
              </div>
              <ul className="mt-3 space-y-1">
                {c.chapters.map((ch) => {
                  const isDone = completed.has(ch.key);
                  return (
                    <li key={ch.key} className="flex items-center gap-3 rounded-lg px-1 py-1.5">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggle(ch.key)}
                        aria-label={`标记 ${ch.title}`}
                        className="h-4 w-4 shrink-0 accent-fuchsia-500"
                      />
                      <Link
                        href={ch.href}
                        className={`text-sm hover:text-cyan-200 ${isDone ? "text-slate-500 line-through" : "text-slate-300"}`}
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
            if (window.confirm("确定要清空所有学习进度吗？")) reset();
          }}
          className="rounded-xl border border-rose-400/40 px-4 py-2 text-sm text-rose-300 hover:bg-rose-400/10"
        >
          重置学习进度
        </button>
      )}
    </div>
  );
}
