"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Analisador", icon: "🔍" },
  { href: "/trends", label: "Tendências", icon: "🔥" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-gradient-to-r from-[oklch(0.3_0.15_275)] via-[oklch(0.25_0.12_300)] to-[oklch(0.3_0.12_330)] backdrop-blur-xl shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="text-3xl animate-float">📊</span>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-white/90 transition-colors">
            Content Trends
            <span className="ml-1 bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">
              Analyzer
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                pathname === item.href
                  ? "bg-white/20 text-white shadow-md backdrop-blur-sm"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
