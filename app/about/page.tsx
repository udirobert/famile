import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/shell";
import { Container } from "@/components/ui/container";
import { JsonLd } from "@/components/JsonLd";
import { webPageSchema } from "@/lib/schema";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "About",
  description:
    "We build health products that disappear into care. The famile ethos: AI-native and AI-enabled, quiet to live with, present when it matters.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About famile - health products that disappear into care",
    description:
      "A suite of AI-native and AI-enabled health products, built for the long arc of staying well.",
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
            "Why famile builds health products that disappear into care.",
        })}
      />
      <section className="py-32 sm:py-40">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-ink-dim">
              About
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              We build health products that{" "}
              <span className="text-aurora-gradient text-luminous">
                disappear into care.
              </span>
            </h1>
            <div className="mt-10 space-y-6 text-lg leading-relaxed text-ink-muted">
              <p>
                famile is a suite of AI-native and AI-enabled health products,
                built for the long arc of staying well — metabolic, mental,
                physical. Not single interventions. Continuous, adaptive,
                human-scale care.
              </p>
              <p>
                Every product shares one design ethos: quiet to live with, and
                present the moment it matters. Quiet by default, so it never
                adds to the noise of care. Ready when a decision needs making,
                so the right action arrives in time.
              </p>
              <p>
                We surface what shifted. We trust the rest to run quietly. Care
                teams see signal, never noise — and reach out because something
                matters, not to check a box.
              </p>
            </div>

            <div className="mt-16 grid gap-px overflow-hidden rounded-[var(--radius-xl)] border border-line bg-line sm:grid-cols-2">
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
                  <h3 className="mt-3 font-display text-3xl tracking-tight">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-sm text-ink-muted">
                    {p.description}
                  </p>
                  <Link
                    href={`/products/${p.slug}`}
                    transitionTypes={["nav-forward"]}
                    className="mt-6 inline-block text-sm text-ink transition-opacity hover:opacity-80"
                  >
                    Explore {p.name} →
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link
                href="/contact"
                className="text-sm text-ink-muted underline-offset-4 hover:underline"
              >
                Talk to the team →
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </MarketingShell>
  );
}
