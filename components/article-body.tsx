import type { ReactNode } from "react";
import { CopyButton } from "@/components/copy-button";
import type { Block } from "@/lib/types";

/** Renders **bold**, *italic* and `code` inline markers. */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  const nodes: ReactNode[] = parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`")) return <code key={i}>{p.slice(1, -1)}</code>;
    if (p.startsWith("*") && p.endsWith("*") && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
    return p;
  });
  return <>{nodes}</>;
}

const calloutStyle = {
  tip: { box: "border-lime-300/30 bg-lime-300/[0.06]", title: "text-lime-300", icon: "💡" },
  warn: { box: "border-amber-300/30 bg-amber-300/[0.06]", title: "text-amber-300", icon: "⚠️" },
  info: { box: "border-cyan-300/30 bg-cyan-300/[0.06]", title: "text-cyan-300", icon: "ℹ️" },
} as const;

export function ArticleBody({ blocks }: { blocks: Block[] }) {
  let h = 0;
  return (
    <div className="article space-y-5 text-[15.5px] leading-8 text-slate-300">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2": {
            const id = `sec-${++h}`;
            return (
              <h2
                key={i}
                id={id}
                className="group flex items-center gap-3 pt-6 text-xl font-bold text-white sm:text-2xl"
              >
                <span className="h-6 w-1 rounded-full bg-gradient-to-b from-fuchsia-400 to-cyan-400" />
                <a href={`#${id}`} className="hover:text-cyan-200">
                  {b.text}
                </a>
              </h2>
            );
          }
          case "p":
            return (
              <p key={i}>
                <Inline text={b.text} />
              </p>
            );
          case "list": {
            const Tag = b.ordered ? "ol" : "ul";
            return (
              <Tag
                key={i}
                className={`space-y-2 pl-6 ${b.ordered ? "list-decimal marker:text-fuchsia-300" : "list-disc marker:text-cyan-300"}`}
              >
                {b.items.map((it, j) => (
                  <li key={j} className="pl-1">
                    <Inline text={it} />
                  </li>
                ))}
              </Tag>
            );
          }
          case "code":
            return (
              <figure key={i} className="overflow-hidden rounded-xl border border-white/10 bg-[#04030f]/90">
                <figcaption className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2">
                  <span className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-lime-300/70" />
                  </span>
                  <span className="ml-2 truncate font-mono text-xs text-slate-400">{b.title ?? b.lang}</span>
                  <span className="ml-auto rounded bg-fuchsia-400/10 px-1.5 font-mono text-[10px] uppercase text-fuchsia-300">
                    {b.lang}
                  </span>
                  <CopyButton text={b.code} />
                </figcaption>
                <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6 text-cyan-50">
                  <code>{b.code}</code>
                </pre>
              </figure>
            );
          case "callout": {
            const s = calloutStyle[b.tone];
            return (
              <aside key={i} className={`rounded-xl border p-4 ${s.box}`}>
                {b.title && (
                  <p className={`mb-1 font-semibold ${s.title}`}>
                    {s.icon} {b.title}
                  </p>
                )}
                <p className="text-[15px] leading-7">
                  <Inline text={b.text} />
                </p>
              </aside>
            );
          }
          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="bg-white/[0.05] text-slate-200">
                    <tr>
                      {b.headers.map((th, j) => (
                        <th key={j} className="px-4 py-2.5 font-semibold">
                          {th}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, r) => (
                      <tr key={r} className="border-t border-white/5">
                        {row.map((cell, c) => (
                          <td key={c} className={`px-4 py-2.5 leading-6 ${c === 0 ? "font-medium text-white" : ""}`}>
                            <Inline text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}
