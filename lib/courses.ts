import { aiAgents } from "@/content/ai-agents";
import { llmFundamentals } from "@/content/llm-fundamentals";
import { llmops } from "@/content/llmops";
import { mcp } from "@/content/mcp";
import { modelEvaluation } from "@/content/model-evaluation";
import { promptEngineering } from "@/content/prompt-engineering";
import { rag } from "@/content/rag";
import type { Chapter, Course, CourseInput } from "@/lib/types";

const inputs: CourseInput[] = [
  llmFundamentals,
  promptEngineering,
  rag,
  aiAgents,
  mcp,
  modelEvaluation,
  llmops,
];

let order = 0;
export const courses: Course[] = inputs.map(({ chapters, ...course }) => {
  const normalized: Chapter[] = chapters.map((ch) => {
    let n = 0;
    const headings = ch.blocks.flatMap((b) =>
      b.type === "h2" ? [{ id: `sec-${++n}`, text: b.text }] : [],
    );
    return {
      ...ch,
      courseSlug: course.slug,
      courseTitle: course.title,
      headings,
      order: order++,
    };
  });
  return {
    ...course,
    chapters: normalized,
    totalMinutes: normalized.reduce((s, c) => s + c.minutes, 0),
  };
});

export const allChapters: Chapter[] = courses.flatMap((c) => c.chapters);

export const chapterKey = (c: Pick<Chapter, "courseSlug" | "slug">) =>
  `${c.courseSlug}/${c.slug}`;

export const chapterHref = (c: Pick<Chapter, "courseSlug" | "slug">) =>
  `/courses/${c.courseSlug}/${c.slug}`;

export function getCourse(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getChapter(courseSlug: string, chapterSlug: string) {
  const course = getCourse(courseSlug);
  const chapter = course?.chapters.find((c) => c.slug === chapterSlug);
  if (!course || !chapter) return undefined;
  return {
    course,
    chapter,
    prev: allChapters[chapter.order - 1],
    next: allChapters[chapter.order + 1],
  };
}

export const featuredChapters = allChapters.filter((c) => c.featured);

export const learningPath = [
  {
    stage: 1,
    title: "打好基础",
    en: "Foundations",
    desc: "理解 LLM 如何工作，学会与模型高效沟通。",
  },
  {
    stage: 2,
    title: "连接知识",
    en: "Knowledge",
    desc: "用 RAG 让模型基于你的私有数据回答问题。",
  },
  {
    stage: 3,
    title: "构建智能体",
    en: "Agents",
    desc: "让模型调用工具、自主完成多步骤任务。",
  },
  {
    stage: 4,
    title: "走向生产",
    en: "Production",
    desc: "评估质量、监控成本，把 Demo 变成产品。",
  },
] as const;
