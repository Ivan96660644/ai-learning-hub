import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ProgressDashboard } from "@/components/progress-dashboard";
import { accent } from "@/lib/accent";
import { chapterHref, chapterKey, courses } from "@/lib/courses";

export const metadata: Metadata = { title: "学习进度" };

export default function ProgressPage() {
  const data = courses.map((c) => ({
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle,
    icon: c.icon,
    text: accent[c.accent].text,
    bar: accent[c.accent].bar,
    chapters: c.chapters.map((ch) => ({
      key: chapterKey(ch),
      href: chapterHref(ch),
      title: ch.title,
      minutes: ch.minutes,
    })),
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <PageHeader
        en="Progress"
        title="学习进度"
        desc="进度保存在当前浏览器的 localStorage 中，无需登录，也不会上传到任何服务器。"
      />
      <ProgressDashboard courses={data} />
    </div>
  );
}
