import Link from "next/link";
import type { CSSProperties } from "react";
import { ChapterCard, CourseCard } from "@/components/cards";
import { CodeBlock } from "@/components/code-block";
import { ContinueLearning } from "@/components/progress-widgets";
import { Reveal } from "@/components/reveal";
import { RoadmapStory } from "@/components/roadmap-story";
import { accent } from "@/lib/accent";
import { allChapters, chapterHref, chapterKey, courses, featuredChapters, learningPath } from "@/lib/courses";

const d = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

const heroCode = `while not task.done:
    thought = llm.think(context)
    result = tools.call(thought)
    context.append(result)`;

export default function Home() {
  const totalMinutes = courses.reduce((s, c) => s + c.totalMinutes, 0);
  const lite = allChapters.map((c) => ({
    key: chapterKey(c),
    href: chapterHref(c),
    title: c.title,
    course: c.courseTitle,
  }));
  const accentOf = (slug: string) => courses.find((c) => c.slug === slug)!.accent;

  const steps = learningPath.map((step) => ({
    ...step,
    courses: courses
      .filter((c) => c.stage === step.stage)
      .map((c) => ({
        slug: c.slug,
        title: c.title,
        subtitle: c.subtitle,
        icon: c.icon,
        text: accent[c.accent].text,
        tint: accent[c.accent].tint,
      })),
  }));

  return (
    <>
      {/* Hero — CSS entrance animation, visible even before hydration */}
      <section className="container-x pb-16 pt-20 text-center sm:pb-24 sm:pt-28">
        <p className="hero-in text-[17px] font-semibold text-accent sm:text-xl" style={d(0)}>
          AI Engineering · 中文入门
        </p>
        <h1
          className="hero-in mx-auto mt-3 max-w-4xl text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] text-fg sm:text-6xl lg:text-[4.25rem]"
          style={d(120)}
        >
          {/* Each phrase stays intact; the line may only break after the comma. */}
          <span className="inline-block">AI 工程，</span>
          <span className="inline-block">从这里开始。</span>
        </h1>
        <p
          className="hero-in mx-auto mt-6 max-w-2xl text-[17px] leading-8 text-muted sm:text-xl sm:leading-9"
          style={d(260)}
        >
          从 LLM 原理到生产运维，一条清晰的路线、{allChapters.length} 篇精炼章节，帮你系统掌握大模型应用开发。
        </p>
        <div className="hero-in mt-10 flex flex-wrap items-center justify-center gap-4" style={d(400)}>
          <Link href={chapterHref(allChapters[0])} className="btn-primary">
            开始学习
          </Link>
          <Link href="/courses" className="btn-secondary">
            浏览课程
          </Link>
        </div>
        <dl className="hero-in mx-auto mt-14 grid max-w-lg grid-cols-3 gap-6" style={d(520)}>
          {[
            [courses.length, "门课程"],
            [allChapters.length, "篇章节"],
            [`${Math.round(totalMinutes / 60)}h+`, "学习内容"],
          ].map(([n, label]) => (
            <div key={label} className="flex flex-col-reverse">
              <dt className="mt-1 text-sm text-muted">{label}</dt>
              <dd className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">{n}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Product-style showcase panel */}
      <section className="container-x" aria-label="学习概览">
        <Reveal y={40}>
          <div className="grid gap-6 rounded-[2.5rem] bg-surface p-5 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-center">
            <ContinueLearning chapters={lite} />
            <div className="min-w-0">
              <p className="mb-3 px-1 text-sm text-muted">Agent 的核心只有四行：</p>
              <CodeBlock code={heroCode} lang="python" title="agent_loop.py" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* Categories */}
      <section className="container-x pt-28 sm:pt-36" aria-labelledby="cat-title">
        <Reveal>
          <p className="text-sm font-semibold text-accent">课程分类</p>
          <h2 id="cat-title" className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
            七门课程，覆盖完整知识体系。
          </h2>
        </Reveal>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((c, i) => (
            <Reveal as="li" key={c.slug} delay={(i % 4) * 0.08}>
              <CourseCard course={c} />
            </Reveal>
          ))}
          <Reveal as="li" delay={0.24}>
            <Link
              href="/courses"
              className="lift flex h-full min-h-56 flex-col justify-end rounded-3xl bg-fg p-6 text-bg"
            >
              <p className="text-sm opacity-70">完整目录</p>
              <p className="mt-1 text-xl font-semibold tracking-tight">查看全部章节 ›</p>
            </Link>
          </Reveal>
        </ul>
      </section>

      {/* Featured */}
      <section className="container-x pt-28 sm:pt-36" aria-labelledby="feat-title">
        <Reveal>
          <p className="text-sm font-semibold text-accent">精选内容</p>
          <h2 id="feat-title" className="mt-2 text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
            最值得先读的章节。
          </h2>
        </Reveal>
        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredChapters.map((ch, i) => (
            <Reveal as="li" key={chapterKey(ch)} delay={(i % 3) * 0.08}>
              <ChapterCard chapter={ch} accentKey={accentOf(ch.courseSlug)} />
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Roadmap — sticky scroll storytelling */}
      <section className="container-x pt-28 sm:pt-36" aria-label="学习路线">
        <RoadmapStory steps={steps} />
      </section>
    </>
  );
}
