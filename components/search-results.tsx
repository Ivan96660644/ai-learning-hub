import Link from "next/link";
import type { ReactNode } from "react";
import type { SearchHit } from "@/lib/search";

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query.split(/\s+/).filter(Boolean).map(escape);
  if (terms.length === 0) return <>{text}</>;
  const re = new RegExp(`(${terms.join("|")})`, "gi");
  const parts: ReactNode[] = text.split(re).map((part, i) => (i % 2 === 1 ? <mark key={i}>{part}</mark> : part));
  return <>{parts}</>;
}

export function SearchResults({
  hits,
  query,
  activeIndex = -1,
  onNavigate,
  idPrefix,
}: {
  hits: SearchHit[];
  query: string;
  activeIndex?: number;
  onNavigate?: () => void;
  idPrefix?: string;
}) {
  return (
    <ul className="space-y-1" role={idPrefix ? "listbox" : undefined} id={idPrefix ? `${idPrefix}-list` : undefined}>
      {hits.map((hit, i) => (
        <li
          key={hit.doc.href}
          id={idPrefix ? `${idPrefix}-${i}` : undefined}
          role={idPrefix ? "option" : undefined}
          aria-selected={idPrefix ? i === activeIndex : undefined}
        >
          <Link
            href={hit.doc.href}
            onClick={onNavigate}
            className={`block rounded-2xl px-4 py-3 transition-colors ${
              i === activeIndex ? "bg-surface" : "hover:bg-surface"
            }`}
          >
            <p className="text-xs text-muted">
              {hit.doc.course}
              {hit.doc.level && ` · ${hit.doc.level}`}
            </p>
            <p className="mt-0.5 font-medium text-fg">
              <Highlight text={hit.doc.title} query={query} />
            </p>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
              <Highlight text={hit.snippet} query={query} />
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
