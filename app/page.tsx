import Link from "next/link";
import { ChapterCard, CourseCard } from "@/components/cards";
import { ContinueLearning } from "@/components/progress-widgets";
import { accent } from "@/lib/accent";
import { allChapters, chapterHref, chapterKey, courses, featuredChapters, learningPath } from "@/lib/courses";

export default function Home() {
  const totalMinutes = courses.reduce((s, c) => s + c.totalMinutes, 0);
  const lite = allChapters.map((c) => ({
    key: chapterKey(c),
    href: chapterHref(c),
    title: c.title,
    course: c.courseTitle,
  }));
  const courseOf = (slug: string) => courses.find((c) => c.slug === slug)!;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* Hero */}
      <section className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-3 py-1 text-xs text-fuchsia-200">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fuchsia-400" />
            AI Engineering · 中文入门路线
          </p>
          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            从零构建
            <br />
            <span className="neon-text">AI 工程师</span>的技能树
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            LLM 原理、Prompt Engineering、RAG、AI Agents、MCP、Model Evaluation 到 LLMOps——
            一条清晰的路线，配合代码示例与本地学习进度，帮你系统掌握大模型应用开发。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={chapterHref(allChapters[0])}
              className="neon-btn rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              开始学习 →
            </Link>
            <Link
              href="/courses"
              className="rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:text-white"
            >
              浏览课程目录
            </Link>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {[
              [courses.length, "门课程"],
              [allChapters.length, "篇章节"],
              [`${Math.round(totalMinutes / 60)}h+`, "学习时长"],
            ].map(([n, label]) => (
              <div key={label} className="border-l border-cyan-400/40 pl-3">
                <dt className="font-display text-2xl font-bold text-white">{n}</dt>
                <dd className="text-xs text-slate-400">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="space-y-4">
          <ContinueLearning chapters={lite} />
          <div className="glass rounded-2xl p-5 font-mono text-[13px] leading-6">
            <p className="text-slate-500">{"// agent.loop()"}</p>
            <p>
              <span className="text-fuchsia-300">while</span> <span className="text-slate-300">(!task.done)</span> {"{"}
            </p>
            <p className="pl-4 text-cyan-200">thought = llm.think(context)</p>
            <p className="pl-4 text-cyan-200">result = tools.call(thought)</p>
            <p className="pl-4 text-lime-200">context.push(result)</p>
            <p>{"}"}</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-10">
        <SectionTitle en="Categories" title="课程分类" desc="7 门核心课程，覆盖 AI 应用开发的完整知识体系。" href="/courses" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((c) => (
            <CourseCard key={c.slug} course={c} />
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="py-10">
        <SectionTitle en="Featured" title="精选内容" desc="编辑推荐，最适合入门的高频知识点。" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredChapters.map((ch) => (
            <ChapterCard key={chapterKey(ch)} chapter={ch} accentKey={courseOf(ch.courseSlug).accent} />
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-10">
        <SectionTitle en="Roadmap" title="学习路线" desc="四个阶段循序渐进，每一步都建立在上一步之上。" />
        <ol className="relative grid gap-4 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-cyan-400/60 via-fuchsia-400/60 to-violet-400/60 lg:block" />
          {learningPath.map((step) => {
            const stageCourses = courses.filter((c) => c.stage === step.stage);
            return (
              <li key={step.stage} className="relative">
                <div className="relative z-10 mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-fuchsia-400/40 bg-[#0b0a24] font-display text-lg font-black text-white shadow-[0_0_30px_-6px_rgba(255,61,242,0.7)]">
                  0{step.stage}
                </div>
                <div className="glass rounded-2xl p-5">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-cyan-300">{step.en}</p>
                  <h3 className="mt-1 text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{step.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {stageCourses.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/courses/${c.slug}`}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium ${accent[c.accent].bg} ${accent[c.accent].text} hover:brightness-125`}
                      >
                        {c.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

function SectionTitle({ en, title, desc, href }: { en: string; title: string; desc: string; href?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-300">{en}</p>
        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{title}</h2>
        <p className="mt-2 text-sm text-slate-400">{desc}</p>
      </div>
      {href && (
        <Link href={href} className="text-sm text-cyan-300 hover:text-cyan-100">
          查看全部 →
        </Link>
      )}
    </div>
  );
}
