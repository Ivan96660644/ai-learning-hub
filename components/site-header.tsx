import Link from "next/link";
import { MobileMenu } from "@/components/mobile-menu";
import { SearchDialog } from "@/components/search-dialog";

export const navItems = [
  { href: "/", label: "首页" },
  { href: "/courses", label: "课程目录" },
  { href: "/search", label: "搜索" },
  { href: "/progress", label: "学习进度" },
];

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="neon-btn grid h-8 w-8 place-items-center rounded-lg font-display text-sm font-black text-white">
        N
      </span>
      <span className="font-display text-sm font-bold tracking-[0.18em] text-white">
        NEO<span className="neon-text">LEARN</span>
        <span className="ml-1 text-[10px] tracking-widest text-cyan-300/70">AI</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#06051a]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <SearchDialog />
          <MobileMenu items={navItems} />
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-fuchsia-500/60 to-transparent" />
    </header>
  );
}
