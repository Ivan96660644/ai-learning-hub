"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { SearchResults } from "@/components/search-results";
import { popularQueries, search } from "@/lib/search";

export function SearchView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const hits = useMemo(() => search(query), [query]);

  const update = (q: string) => {
    setQuery(q);
    const url = q.trim() ? `${pathname}?q=${encodeURIComponent(q)}` : pathname;
    router.replace(url, { scroll: false });
  };

  return (
    <div>
      <div className="glass flex items-center gap-3 rounded-2xl px-4 focus-within:border-fuchsia-400/60 focus-within:shadow-[0_0_40px_-10px_rgba(255,61,242,0.6)]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-300">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => update(e.target.value)}
          placeholder="例如：RAG、Embedding、MCP Server、幻觉"
          aria-label="搜索关键词"
          className="h-14 flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-500">热门：</span>
        {popularQueries.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => update(q)}
            className="rounded-full border border-white/10 px-3 py-1 text-slate-300 hover:border-fuchsia-400/60 hover:text-white"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {query.trim() ? (
          <>
            <p className="mb-4 text-sm text-slate-400">
              找到 <b className="text-white">{hits.length}</b> 条与「{query.trim()}」相关的结果
            </p>
            {hits.length > 0 ? (
              <SearchResults hits={hits} query={query} />
            ) : (
              <div className="glass rounded-2xl p-8 text-center text-slate-400">
                没有匹配的内容。试试更短的关键词，或使用英文术语如 Agent、Token。
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-500">输入关键词开始搜索，也可以在任意页面按 ⌘K / Ctrl+K 快速搜索。</p>
        )}
      </div>
    </div>
  );
}
