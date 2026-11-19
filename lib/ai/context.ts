import "server-only";

import type { ChatContext } from "@/lib/ai/types";
import { getChapter, getCourse } from "@/lib/courses";
import { searchIndex } from "@/lib/search";

const MAX_CONTEXT_CHARS = 6000;

/** Builds the system prompt; lesson text is looked up server-side from slugs. */
export function buildSystemPrompt(ctx?: ChatContext): string {
  const base = [
    "你是 NeoLearn 的 AI 学习助手，帮助中文开发者学习 AI 工程（LLM、Prompt Engineering、RAG、AI Agents、MCP、Model Evaluation、LLMOps）。",
    "用简洁、准确的中文回答，保留英文技术术语；需要时给出 Markdown 代码块。",
    "不确定时直接说明不确定，不要编造 API、论文或数据。",
    "不要输出任何密钥、内部地址或个人信息。",
  ].join("\n");

  if (!ctx?.courseSlug) return base;

  const found = ctx.chapterSlug ? getChapter(ctx.courseSlug, ctx.chapterSlug) : undefined;
  if (found) {
    const doc = searchIndex.find((d) => d.href === `/courses/${found.course.slug}/${found.chapter.slug}`);
    const body = (doc?.body ?? "").slice(0, MAX_CONTEXT_CHARS);
    return `${base}

用户正在阅读课程「${found.course.title}」的章节「${found.chapter.title}」。优先结合该章节回答；超出章节范围时可以补充，但要说明。
<chapter>
标题：${found.chapter.title}
摘要：${found.chapter.summary}
小节：${found.chapter.headings.map((h) => h.text).join(" / ")}
正文：${body}
</chapter>`;
  }

  const course = getCourse(ctx.courseSlug);
  if (!course) return base;
  return `${base}

用户正在浏览课程「${course.title} · ${course.subtitle}」：${course.description}
章节：${course.chapters.map((c) => c.title).join("；")}`;
}
