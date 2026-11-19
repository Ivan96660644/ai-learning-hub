import { CopyButton } from "@/components/copy-button";
import { highlight } from "@/lib/highlight";

const cls = { kw: "tok-kw", str: "tok-str", num: "tok-num", com: "tok-com", fn: "tok-fn", plain: "" } as const;

export function CodeBlock({ code, lang, title }: { code: string; lang: string; title?: string }) {
  const tokens = highlight(code, lang);
  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-surface">
      <figcaption className="flex items-center gap-3 border-b border-line px-4 py-2">
        <span className="truncate font-mono text-xs text-muted">{title ?? lang}</span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted">{lang}</span>
        <CopyButton text={code} />
      </figcaption>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6 text-fg">
        <code>
          {tokens.map((t, i) =>
            t.type === "plain" ? (
              t.text
            ) : (
              <span key={i} className={cls[t.type]}>
                {t.text}
              </span>
            ),
          )}
        </code>
      </pre>
    </figure>
  );
}
