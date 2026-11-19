import type { ReactNode } from "react";
import { CodeBlock } from "@/components/code-block";

/**
 * Minimal, safe Markdown renderer for assistant replies.
 * Supports headings, paragraphs, lists, blockquotes, fenced code, inline code,
 * bold/italic and links. Raw HTML is never interpreted (React escapes text).
 */

type MdBlock =
  | { t: "code"; lang: string; code: string }
  | { t: "h"; level: number; text: string }
  | { t: "ul" | "ol"; items: string[] }
  | { t: "quote"; text: string }
  | { t: "p"; text: string };

function parse(src: string): MdBlock[] {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const blocks: MdBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    const fence = line.match(/^\s*```\s*([\w+#.-]*)\s*$/);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) body.push(lines[i++]);
      i++; // closing fence (or EOF while streaming / truncated)
      blocks.push({ t: "code", lang: fence[1] || "text", code: body.join("\n") });
      continue;
    }

    if (!line.trim()) {
      i++;
      continue;
    }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      blocks.push({ t: "h", level: h[1].length, text: h[2] });
      i++;
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line) || /^\s*\d+[.)]\s+/.test(line)) {
      const ordered = /^\s*\d+[.)]\s+/.test(line);
      const re = ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-*+]\s+/;
      const items: string[] = [];
      while (i < lines.length && re.test(lines[i])) items.push(lines[i++].replace(re, ""));
      blocks.push({ t: ordered ? "ol" : "ul", items });
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const body: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) body.push(lines[i++].replace(/^\s*>\s?/, ""));
      blocks.push({ t: "quote", text: body.join(" ") });
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*```/.test(lines[i]) &&
      !/^(#{1,4})\s+/.test(lines[i]) &&
      !/^\s*([-*+]|\d+[.)])\s+/.test(lines[i]) &&
      !/^\s*>/.test(lines[i])
    ) {
      para.push(lines[i++]);
    }
    blocks.push({ t: "p", text: para.join("\n") });
  }
  return blocks;
}

const safeHref = (url: string) => (/^(https?:\/\/|\/(?!\/))/i.test(url) ? url : null);

function inline(text: string): ReactNode[] {
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)\s]+\))/g;
  return text.split(re).map((p, i) => {
    if (!p) return null;
    if (p.startsWith("`") && p.endsWith("`") && p.length > 1) return <code key={i}>{p.slice(1, -1)}</code>;
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("*") && p.endsWith("*") && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
    const link = p.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const href = safeHref(link[2]);
      if (!href) return link[1];
      const external = href.startsWith("http");
      return (
        <a
          key={i}
          href={href}
          className="text-accent underline underline-offset-2"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {link[1]}
        </a>
      );
    }
    return p;
  });
}

export function Markdown({ source }: { source: string }) {
  return (
    <div className="md space-y-3 text-[15px] leading-7">
      {parse(source).map((b, i) => {
        switch (b.t) {
          case "code":
            return <CodeBlock key={i} code={b.code} lang={b.lang} />;
          case "h":
            return (
              <p key={i} className={`font-semibold text-fg ${b.level <= 2 ? "text-[17px]" : ""}`}>
                {inline(b.text)}
              </p>
            );
          case "ul":
          case "ol": {
            const Tag = b.t;
            return (
              <Tag key={i} className={`space-y-1 pl-5 ${b.t === "ol" ? "list-decimal" : "list-disc"}`}>
                {b.items.map((it, j) => (
                  <li key={j}>{inline(it)}</li>
                ))}
              </Tag>
            );
          }
          case "quote":
            return (
              <blockquote key={i} className="border-l-2 border-line pl-3 text-muted">
                {inline(b.text)}
              </blockquote>
            );
          default:
            return (
              <p key={i} className="whitespace-pre-wrap">
                {inline(b.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
