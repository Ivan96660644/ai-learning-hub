import Link from "next/link";
import type { ReactNode } from "react";
import type { SearchHit } from "@/lib/search";

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query.split(/\s+/).filter(Boolean).map(escape);
  if (terms.length === 0) return <>{text}</>;
  const re = new RegExp(`(${terms.join("|")})`, "gi");
  const parts: ReactNode[] = text.split(re).map((part, i) =>
    i % 2 === 1 ? <mark key={i}>{part}</mark> : part,
  );
  return <>{parts}</>;
}

export function SearchResults({
  hits,
  query,
  activeIndex = -1,
  onNavigate,
}: {
  hits: SearchHit[];
  query: string;
  activeIndex?: number;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-2">
      {hits.map((hit, i) => (
        <li key={hit.doc.href}>
          <Link
            href={hit.doc.href}
            onClick={onNavigate}
            className={`block rounded-xl border px-4 py-3 transition ${
              i === activeIndex
                ? "border-fuchsia-400/60 bg-fuchsia-500/10"
                : "border-white/5 bg-white/[0.03] hover:border-cyan-400/40 hover:bg-white/[0.06]"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <span className="rounded bg-cyan-400/10 px-1.5 py-0.5 font-medium text-cyan-300">
                {hit.doc.course}
              </span>
              {hit.doc.level && <span>{hit.doc.level}</span>}
            </div>
            <p className="mt-1.5 font-medium text-white">
              <Highlight text={hit.doc.title} query={query} />
            </p>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">
              <Highlight text={hit.snippet} query={query} />
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
