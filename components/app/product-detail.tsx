"use client";

import Link from "next/link";
import { MorphBlob } from "@/components/motion/morph-blob";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { ProvenanceAffordance } from "@/components/agent/provenance";
import { productOpenLabel, type Product } from "@/lib/products";

const liveSignal: Record<Product["slug"], { title: string; hint: string }> = {
  sukari: {
    title: "One thing worth doing today.",
    hint: "Try it before it counts.",
  },
  orbura: {
    title: "Recovery trending well.",
    hint: "Nothing to flag.",
  },
  ardum: {
    title: "Intention held.",
    hint: "One decision when you’re ready.",
  },
};

export function ProductDetail({ product }: { product: Product }) {
  const signal = liveSignal[product.slug];

  return (
    <Container className="py-4">
      <Link
        href="/dashboard"
        transitionTypes={["nav-back"]}
        className="mb-8 inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        ← Suite map
      </Link>

      <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-line-strong px-3 py-1 text-xs uppercase tracking-[0.18em] text-ink-muted">
              {product.category}
            </span>
            {product.urlStatus === "soon" && (
              <span className="inline-flex items-center rounded-full border border-line-strong px-3 py-1 text-xs uppercase tracking-[0.18em] text-ink-dim">
                Soon
              </span>
            )}
          </div>

          <h1 className="font-display text-5xl tracking-tight sm:text-6xl">
            {product.name}
          </h1>
          <p className="mt-4 max-w-md text-lg text-ink-muted">{product.tagline}</p>

          <Accordion className="mt-8 max-w-md border-t border-line">
            <AccordionItem title="More">
              {product.longDescription}
            </AccordionItem>
            <AccordionItem title="Capabilities">
              <ul className="space-y-3">
                {product.features.map((f) => (
                  <li key={f.title}>
                    <span className="text-ink">{f.title}.</span> {f.body}
                  </li>
                ))}
              </ul>
            </AccordionItem>
          </Accordion>

          <div className="mt-10 grid grid-cols-3 gap-6 rounded-[var(--radius-lg)] border border-line p-6">
            {product.metric.map((m) => (
              <div key={m.label}>
                <p
                  className="font-display text-3xl tracking-tight"
                  style={{ color: product.accent }}
                >
                  {m.value}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink-dim">
                  {m.label}
                </p>
                <ProvenanceAffordance slug={product.slug} claim={m.value} />
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {product.urlStatus === "live" ? (
              <Button
                href={product.url}
                size="md"
                target="_blank"
                rel="noopener noreferrer"
              >
                {productOpenLabel(product)}
              </Button>
            ) : (
              <Button size="md" disabled>
                {productOpenLabel(product)}
              </Button>
            )}
            <Button href="/ask" variant="secondary" size="md">
              Ask
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="sticky top-24">
            <div className="relative mx-auto aspect-square w-full max-w-[420px]">
              <div
                className="absolute inset-8 rounded-full opacity-50 blur-[80px]"
                style={{
                  background: `radial-gradient(circle, ${product.accent}55, transparent 70%)`,
                }}
                aria-hidden
              />
              <MorphBlob
                from={product.glyph.from}
                to={product.glyph.to}
                speed={1.3}
                distort={0.44}
                className="absolute inset-0"
              />
            </div>
            <div className="mt-8 rounded-[var(--radius-lg)] border border-line bg-canvas-elevated/30 p-5 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-ink-dim">
                In product
              </p>
              <p className="mt-2 font-display text-lg text-ink">{signal.title}</p>
              <p className="mt-2 text-xs text-ink-muted">{signal.hint}</p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
