"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useProgress } from "@/lib/progress";

/** Thin progress bar for a set of chapter keys. */
export function CourseProgress({ keys, barClass }: { keys: string[]; barClass: string }) {
  const { completed } = useProgress();
  const done = keys.filter((k) => completed.has(k)).length;
  const pct = keys.length ? Math.round((done / keys.length) * 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-[11px] text-muted">
        <span>
          已完成 {done}/{keys.length}
        </span>
        <span>{pct}%</span>
      </div>
      <div
        className="h-1 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="课程完成度"
      >
        {/* scaleX instead of width → no layout work while animating */}
        <div
          className={`h-full origin-left rounded-full ${barClass} transition-transform duration-700 ease-[var(--ease-apple)]`}
          style={{ transform: `scaleX(${pct / 100})` }}
        />
      </div>
    </div>
  );
}

/** Small completed indicator next to a chapter. */
export function ChapterStatus({ chapterKey }: { chapterKey: string }) {
  const { completed } = useProgress();
  const done = completed.has(chapterKey);
  return (
    <span
      role="img"
      aria-label={done ? "已完成" : "未完成"}
      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] transition-colors ${
        done ? "bg-accent text-white" : "border border-line text-transparent"
      }`}
    >
      ✓
    </span>
  );
}

/** Toggle button + records last visited chapter. */
export function CompleteButton({ chapterKey }: { chapterKey: string }) {
  const { completed, toggle, visit } = useProgress();
  const done = completed.has(chapterKey);

  useEffect(() => {
    visit(chapterKey);
  }, [chapterKey, visit]);

  return (
    <button
      type="button"
      onClick={() => toggle(chapterKey)}
      aria-pressed={done}
      className={done ? "btn-secondary text-[15px]" : "btn-primary text-[15px]"}
    >
      {done ? "✓ 已完成" : "标记为已完成"}
    </button>
  );
}

export interface ChapterLite {
  key: string;
  href: string;
  title: string;
  course: string;
}

/** Overall progress + continue where you left off. */
export function ContinueLearning({ chapters }: { chapters: ChapterLite[] }) {
  const { completed, last } = useProgress();
  const done = chapters.filter((c) => completed.has(c.key)).length;
  const pct = Math.round((done / chapters.length) * 100);
  const lastChapter = chapters.find((c) => c.key === last);
  const nextUp = chapters.find((c) => !completed.has(c.key));
  const target = lastChapter && !completed.has(lastChapter.key) ? lastChapter : nextUp;
  const r = 26;
  const circ = 2 * Math.PI * r;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-5">
        <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 -rotate-90" aria-hidden>
          <circle cx="32" cy="32" r={r} fill="none" stroke="var(--line)" strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct / 100)}
            className="transition-[stroke-dashoffset] duration-700"
          />
        </svg>
        <div>
          <p className="text-3xl font-semibold tracking-tight text-fg">{pct}%</p>
          <p className="text-sm text-muted">
            已完成 {done} / {chapters.length} 篇
          </p>
        </div>
      </div>
      {target ? (
        <Link
          href={target.href}
          className="mt-5 block rounded-2xl bg-surface p-4 transition-colors hover:bg-line"
        >
          <p className="text-xs text-muted">
            {done === 0 ? "从这里开始" : "继续学习"} · {target.course}
          </p>
          <p className="mt-1 truncate font-medium text-fg">{target.title}</p>
        </Link>
      ) : (
        <p className="mt-5 rounded-2xl bg-surface p-4 text-sm text-fg">太棒了，你已完成全部章节。</p>
      )}
    </div>
  );
}
