import type { ReactNode } from "react";
import { CodeBlock } from "@/components/code-block";
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
  tip: { box: "bg-green-500/[0.07]", title: "text-green-700 dark:text-green-400", label: "提示" },
  warn: { box: "bg-orange-500/[0.08]", title: "text-orange-700 dark:text-orange-400", label: "注意" },
  info: { box: "bg-sky-500/[0.08]", title: "text-sky-700 dark:text-sky-400", label: "说明" },
} as const;

export function ArticleBody({ blocks }: { blocks: Block[] }) {
  let h = 0;
  return (
    <div className="article space-y-6 text-[17px] leading-[1.8] text-fg/85">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2": {
            const id = `sec-${++h}`;
            return (
              <h2 key={i} id={id} className="pt-8 text-2xl font-semibold tracking-tight text-fg sm:text-[28px]">
                <a href={`#${id}`} className="hover:text-accent">
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
                className={`space-y-2 pl-6 marker:text-muted ${b.ordered ? "list-decimal" : "list-disc"}`}
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
            return <CodeBlock key={i} code={b.code} lang={b.lang} title={b.title} />;
          case "callout": {
            const s = calloutStyle[b.tone];
            return (
              <aside key={i} className={`rounded-2xl p-5 ${s.box}`} aria-label={b.title ?? s.label}>
                <p className={`mb-1 text-sm font-semibold ${s.title}`}>{b.title ?? s.label}</p>
                <p className="text-[16px] leading-7">
                  <Inline text={b.text} />
                </p>
              </aside>
            );
          }
          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-2xl border border-line">
                <table className="w-full min-w-[480px] text-left text-[15px]">
                  <thead className="bg-surface text-fg">
                    <tr>
                      {b.headers.map((th, j) => (
                        <th key={j} scope="col" className="px-4 py-3 font-semibold">
                          {th}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, r) => (
                      <tr key={r} className="border-t border-line">
                        {row.map((cell, c) => (
                          <td key={c} className={`px-4 py-3 leading-6 ${c === 0 ? "font-medium text-fg" : ""}`}>
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
