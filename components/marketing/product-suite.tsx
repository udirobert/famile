"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { MorphBlob } from "@/components/motion/morph-blob";
import { TextReveal } from "@/components/motion/text-reveal";
import { Magnetic } from "@/components/motion/magnetic-button";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { products, productOpenLabel, type Product } from "@/lib/products";
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
            text="Three deeper paths."
            className="font-display text-4xl leading-tight tracking-tight sm:text-5xl"
            stagger={0.06}
          />
        </div>

        <div className="mt-20 grid gap-6 lg:grid-cols-3">
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
      className="group relative flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-line-strong bg-canvas-elevated/40 p-8 backdrop-blur-xl sm:p-10"
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
      </motion.div>

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
        <MorphBlob
          from={product.glyph.from}
          to={product.glyph.to}
          speed={1.2 + index * 0.2}
          distort={0.38 + index * 0.06}
          className="absolute inset-0"
        />
      </motion.div>

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
        </div>
      </motion.div>

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
          </div>
        ))}
      </motion.div>
    </motion.article>
  );
}
