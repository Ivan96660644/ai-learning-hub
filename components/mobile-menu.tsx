"use client";

import Link from "next/link";
import { useState } from "react";

export function MobileMenu({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "关闭菜单" : "打开菜单"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-200"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          )}
        </svg>
      </button>
      {open && (
        <nav className="absolute inset-x-0 top-16 border-b border-white/10 bg-[#07061d]/95 px-4 py-3 backdrop-blur-xl">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-3 text-slate-200 hover:bg-white/5"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
