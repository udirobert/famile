import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/shell";
import { Container } from "@/components/ui/container";
import { AgentDashboard } from "@/components/agent/agent-dashboard";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "The suite",
  description:
    "Three practices. Each one thing at a time — Sukari, Orbura, and Ardum. Orientation here; continuous care in the product apps.",
  alternates: { canonical: "/dashboard" },
};

export default function DashboardPage() {
  return (
    <MarketingShell>
      <section className="py-28 sm:py-36">
        <Container>
          <header className="mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-dim">
              famile suite
            </p>
            <h1 className="mt-2 font-display text-5xl tracking-tight sm:text-6xl">
              The suite.
            </h1>
            <p className="mt-4 max-w-md text-lg text-ink-muted">
              Three practices. Each one thing at a time.
            </p>
          </header>

          <section className="mb-16">
            <AgentDashboard />
          </section>

          <section>
            <h2 className="mb-6 text-xs uppercase tracking-[0.2em] text-ink-dim">
              Your suite
            </h2>

            <div className="grid gap-4 lg:grid-cols-3">
              {products.map((p) => (
                <Link
                  key={p.slug}
                  href={`/products/${p.slug}`}
                  className="group relative overflow-hidden rounded-xl border border-line-strong bg-canvas-elevated/40 p-8 backdrop-blur-xl transition-all duration-500 hover:border-aurora-lavender/40 hover:bg-canvas-elevated/70"
                >
                  <div
                    className="absolute -inset-px -z-10 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
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
                      {p.urlStatus === "soon" ? "Soon" : p.status}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-3xl tracking-tight">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-sm text-ink-muted">{p.tagline}</p>
                  <p className="mt-6 text-sm text-ink">Learn about {p.name} →</p>
                </Link>
              ))}
            </div>
          </section>
        </Container>
      </section>
    </MarketingShell>
  );
}
