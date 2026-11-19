"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { easeApple } from "@/components/reveal";
import { SearchResults } from "@/components/search-results";

type SearchModule = typeof import("@/lib/search");

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [mod, setMod] = useState<SearchModule | null>(null);

  const show = useCallback(() => {
    setOpen(true);
    // Load the content index lazily so it stays out of the initial bundle.
    import("@/lib/search").then(setMod);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) close();
        else show();
      } else if (e.key === "Escape" && open) {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, show, close]);

  const hits = useMemo(() => (mod ? mod.search(query).slice(0, 8) : []), [mod, query]);

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      const target = hits[active];
      if (target) router.push(target.doc.href);
      else if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      close();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-label="搜索文章（⌘K）"
        className="flex h-8 items-center gap-2 rounded-full px-2.5 text-[13px] text-muted transition-colors hover:bg-surface hover:text-fg"
      >
        <SearchIcon />
        <span className="hidden lg:inline">搜索</span>
        <kbd className="hidden rounded-md border border-line px-1.5 font-sans text-[10px] lg:inline">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/25 px-4 pt-[12vh] backdrop-blur-sm dark:bg-black/50"
            onClick={close}
            role="presentation"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="搜索文章"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.3, ease: easeApple }}
              className="w-full max-w-xl overflow-hidden rounded-3xl border border-line bg-card shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b border-line px-5">
                <SearchIcon />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onInputKey}
                  role="combobox"
                  aria-expanded={hits.length > 0}
                  aria-controls="search-dialog-list"
                  aria-activedescendant={hits.length ? `search-dialog-${active}` : undefined}
                  aria-label="搜索关键词"
                  placeholder="搜索课程、章节、术语"
                  className="h-14 flex-1 bg-transparent text-[17px] text-fg outline-none placeholder:text-muted"
                />
                <kbd className="rounded-md border border-line px-1.5 text-[10px] text-muted">esc</kbd>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {!mod ? (
                  <p className="p-6 text-center text-sm text-muted">正在加载索引…</p>
                ) : !query.trim() ? (
                  <div className="p-3">
                    <p className="mb-3 text-xs font-medium text-muted">快速链接</p>
                    <div className="flex flex-wrap gap-2">
                      {mod.popularQueries.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setQuery(q)}
                          className="rounded-full bg-surface px-3 py-1.5 text-sm text-fg transition-colors hover:bg-line"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : hits.length === 0 ? (
                  <p className="p-8 text-center text-sm text-muted">没有找到与「{query}」相关的内容。</p>
                ) : (
                  <SearchResults
                    hits={hits}
                    query={query}
                    activeIndex={active}
                    onNavigate={close}
                    idPrefix="search-dialog"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
