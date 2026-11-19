import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex max-w-xl flex-col items-center py-32 text-center">
      <p className="text-sm font-semibold text-accent">404</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-fg sm:text-5xl">找不到这个页面。</h1>
      <p className="mt-4 text-lg text-muted">它可能已被移动，或者链接有误。</p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/" className="btn-primary">
          返回首页
        </Link>
        <Link href="/search" className="btn-secondary">
          搜索文章
        </Link>
      </div>
    </div>
  );
}
