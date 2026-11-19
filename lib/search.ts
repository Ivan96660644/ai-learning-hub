import { allChapters, chapterHref, courses } from "@/lib/courses";
import type { Block } from "@/lib/types";

export interface SearchDoc {
  href: string;
  title: string;
  summary: string;
  course: string;
  level: string;
  tags: string[];
  headings: string[];
  body: string;
}

export interface SearchHit {
  doc: SearchDoc;
  score: number;
  snippet: string;
}

const stripInline = (s: string) => s.replace(/\*\*|`|\*/g, "");

function blockText(b: Block): string {
  switch (b.type) {
    case "h2":
    case "p":
      return b.text;
    case "list":
      return b.items.join(" ");
    case "code":
      return `${b.title ?? ""} ${b.code}`;
    case "callout":
      return `${b.title ?? ""} ${b.text}`;
    case "table":
      return [...b.headers, ...b.rows.flat()].join(" ");
  }
}

export const searchIndex: SearchDoc[] = [
  ...courses.map((c) => ({
    href: `/courses/${c.slug}`,
    title: `${c.title} · ${c.subtitle}`,
    summary: c.description,
    course: "课程",
    level: "",
    tags: [],
    headings: c.chapters.map((ch) => ch.title),
    body: "",
  })),
  ...allChapters.map((ch) => ({
    href: chapterHref(ch),
    title: ch.title,
    summary: ch.summary,
    course: ch.courseTitle,
    level: ch.level,
    tags: ch.tags,
    headings: ch.headings.map((h) => h.text),
    body: stripInline(ch.blocks.map(blockText).join(" ")).replace(/\s+/g, " "),
  })),
];

function count(hay: string, needle: string) {
  let n = 0;
  let i = hay.indexOf(needle);
  while (i !== -1 && n < 10) {
    n++;
    i = hay.indexOf(needle, i + needle.length);
  }
  return n;
}

function makeSnippet(doc: SearchDoc, terms: string[]) {
  const source = doc.body || doc.summary;
  const lower = source.toLowerCase();
  let pos = -1;
  for (const t of terms) {
    pos = lower.indexOf(t);
    if (pos !== -1) break;
  }
  if (pos === -1) return doc.summary;
  const start = Math.max(0, pos - 36);
  const end = Math.min(source.length, pos + 84);
  return `${start > 0 ? "…" : ""}${source.slice(start, end)}${end < source.length ? "…" : ""}`;
}

/** Local full-text search: every term must match somewhere; fields are weighted. */
export function search(query: string, docs: SearchDoc[] = searchIndex): SearchHit[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const hits: SearchHit[] = [];
  for (const doc of docs) {
    const fields = {
      title: doc.title.toLowerCase(),
      tags: doc.tags.join(" ").toLowerCase(),
      headings: doc.headings.join(" ").toLowerCase(),
      summary: `${doc.summary} ${doc.course}`.toLowerCase(),
      body: doc.body.toLowerCase(),
    };
    let score = 0;
    let all = true;
    for (const t of terms) {
      const s =
        count(fields.title, t) * 12 +
        count(fields.tags, t) * 8 +
        count(fields.headings, t) * 5 +
        count(fields.summary, t) * 3 +
        count(fields.body, t);
      if (s === 0) {
        all = false;
        break;
      }
      score += s;
    }
    if (all) hits.push({ doc, score, snippet: makeSnippet(doc, terms) });
  }
  return hits.sort((a, b) => b.score - a.score);
}

export const popularQueries = ["RAG", "Agent", "MCP", "Token", "Embedding", "评估", "Prompt Injection"];
