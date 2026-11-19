"use client";

import { useSyncExternalStore } from "react";

export const THEME_KEY = "neolearn-theme";

/** Runs in <head> before first paint: applies a saved theme without flashing. */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

type Theme = "light" | "dark";

function subscribe(cb: () => void) {
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const getTheme = (): Theme =>
  document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";

export function ThemeToggle() {
  // Server snapshot = light (the default rendered theme) → no hydration mismatch.
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light" as const);
  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => {
        document.documentElement.setAttribute("data-theme", next);
        try {
          localStorage.setItem(THEME_KEY, next);
        } catch {
          // storage disabled — theme still applies for this page view
        }
      }}
      aria-label={next === "dark" ? "切换到深色模式" : "切换到浅色模式"}
      title={next === "dark" ? "深色模式" : "浅色模式"}
      className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-fg"
    >
      {theme === "dark" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
