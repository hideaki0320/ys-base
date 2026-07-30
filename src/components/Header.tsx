"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { href: "/facility", label: "施設概要" },
  { href: "/reserve", label: "予約方法" },
  { href: "/pricing", label: "料金表" },
  { href: "/access", label: "アクセス" },
  { href: "/news", label: "お知らせ" },
  { href: "/contact", label: "お問い合わせ" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <div className="flex flex-col">
              <span className="text-white font-black text-xl sm:text-2xl tracking-wider">
                YS-BASE
              </span>
              <span className="text-accent text-[10px] sm:text-xs tracking-widest">
                SPORTS PARK BY YSCC
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/90 hover:text-accent px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/reserve"
              className="ml-3 bg-accent hover:bg-accent-dark text-primary font-bold px-5 py-2.5 text-sm transition-colors"
            >
              コートを予約する
            </Link>
          </nav>

          <button
            className="lg:hidden text-white p-2"
            onClick={() => setOpen(!open)}
            aria-label="メニューを開く"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-primary-dark border-t border-white/10">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-white/90 hover:text-accent px-4 py-3 text-base font-medium transition-colors"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/reserve"
              className="block bg-accent hover:bg-accent-dark text-primary font-bold px-4 py-3 text-center mt-3 transition-colors"
              onClick={() => setOpen(false)}
            >
              コートを予約する
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
