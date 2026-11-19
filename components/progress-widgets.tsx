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
      <div className="mb-1.5 flex justify-between text-[11px] text-slate-400">
        <span>
          已完成 {done}/{keys.length}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barClass} transition-all duration-500`}
          style={{ width: `${pct}%` }}
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
      title={done ? "已完成" : "未完成"}
      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] ${
        done
          ? "border-lime-300/70 bg-lime-300/15 text-lime-300"
          : "border-white/15 text-transparent"
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
      className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
        done
          ? "border border-lime-300/60 bg-lime-300/10 text-lime-200 hover:bg-lime-300/20"
          : "neon-btn text-white hover:brightness-110"
      }`}
    >
      {done ? "✓ 已完成（点击取消）" : "标记为已完成"}
    </button>
  );
}

export interface ChapterLite {
  key: string;
  href: string;
  title: string;
  course: string;
}

/** Homepage widget: overall progress + continue where you left off. */
export function ContinueLearning({ chapters }: { chapters: ChapterLite[] }) {
  const { completed, last } = useProgress();
  const done = chapters.filter((c) => completed.has(c.key)).length;
  const pct = Math.round((done / chapters.length) * 100);
  const lastChapter = chapters.find((c) => c.key === last);
  const nextUp = chapters.find((c) => !completed.has(c.key));
  const target = lastChapter && !completed.has(lastChapter.key) ? lastChapter : nextUp;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-4">
        <div
          className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(#ff3df2 ${pct * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
          }}
        >
          <div className="grid h-12 w-12 place-items-center rounded-full bg-[#0a0924] font-display text-sm font-bold text-white">
            {pct}%
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-slate-400">My Progress</p>
          <p className="mt-1 text-sm text-slate-200">
            已完成 <b className="text-white">{done}</b> / {chapters.length} 篇章节
          </p>
        </div>
      </div>
      {target ? (
        <Link
          href={target.href}
          className="mt-4 block rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-cyan-400/50"
        >
          <p className="text-[11px] text-cyan-300">{done === 0 ? "从这里开始" : "继续学习"} · {target.course}</p>
          <p className="mt-1 truncate text-sm font-medium text-white">{target.title}</p>
        </Link>
      ) : (
        <p className="mt-4 rounded-xl bg-lime-300/10 p-3 text-sm text-lime-200">🎉 太棒了，你已完成全部章节！</p>
      )}
    </div>
  );
}
