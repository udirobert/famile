"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const labels: Record<string, string> = {
  "/dashboard": "Overview",
  "/products/sukari": "Sukari · Metabolic Care",
  "/products/orbura": "Orbura · Recovery Intelligence",
};

export function Topbar() {
  const pathname = usePathname();
  const label =
    labels[pathname] ??
    (pathname.startsWith("/products/")
      ? "Product"
      : "famile suite");

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-canvas/70 px-6 backdrop-blur-xl sm:px-10"
      style={{ viewTransitionName: "site-topbar" }}
    >
      <div className="flex items-center gap-3">
        <Link
          href="/"
          transitionTypes={["nav-back"]}
          className="font-display text-xl italic tracking-tight text-ink lg:hidden"
        >
          famile
        </Link>
        <span className="hidden text-sm text-ink-dim lg:inline">
          {label}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-xs uppercase tracking-[0.18em] text-ink-dim sm:inline">
          Care mode
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-aurora-mint/30 bg-aurora-mint/10 px-3 py-1 text-xs text-aurora-mint">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-aurora-mint" />
          Live
        </span>
        <Button href="/" variant="ghost" size="sm" transitionTypes={["nav-back"]}>
          Exit
        </Button>
      </div>
    </header>
  );
}
