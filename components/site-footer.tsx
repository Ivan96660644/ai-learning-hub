import Link from "next/link";
import { courses } from "@/lib/courses";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-black/20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_2fr]">
        <div>
          <p className="font-display text-sm font-bold tracking-[0.18em] text-white">
            NEO<span className="neon-text">LEARN</span> AI
          </p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
            面向中文开发者的 AI 工程学习平台。所有内容均为原创入门教程，学习进度只保存在你的浏览器本地。
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {courses.map((c) => (
            <Link key={c.slug} href={`/courses/${c.slug}`} className="text-slate-400 hover:text-cyan-300">
              {c.title}
            </Link>
          ))}
        </div>
      </div>
      <p className="pb-8 text-center text-xs text-slate-500">
        Built with Next.js · Tailwind CSS · Deployed on Vercel
      </p>
    </footer>
  );
}
