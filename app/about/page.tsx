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
    "famile builds for the long arc of staying well — attention, evidence, and continuity.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About famile",
    description: "Attention before action. Continuity over intensity.",
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
            "Attention, evidence, and continuity for the long arc of staying well.",
        })}
      />
      <section className="py-32 sm:py-40">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-ink-dim">
              About
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.12] tracking-tight sm:text-6xl">
              Care that{" "}
              <span className="text-aurora-gradient text-luminous">
                compounds.
              </span>
            </h1>
            <div className="mt-8 max-w-xl space-y-5 text-lg leading-relaxed text-ink-muted">
              <p>
                Health rarely fails for lack of information. It fails in the
                gap between knowing and returning — the ordinary days where
                attention slips and noise wins.
              </p>
              <p>
                We draw from both stillness and measurement: contemplative
                habits of noticing, and the empirical habit of asking what
                actually changed. Mira is here for conversation. The apps below
                hold longer arcs of practice and care.
              </p>
            </div>

            <div className="mt-16">
              <p className="mb-6 text-xs uppercase tracking-[0.2em] text-ink-dim">
                Practice
              </p>
              <div className="grid gap-px overflow-hidden rounded-[var(--radius-xl)] border border-line bg-line sm:grid-cols-3">
                {products.map((p) => (
                  <div
                    key={p.slug}
                    className="bg-canvas-elevated/40 p-8 backdrop-blur-xl"
                  >
                    <h3 className="font-display text-2xl tracking-tight">
                      {p.name}
                    </h3>
                    <p className="mt-2 text-sm text-ink-muted">{p.tagline}</p>
                    <div className="mt-6 flex flex-col gap-2">
                      <Link
                        href={`/products/${p.slug}`}
                        transitionTypes={["nav-forward"]}
                        className="inline-block text-sm text-ink transition-opacity hover:opacity-80"
                      >
                        Details →
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
                          Soon
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-16 text-center">
              <Link
                href="/?mira=1"
                className="text-sm text-ink-muted underline-offset-4 hover:underline"
              >
                Ask Mira →
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </MarketingShell>
  );
}
