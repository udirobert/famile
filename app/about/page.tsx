import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/shell";
import { Container } from "@/components/ui/container";
import { JsonLd } from "@/components/JsonLd";
import { webPageSchema } from "@/lib/schema";
import { productOpenLabel, products } from "@/lib/products";

export const metadata: Metadata = {
  title: "About",
  description:
    "famile is a compass for health and wellness — orientation and insight first, with optional paths into Sukari, Orbura, and Ardum.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About famile — a compass for health and wellness",
    description:
      "Insight first. Soft paths into continuous care and practice when they clearly help.",
  },
};

export default function AboutPage() {
  return (
    <MarketingShell>
      <JsonLd
        data={webPageSchema({
          path: "/about",
          name: "About famile",
          description:
            "Why famile exists as a compass — orientation first, products optional.",
        })}
      />
      <section className="py-32 sm:py-40">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-ink-dim">
              About
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              A compass, not a{" "}
              <span className="text-aurora-gradient text-luminous">
                storefront.
              </span>
            </h1>
            <div className="mt-10 space-y-6 text-lg leading-relaxed text-ink-muted">
              <p>
                famile helps you orient: name your situation, learn a useful
                health or wellness takeaway, and leave wiser — even if you never
                open another app.
              </p>
              <p>
                Sukari, Orbura, and Ardum deliver the continuous, personalized
                care and practice. This site points toward them only when the
                insight clearly maps. Clicking through is never required for the
                visit to succeed.
              </p>
              <p>
                Quiet by default. Present when it matters. Never make someone
                feel they failed by staying with the takeaway.
              </p>
            </div>

            <div className="mt-16 grid gap-px overflow-hidden rounded-[var(--radius-xl)] border border-line bg-line sm:grid-cols-3">
              {products.map((p) => (
                <div
                  key={p.slug}
                  className="bg-canvas-elevated/40 p-8 backdrop-blur-xl"
                >
                  <p
                    className="text-xs uppercase tracking-[0.18em]"
                    style={{ color: p.accent }}
                  >
                    {p.status}
                  </p>
                  <h3 className="mt-3 font-display text-2xl tracking-tight">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-sm text-ink-muted">{p.description}</p>
                  <div className="mt-6 flex flex-col gap-2">
                    <Link
                      href={`/products/${p.slug}`}
                      transitionTypes={["nav-forward"]}
                      className="inline-block text-sm text-ink transition-opacity hover:opacity-80"
                    >
                      Learn about {p.name} →
                    </Link>
                    {p.urlStatus === "live" ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-ink-muted underline-offset-4 hover:underline"
                      >
                        {productOpenLabel(p)}
                      </a>
                    ) : (
                      <span className="text-xs uppercase tracking-[0.14em] text-ink-dim">
                        App coming soon
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link
                href="/ask"
                className="text-sm text-ink-muted underline-offset-4 hover:underline"
              >
                Ask for orientation →
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </MarketingShell>
  );
}
