import Link from "next/link";
import { navItems } from "@/components/site-header";
import { courses } from "@/lib/courses";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-surface text-xs text-muted">
      <div className="container-x grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-sm font-semibold text-fg">NeoLearn</p>
          <p className="mt-3 max-w-sm leading-6">
            面向中文开发者的 AI 工程学习平台。全部内容为原创入门教程；学习进度与浏览时长仅保存在你的浏览器本地。
          </p>
        </div>
        <nav aria-label="课程">
          <p className="mb-3 font-semibold text-fg">课程</p>
          <ul className="space-y-2">
            {courses.map((c) => (
              <li key={c.slug}>
                <Link href={`/courses/${c.slug}`} className="hover:text-fg hover:underline">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="站点">
          <p className="mb-3 font-semibold text-fg">探索</p>
          <ul className="space-y-2">
            {navItems.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-fg hover:underline">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="container-x border-t border-line py-5">
        <p>Built with Next.js · Tailwind CSS · Motion</p>
      </div>
    </footer>
  );
}
