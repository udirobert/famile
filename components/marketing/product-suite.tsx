"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { CssOrb } from "@/components/motion/css-orb";
import { TextReveal } from "@/components/motion/text-reveal";
import { Magnetic } from "@/components/motion/magnetic-button";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { ProvenanceAffordance } from "@/components/agent/provenance";
import {
  practiceProducts,
  productOpenLabel,
  researchProducts,
  type Product,
} from "@/lib/products";
import { replayTraces } from "@/lib/agent/replay";
import { stagger, fadeUp, viewportOnce } from "@/lib/motion";

export function ProductSuite() {
  return (
    <section id="suite" className="relative py-32 sm:py-40">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <TextReveal
            as="p"
            text="WHAT'S HERE"
            className="mb-4 text-xs uppercase tracking-[0.25em] text-ink-dim"
            stagger={0.04}
          />
          <TextReveal
            as="h2"
            text="Care and practice, when useful."
            className="font-display text-4xl leading-tight tracking-tight sm:text-5xl"
            stagger={0.06}
          />
        </div>

        <div className="mt-20 grid gap-6 lg:grid-cols-3">
          {practiceProducts.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>

        <div id="bench" className="mt-28 scroll-mt-28">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.25em] text-ink-dim">
              The bench
            </p>
            <p className="text-xs text-ink-dim">
              Open research, built in public — not care apps.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {researchProducts.map((p) => (
              <ResearchCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function CardShell({
  product,
  children,
}: {
  product: Product;
  children: React.ReactNode;
}) {
  return (
    <motion.article
      id={product.slug}
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-line-strong bg-canvas-elevated/40 p-8 backdrop-blur-xl sm:p-10"
    >
      <div
        className="absolute -inset-px -z-10 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(60% 60% at 50% 0%, ${product.accent}22, transparent 70%)`,
        }}
      />
      {children}
    </motion.article>
  );
}

function CardHeader({ product }: { product: Product }) {
  return (
    <motion.div variants={fadeUp} className="mb-6 flex items-center gap-3">
      <span className="inline-flex items-center rounded-full border border-line-strong px-3 py-1 text-xs uppercase tracking-[0.18em] text-ink-muted">
        {product.category}
      </span>
    </motion.div>
  );
}

function CardBody({ product }: { product: Product }) {
  return (
    <motion.div variants={fadeUp} className="flex flex-1 flex-col">
      <h3 className="font-display text-3xl tracking-tight lg:text-4xl">
        {product.name}
      </h3>
      <p className="mt-3 text-base text-ink-muted">{product.tagline}</p>

      <Accordion className="mt-6 border-t border-line pt-1">
        <AccordionItem title="What it does">
          <ul className="space-y-3">
            {product.features.map((f) => (
              <li key={f.title}>
                <span className="text-ink">{f.title}.</span> {f.body}
              </li>
            ))}
          </ul>
        </AccordionItem>
      </Accordion>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Magnetic strength={0.3} className="inline-flex">
          <Button
            href={`/products/${product.slug}`}
            variant="secondary"
            size="md"
            transitionTypes={["nav-forward"]}
          >
            Details
          </Button>
        </Magnetic>
        {product.urlStatus === "live" ? (
          <Button
            href={product.url}
            variant="ghost"
            size="md"
            target="_blank"
            rel="noopener noreferrer"
          >
            {productOpenLabel(product)} →
          </Button>
        ) : (
          <span className="text-xs uppercase tracking-[0.16em] text-ink-dim">
            Soon
          </span>
        )}
        {product.repo && product.repo !== product.url && (
          <a
            href={product.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-ink-dim transition-colors hover:text-ink-muted"
          >
            source ↗
          </a>
        )}
      </div>
    </motion.div>
  );
}

function CardMetrics({ product }: { product: Product }) {
  return (
    <motion.div
      variants={fadeUp}
      className="mt-8 grid grid-cols-3 gap-3 border-t border-line pt-6"
    >
      {product.metric.map((m) => (
        <div key={m.label}>
          <p
            className="font-display text-xl tracking-tight sm:text-2xl"
            style={{ color: product.accent }}
          >
            {m.value}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-ink-dim">
            {m.label}
          </p>
          <ProvenanceAffordance slug={product.slug} claim={m.value} />
        </div>
      ))}
    </motion.div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <CardShell product={product}>
      <CardHeader product={product} />

      <motion.div
        variants={fadeUp}
        className="relative mx-auto mb-8 aspect-square w-full max-w-[160px]"
      >
        <div
          className="absolute inset-6 rounded-full opacity-40 blur-[60px]"
          style={{
            background: `radial-gradient(circle, ${product.accent}55, transparent 70%)`,
          }}
          aria-hidden
        />
        <CssOrb
          from={product.glyph.from}
          to={product.glyph.to}
          className="absolute inset-0"
        />
      </motion.div>

      <CardBody product={product} />
      <CardMetrics product={product} />
    </CardShell>
  );
}

// Research cards lead with the reasoning trace instead of an orb — the
// evidence is the visual identity. Same honest data the dashboard cycles.
function ResearchCard({ product }: { product: Product }) {
  const trace = replayTraces[product.slug];
  return (
    <CardShell product={product}>
      <CardHeader product={product} />

      <motion.ol
        variants={fadeUp}
        aria-label={`${product.name} reasoning trace`}
        className="relative mb-8 ml-1.5 space-y-3 pl-6"
      >
        <span
          className="absolute bottom-2 left-[5px] top-2 w-px"
          style={{
            background: `linear-gradient(to bottom, ${product.accent}66, ${product.accent}11)`,
          }}
          aria-hidden
        />
        {trace.steps.map((s) => (
          <li key={s.label} className="relative">
            <span
              className="absolute -left-6 top-1.5 h-[9px] w-[9px] rounded-full border"
              style={{
                borderColor: `${product.accent}88`,
                background: `${product.accent}33`,
              }}
              aria-hidden
            />
            <p className="text-[10px] uppercase tracking-[0.16em] text-ink-dim">
              {s.label}
            </p>
            <p className="line-clamp-2 text-xs leading-relaxed text-ink-muted">
              {s.text}
            </p>
          </li>
        ))}
      </motion.ol>

      <CardBody product={product} />
      <CardMetrics product={product} />
    </CardShell>
  );
}
