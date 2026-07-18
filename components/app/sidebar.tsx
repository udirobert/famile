"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", glyph: "◆" },
  { href: "/products/sukari", label: "Sukari", glyph: "✦" },
  { href: "/products/orbura", label: "Orbura", glyph: "◐" },
  { href: "/products/ardum", label: "Ardum", glyph: "◎" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-line bg-canvas-elevated/40 backdrop-blur-xl lg:flex"
      style={{ viewTransitionName: "site-sidebar" }}
    >
      <div className="flex h-20 items-center px-8">
        <Link
          href="/"
          transitionTypes={["nav-back"]}
          className="font-display text-2xl italic tracking-tight text-ink transition-opacity hover:opacity-80"
        >
          famile
        </Link>
      </div>

      <nav className="flex-1 px-4">
        <p className="px-4 py-3 text-xs uppercase tracking-[0.2em] text-ink-dim">
          Suite
        </p>
        <ul className="space-y-1">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  transitionTypes={["nav-forward"]}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200",
                    active
                      ? "bg-aurora-lavender/10 text-ink"
                      : "text-ink-muted hover:bg-aurora-lavender/5 hover:text-ink",
                  )}
                >
                  <span
                    className={cn(
                      "text-base",
                      active ? "text-aurora-mint" : "text-ink-dim",
                    )}
                  >
                    {item.glyph}
                  </span>
                  {item.label}
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-aurora-mint" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-line p-4">
        <Link
          href="/"
          transitionTypes={["nav-back"]}
          className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-ink-muted transition-colors hover:bg-aurora-lavender/5 hover:text-ink"
        >
          <span className="text-base">←</span>
          Back to site
        </Link>
      </div>
    </aside>
  );
}
