"use client";

import { motion } from "motion/react";
import { useMemo, useSyncExternalStore, type Ref } from "react";
import { easeApple } from "@/components/reveal";
import {
  formatHMS,
  getDataSnapshot,
  getStatus,
  parseData,
  subscribeData,
  subscribeStatus,
  weekKeys,
  type TimerStatus,
} from "@/lib/study-time";

/* -------- panel open/closed state (per browser session, unchanged key) -------- */

const PANEL_KEY = "neolearn-study-panel";
const PANEL_EVENT = "neolearn-study-panel";

function readPanelOpen(): boolean {
  try {
    // No record yet = first entry in this session → expanded.
    return sessionStorage.getItem(PANEL_KEY) !== "closed";
  } catch {
    return true;
  }
}

export function setTimerPanelOpen(open: boolean) {
  try {
    sessionStorage.setItem(PANEL_KEY, open ? "open" : "closed");
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(PANEL_EVENT));
}

function subscribePanel(cb: () => void) {
  window.addEventListener(PANEL_EVENT, cb);
  return () => window.removeEventListener(PANEL_EVENT, cb);
}

export function useTimerPanelOpen() {
  return useSyncExternalStore(subscribePanel, readPanelOpen, () => false);
}

export const statusText: Record<TimerStatus, string> = {
  running: "计时中",
  paused: "已暂停",
  "other-tab": "其他标签页计时中",
};

/** Today's / this week's seconds + engine status, hydration-safe. */
export function useStudyTime() {
  const snapshot = useSyncExternalStore(subscribeData, getDataSnapshot, () => "");
  const status = useSyncExternalStore(subscribeStatus, getStatus, () => "paused" as const);

  const { today, week } = useMemo(() => {
    if (!snapshot) return { today: 0, week: 0 };
    const newline = snapshot.indexOf("\n");
    const todayKey = snapshot.slice(0, newline);
    const { days } = parseData(snapshot.slice(newline + 1));
    return {
      today: days[todayKey] ?? 0,
      week: weekKeys(todayKey).reduce((sum, k) => sum + (days[k] ?? 0), 0),
    };
  }, [snapshot]);

  return { today, week, status };
}

/* -------- UI -------- */

export function TimerCard({
  id,
  onClose,
  closeRef,
  ref,
}: {
  id: string;
  onClose: () => void;
  closeRef: Ref<HTMLButtonElement>;
  ref?: Ref<HTMLElement>;
}) {
  const { today, week, status } = useStudyTime();
  const running = status === "running";

  return (
    <motion.section
      ref={ref}
      id={id}
      role="region"
      aria-label="学习时间统计"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      // Enter: fade + lift. Exit: shrink into the clock button below-left.
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.25, transition: { duration: 0.22, ease: easeApple } }}
      transition={{ duration: 0.45, ease: easeApple }}
      style={{ transformOrigin: "calc(100% - 24px) calc(100% + 36px)" }}
      className="w-[min(14.5rem,calc(100vw-2rem))] rounded-[1.25rem] border border-line bg-card/90 px-4 pb-3.5 pt-3 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.3)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted">今日学习时间</p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="收起学习时间面板（计时不会停止）"
          title="收起（计时不会停止）"
          className="-mr-1.5 grid h-7 w-7 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-fg"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Visual updates every second; screen readers get a minute-level summary instead. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <p className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-fg" aria-hidden>
          {formatHMS(today)}
        </p>
        <p role="status" className="flex shrink-0 items-center gap-1.5 text-[11px]">
          <span
            aria-hidden
            className={`h-1.5 w-1.5 rounded-full ${running ? "bg-green-500 motion-safe:animate-pulse" : "bg-muted/50"}`}
          />
          <span className={running ? "text-green-700 dark:text-green-400" : "text-muted"}>{statusText[status]}</span>
        </p>
      </div>
      <p className="sr-only">
        今日已学习 {Math.floor(today / 3600)} 小时 {Math.floor((today % 3600) / 60)} 分钟
      </p>

      <div
        className="mt-2.5 flex items-center justify-between rounded-xl bg-surface px-3 py-2"
        title="仅统计页面可见时的时长，数据保存在本地浏览器。"
      >
        <span className="text-xs text-muted">本周累计</span>
        <span className="font-mono text-xs font-medium tabular-nums text-fg">{formatHMS(week)}</span>
      </div>
      <p className="sr-only">仅统计页面可见时的时长，数据保存在本地浏览器。</p>
    </motion.section>
  );
}

export function TimerButton({
  expanded,
  controls,
  onClick,
  ref,
}: {
  expanded: boolean;
  controls?: string;
  onClick: () => void;
  ref?: Ref<HTMLButtonElement>;
}) {
  const { today, status } = useStudyTime();
  const running = status === "running";
  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      aria-expanded={expanded}
      aria-controls={controls}
      aria-label={`${expanded ? "收起" : "展开"}学习时间面板，今日已学习 ${Math.floor(today / 60)} 分钟，${statusText[status]}`}
      className="relative grid h-12 w-12 place-items-center rounded-full border border-line bg-card/90 text-fg shadow-[0_8px_24px_-8px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-colors hover:bg-surface"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span
        aria-hidden
        className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-card ${running ? "bg-green-500" : "bg-muted/50"}`}
      />
    </motion.button>
  );
}
