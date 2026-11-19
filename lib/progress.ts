"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const KEY = "ai-hub-progress-v1";
const EVENT = "ai-hub-progress";

export interface ProgressState {
  completed: string[];
  last?: string;
}

const EMPTY = "";

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? EMPTY;
  } catch {
    return EMPTY;
  }
}

function parse(raw: string): ProgressState {
  if (!raw) return { completed: [] };
  try {
    const data = JSON.parse(raw) as Partial<ProgressState>;
    return {
      completed: Array.isArray(data.completed) ? data.completed : [],
      last: typeof data.last === "string" ? data.last : undefined,
    };
  } catch {
    return { completed: [] };
  }
}

function write(state: ProgressState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage full or disabled — ignore
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

/** Learning progress persisted in localStorage, safe for SSR/hydration. */
export function useProgress() {
  const raw = useSyncExternalStore(subscribe, read, () => EMPTY);
  const state = useMemo(() => parse(raw), [raw]);
  const completed = useMemo(() => new Set(state.completed), [state.completed]);

  const toggle = useCallback((key: string) => {
    const cur = parse(read());
    const set = new Set(cur.completed);
    if (set.has(key)) set.delete(key);
    else set.add(key);
    write({ ...cur, completed: [...set] });
  }, []);

  const visit = useCallback((key: string) => {
    const cur = parse(read());
    if (cur.last !== key) write({ ...cur, last: key });
  }, []);

  const reset = useCallback(() => write({ completed: [] }), []);

  return { completed, last: state.last, toggle, visit, reset };
}
