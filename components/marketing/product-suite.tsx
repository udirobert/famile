"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { MorphBlob } from "@/components/motion/morph-blob";
import { TextReveal } from "@/components/motion/text-reveal";
import { Magnetic } from "@/components/motion/magnetic-button";
import { Button } from "@/components/ui/button";
import { products, type Product } from "@/lib/products";
import { stagger, fadeUp, viewportOnce } from "@/lib/motion";

export function ProductSuite() {
  return (
    <section id="suite" className="relative py-32 sm:py-40">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <TextReveal
            as="p"
            text="THE SUITE"
            className="mb-4 text-xs uppercase tracking-[0.25em] text-ink-dim"
            stagger={0.04}
          />
          <TextReveal
            as="h2"
            text="Two products. One care continuum."
            className="font-display text-4xl leading-tight tracking-tight sm:text-5xl"
            stagger={0.06}
          />
          <TextReveal
            as="p"
            text="Each product is AI-native or AI-enabled. Each is calm to live with and energising to act on."
            className="mt-6 text-lg text-ink-muted"
            stagger={0.03}
          />
        </div>

        <div className="mt-20 grid gap-6 lg:grid-cols-2">
          {products.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <motion.article
      id={product.slug}
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className="group relative overflow-hidden rounded-[var(--radius-xl)] border border-line-strong bg-canvas-elevated/40 p-8 backdrop-blur-xl sm:p-10"
    >
      <div
        className="absolute -inset-px -z-10 rounded-[var(--radius-xl)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(60% 60% at 50% 0%, ${product.accent}22, transparent 70%)`,
        }}
      />

      <motion.div variants={fadeUp} className="mb-6 flex items-center gap-3">
        <span className="inline-flex items-center rounded-full border border-line-strong px-3 py-1 text-xs uppercase tracking-[0.18em] text-ink-muted">
          {product.category}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-aurora-mint/30 bg-aurora-mint/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-aurora-mint">
          <span className="h-1 w-1 rounded-full bg-aurora-mint" />
          {product.status}
        </span>
      </motion.div>

      <div className="grid gap-8 sm:grid-cols-[0.9fr_1.1fr] sm:items-center">
        <motion.div
          variants={fadeUp}
          className="relative mx-auto aspect-square w-full max-w-[280px]"
        >
          <div
            className="absolute inset-6 rounded-full opacity-40 blur-[60px]"
            style={{ background: `radial-gradient(circle, ${product.accent}55, transparent 70%)` }}
            aria-hidden
          />
          <MorphBlob
            from={product.glyph.from}
            to={product.glyph.to}
            speed={1.2 + index * 0.2}
            distort={0.38 + index * 0.06}
            className="absolute inset-0"
          />
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-col">
          <h3 className="font-display text-4xl tracking-tight">{product.name}</h3>
          <p className="mt-3 text-base text-ink">{product.tagline}</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            {product.longDescription}
          </p>

          <ul className="mt-6 space-y-2">
            {product.features.map((f) => (
              <li key={f.title} className="flex items-start gap-3 text-sm">
                <span
                  className="mt-1.5 h-1 w-3 flex-shrink-0 rounded-full"
                  style={{ background: product.accent }}
                />
                <span className="text-ink-muted">
                  <span className="text-ink">{f.title}.</span> {f.body}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center gap-3">
            <Magnetic strength={0.3} className="inline-flex">
              <Button
                href={`/products/${product.slug}`}
                variant="secondary"
                size="md"
                transitionTypes={["nav-forward"]}
              >
                Explore {product.name}
              </Button>
            </Magnetic>
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={fadeUp}
        className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-6"
      >
        {product.metric.map((m) => (
          <div key={m.label}>
            <p
              className="font-display text-2xl tracking-tight"
              style={{ color: product.accent }}
            >
              {m.value}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink-dim">
              {m.label}
            </p>
          </div>
        ))}
      </motion.div>
    </motion.article>
  );
}
