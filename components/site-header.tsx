import Link from "next/link";
import { MobileMenu } from "@/components/mobile-menu";
import { NavLinks } from "@/components/nav-links";
import { SearchDialog } from "@/components/search-dialog";
import { ThemeToggle } from "@/components/theme-toggle";

export const navItems = [
  { href: "/", label: "首页" },
  { href: "/courses", label: "课程" },
  { href: "/search", label: "搜索" },
  { href: "/progress", label: "学习进度" },
];

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="NeoLearn 首页">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="text-fg">
        <rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" />
        <path d="M8 16V8l8 8V8" fill="none" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[15px] font-semibold tracking-tight text-fg">NeoLearn</span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[var(--nav)] backdrop-blur-xl backdrop-saturate-150">
      <div className="container-x relative flex h-12 items-center gap-6">
        <Logo />
        <NavLinks items={navItems} />
        <div className="ml-auto flex items-center gap-1.5">
          <SearchDialog />
          <ThemeToggle />
          <MobileMenu items={navItems} />
        </div>
      </div>
    </header>
  );
}
