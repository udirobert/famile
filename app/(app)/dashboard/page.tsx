import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { AgentDashboard } from "@/components/agent/agent-dashboard";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Overview of your famile health product suite - Sukari and Orbura, status and signals at a glance.",
  alternates: { canonical: "/dashboard" },
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <Container className="py-4">
      <header className="mb-12">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-dim">
          Overview
        </p>
        <h1 className="mt-2 font-display text-5xl tracking-tight sm:text-6xl">
          Good morning.
        </h1>
        <p className="mt-4 max-w-md text-lg text-ink-muted">
          Two products in your suite. Both quiet. Both ready when you are.
        </p>
      </header>

      <section className="mb-16">
        <AgentDashboard />
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.2em] text-ink-dim">
            Your suite
          </h2>
          <Link
            href="/"
            transitionTypes={["nav-back"]}
            className="text-sm text-ink-muted transition-colors hover:text-ink"
          >
            View on site →
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {products.map((p) => (
            <Link
              key={p.slug}
              href={`/products/${p.slug}`}
              transitionTypes={["nav-forward"]}
              className="group relative overflow-hidden rounded-[var(--radius-xl)] border border-line-strong bg-canvas-elevated/40 p-8 backdrop-blur-xl transition-all duration-500 hover:border-aurora-lavender/40 hover:bg-canvas-elevated/70"
            >
              <div
                className="absolute -inset-px -z-10 rounded-[var(--radius-xl)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(60% 60% at 50% 0%, ${p.accent}22, transparent 70%)`,
                }}
              />
              <div className="flex items-center justify-between">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: p.accent }}
                />
                <span className="text-xs uppercase tracking-[0.18em] text-ink-dim">
                  {p.status}
                </span>
              </div>
              <h3 className="mt-6 font-display text-3xl tracking-tight">
                {p.name}
              </h3>
              <p className="mt-2 text-sm text-ink-muted">{p.tagline}</p>
              <p className="mt-6 text-sm text-ink">
                Open {p.name} →
              </p>
            </Link>
          ))}
        </div>
      </section>
    </Container>
  );
}
