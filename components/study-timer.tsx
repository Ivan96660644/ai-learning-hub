"use client";

import { useEffect, useId, useMemo, useRef, useSyncExternalStore } from "react";
import {
  formatHMS,
  getDataSnapshot,
  getStatus,
  parseData,
  startStudyTimer,
  subscribeData,
  subscribeStatus,
  weekKeys,
  type TimerStatus,
} from "@/lib/study-time";

/* -------- panel open/closed state (per browser session) -------- */

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

function setPanelOpen(open: boolean) {
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

const noopSubscribe = () => () => {};

const statusText: Record<TimerStatus, string> = {
  running: "计时中",
  paused: "已暂停",
  "other-tab": "其他标签页计时中",
};

/* -------- component -------- */

export function StudyTimer() {
  // Client-only rendering without hydration mismatch: server snapshot is `false`.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const snapshot = useSyncExternalStore(subscribeData, getDataSnapshot, () => "");
  const status = useSyncExternalStore(subscribeStatus, getStatus, () => "paused" as const);
  const open = useSyncExternalStore(subscribePanel, readPanelOpen, () => false);

  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const userToggled = useRef(false);

  // Start the single tracking engine for this tab.
  useEffect(() => startStudyTimer(), []);

  // Move focus only after a user action (never steal focus on auto-open).
  useEffect(() => {
    if (!userToggled.current) return;
    userToggled.current = false;
    (open ? closeRef : toggleRef).current?.focus();
  }, [open]);

  // Let CSS reserve space on small screens so the widget never hides page-end buttons.
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.dataset.studyTimer = open ? "open" : "closed";
    return () => {
      delete root.dataset.studyTimer;
    };
  }, [mounted, open]);

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

  if (!mounted) return null;

  const toggle = (next: boolean) => {
    userToggled.current = true;
    setPanelOpen(next);
  };

  const running = status === "running";
  const todayMinutes = Math.floor(today / 60);

  return (
    <div className="study-timer fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 flex flex-col items-end gap-3 print:hidden">
      {open && (
        <section
          id={panelId}
          role="region"
          aria-label="学习时间统计"
          onKeyDown={(e) => {
            if (e.key === "Escape") toggle(false);
          }}
          className="glass w-[min(17rem,calc(100vw-2rem))] rounded-2xl bg-[#0b0a24]/85 p-4 shadow-[0_0_40px_-10px_rgba(139,92,246,0.75)] motion-safe:animate-[study-pop_.25s_ease-out]"
        >
          <div className="flex items-center justify-between">
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-fuchsia-300">
              Study Time
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={() => toggle(false)}
              aria-label="收起学习时间面板（计时不会停止）"
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <p className="mt-1 text-xs text-slate-400">今日浏览时间</p>
          {/* Visually updates every second; screen readers get the minute-level label instead of per-second noise. */}
          <p className="font-mono text-3xl font-bold tabular-nums tracking-wider text-white" aria-hidden>
            <span className="neon-text">{formatHMS(today)}</span>
          </p>
          <p className="sr-only">
            今日已学习 {Math.floor(today / 3600)} 小时 {Math.floor((today % 3600) / 60)} 分钟
          </p>

          <p role="status" className="mt-2 flex items-center gap-2 text-xs">
            <span
              aria-hidden
              className={`h-2 w-2 rounded-full ${
                running ? "bg-lime-300 shadow-[0_0_8px_rgba(190,242,100,0.9)] motion-safe:animate-pulse" : "bg-slate-500"
              }`}
            />
            <span className={running ? "text-lime-200" : "text-slate-400"}>{statusText[status]}</span>
          </p>

          <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <span className="text-xs text-slate-400">本周累计</span>
            <span className="font-mono text-sm font-semibold tabular-nums text-cyan-200">{formatHMS(week)}</span>
          </div>
          <p className="mt-2 text-[10px] leading-4 text-slate-500">仅统计页面可见时的时长，数据保存在本地浏览器。</p>
        </section>
      )}

      <button
        ref={toggleRef}
        type="button"
        onClick={() => toggle(!open)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={`${open ? "收起" : "展开"}学习时间面板，今日已学习 ${todayMinutes} 分钟，${statusText[status]}`}
        className="relative grid h-12 w-12 place-items-center rounded-full border border-violet-400/50 bg-[#0b0a24]/90 text-cyan-200 shadow-[0_0_24px_-4px_rgba(139,92,246,0.8)] backdrop-blur-md transition hover:scale-105 hover:border-cyan-300/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span
          aria-hidden
          className={`absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-[#0b0a24] ${
            running ? "bg-lime-300" : "bg-slate-500"
          }`}
        />
      </button>
    </div>
  );
}
