"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-header shadow-lg"
          : "bg-primary-dark/50 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <Image
              src="/images/icon-512.png"
              alt="YSCC"
              width={40}
              height={40}
              className="w-9 h-9 sm:w-10 sm:h-10"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-white font-black text-lg sm:text-xl tracking-wider">
                YS-BASE
              </span>
              <span className="text-accent/80 text-[9px] sm:text-[10px] tracking-[0.2em] font-medium">
                SPORTS PARK BY YSCC
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/80 hover:text-white px-3 py-2 text-[13px] font-medium transition-colors relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-accent after:transition-all hover:after:w-4/5"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/reserve/calendar"
              className="ml-4 bg-accent hover:bg-accent-dark text-primary-dark font-bold px-5 py-2 text-[13px] transition-all flex items-center gap-1.5 rounded-sm"
            >
              コートを予約する
              <ChevronRight size={14} strokeWidth={2.5} />
            </Link>
          </nav>

          <button
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="メニューを開く"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden glass-header border-t border-white/10">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 text-base font-medium transition-colors rounded"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/reserve/calendar"
              className="block bg-accent hover:bg-accent-dark text-primary-dark font-bold px-4 py-3 text-center mt-3 transition-colors rounded-sm"
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
