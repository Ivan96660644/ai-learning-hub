"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
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
        className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-400 transition hover:border-cyan-400/50 hover:text-slate-200 sm:w-56"
      >
        <SearchIcon />
        <span className="hidden sm:inline">搜索文章…</span>
        <kbd className="ml-auto hidden rounded border border-white/10 px-1.5 font-mono text-[10px] text-slate-500 sm:inline">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[10vh] backdrop-blur-sm"
          onClick={close}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="搜索文章"
            className="glass w-full max-w-xl overflow-hidden rounded-2xl bg-[#0b0a24]/90 shadow-[0_0_60px_-10px_rgba(255,61,242,0.45)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <SearchIcon />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKey}
                placeholder="搜索课程、章节、术语，例如 RAG、Token、MCP"
                className="h-14 flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
              />
              <kbd className="rounded border border-white/10 px-1.5 font-mono text-[10px] text-slate-500">
                ESC
              </kbd>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-3">
              {!mod ? (
                <p className="p-4 text-center text-sm text-slate-500">正在加载索引…</p>
              ) : !query.trim() ? (
                <div className="p-2">
                  <p className="mb-2 text-xs text-slate-500">热门搜索</p>
                  <div className="flex flex-wrap gap-2">
                    {mod.popularQueries.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuery(q)}
                        className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300 hover:border-fuchsia-400/60 hover:text-white"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : hits.length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-400">
                  没有找到与「{query}」相关的内容，换个关键词试试？
                </p>
              ) : (
                <SearchResults hits={hits} query={query} activeIndex={active} onNavigate={close} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-cyan-300">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
