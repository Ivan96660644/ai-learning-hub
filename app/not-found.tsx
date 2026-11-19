import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="neon-text font-display text-7xl font-black">404</p>
      <h1 className="mt-4 text-2xl font-bold text-white">信号丢失</h1>
      <p className="mt-3 text-slate-400">你访问的页面不存在，可能已被移动或链接有误。</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="neon-btn rounded-xl px-5 py-2.5 text-sm font-semibold text-white">
          返回首页
        </Link>
        <Link href="/search" className="rounded-xl border border-white/15 px-5 py-2.5 text-sm text-slate-200 hover:border-cyan-400/60">
          搜索文章
        </Link>
      </div>
    </div>
  );
}
