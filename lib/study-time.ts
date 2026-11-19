"use client";

/**
 * Study-time tracker.
 *
 * - Counts only while this tab is visible (document.visibilityState === "visible").
 * - Stores whole seconds per *local* date in localStorage, keeping history.
 * - Multiple tabs: a lease lock in localStorage lets exactly one visible tab count.
 *   A tab must hold the lock for one full tick before it starts counting, so two
 *   tabs racing for the lock cannot both add time.
 */

export const DATA_KEY = "neolearn-study-time-v1";
const LOCK_KEY = "neolearn-study-time-lock";
const CHANGE_EVENT = "neolearn-study-time";
const TICK_MS = 1000;
const LOCK_TTL_MS = 4000;
/** Ignore gaps longer than this (sleep, throttled timers). */
const MAX_TICK_GAP_MS = 5000;
const MAX_HISTORY_DAYS = 400;

export type TimerStatus = "running" | "paused" | "other-tab";

export interface StudyData {
  days: Record<string, number>;
}

/* ---------------- date helpers ---------------- */

export function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Local date keys from this week's Monday up to and including `todayKey`. */
export function weekKeys(todayKey: string): string[] {
  const [y, m, d] = todayKey.split("-").map(Number);
  const today = new Date(y, m - 1, d);
  const sinceMonday = (today.getDay() + 6) % 7;
  return Array.from({ length: sinceMonday + 1 }, (_, i) =>
    localDateKey(new Date(y, m - 1, d - sinceMonday + i)),
  );
}

export function formatHMS(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
}

/* ---------------- storage ---------------- */

export function parseData(raw: string | null): StudyData {
  if (!raw) return { days: {} };
  try {
    const parsed = JSON.parse(raw) as { days?: unknown };
    const days: Record<string, number> = {};
    if (parsed.days && typeof parsed.days === "object") {
      for (const [k, v] of Object.entries(parsed.days as Record<string, unknown>)) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(k) && typeof v === "number" && Number.isFinite(v) && v >= 0) {
          days[k] = Math.floor(v);
        }
      }
    }
    return { days };
  } catch {
    return { days: {} };
  }
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // quota exceeded / storage disabled — ignore
  }
}

function addSeconds(seconds: number) {
  const data = parseData(safeGet(DATA_KEY));
  const key = localDateKey();
  data.days[key] = (data.days[key] ?? 0) + seconds;

  const keys = Object.keys(data.days).sort();
  for (const old of keys.slice(0, Math.max(0, keys.length - MAX_HISTORY_DAYS))) {
    delete data.days[old];
  }
  safeSet(DATA_KEY, JSON.stringify(data));
}

interface Lock {
  id: string;
  ts: number;
}

function readLock(): Lock | null {
  try {
    const lock = JSON.parse(safeGet(LOCK_KEY) ?? "null") as Lock | null;
    return lock && typeof lock.id === "string" && typeof lock.ts === "number" ? lock : null;
  } catch {
    return null;
  }
}

/* ---------------- status store (for UI) ---------------- */

let status: TimerStatus = "paused";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function setStatus(next: TimerStatus) {
  if (status !== next) {
    status = next;
    emit();
  }
}

export function getStatus(): TimerStatus {
  return status;
}

export function subscribeStatus(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Fires when stored data changes in this tab or another tab. */
export function subscribeData(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === DATA_KEY || e.key === null) cb();
  };
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** Snapshot = today's date key + raw JSON, so a date rollover also changes it. */
export function getDataSnapshot(): string {
  return `${localDateKey()}\n${safeGet(DATA_KEY) ?? ""}`;
}

/* ---------------- engine ---------------- */

let activeEngine: (() => void) | null = null;

/** Starts the tracker; returns a cleanup function. Safe to call more than once. */
export function startStudyTimer(): () => void {
  activeEngine?.(); // never run two engines in one tab

  const tabId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  let owned = false;
  let carryMs = 0;
  let last = performance.now();

  const isVisible = () => document.visibilityState === "visible";

  const release = () => {
    if (readLock()?.id === tabId) {
      try {
        localStorage.removeItem(LOCK_KEY);
      } catch {
        // ignore
      }
    }
    owned = false;
  };

  /** Adds elapsed visible time (only when we already own the lock). */
  const accumulate = (elapsedMs: number) => {
    if (!owned) return;
    carryMs += Math.min(Math.max(elapsedMs, 0), MAX_TICK_GAP_MS);
    const whole = Math.floor(carryMs / 1000);
    if (whole > 0) {
      carryMs -= whole * 1000;
      addSeconds(whole);
      emit();
    }
  };

  const tick = () => {
    const now = performance.now();
    const elapsed = now - last;
    last = now;

    if (!isVisible()) {
      release();
      setStatus("paused");
      return;
    }

    const lock = readLock();
    const wall = Date.now();
    const heldByOther = lock && lock.id !== tabId && wall - lock.ts < LOCK_TTL_MS;
    if (heldByOther) {
      owned = false;
      carryMs = 0;
      setStatus("other-tab");
      return;
    }

    // We hold (or may take) the lease. Count only if we already held it last tick.
    const stillOwner = owned && lock?.id === tabId;
    if (stillOwner) accumulate(elapsed);
    else carryMs = 0;

    safeSet(LOCK_KEY, JSON.stringify({ id: tabId, ts: wall }));
    owned = true;
    setStatus("running");
  };

  const onVisibility = () => {
    if (isVisible()) {
      last = performance.now();
      tick();
    } else {
      accumulate(performance.now() - last); // flush time up to the moment we got hidden
      last = performance.now();
      release();
      setStatus("paused");
    }
  };

  const onPageHide = () => {
    if (isVisible()) accumulate(performance.now() - last);
    last = performance.now();
    release();
    setStatus("paused");
  };

  const interval = window.setInterval(tick, TICK_MS);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", onPageHide);
  tick();

  const stop = () => {
    window.clearInterval(interval);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", onPageHide);
    release();
    setStatus("paused");
    if (activeEngine === stop) activeEngine = null;
  };
  activeEngine = stop;
  return stop;
}
