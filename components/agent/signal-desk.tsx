"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/container";
import { TextReveal } from "@/components/motion/text-reveal";
import { getProduct, products, type ProductSlug } from "@/lib/products";
import { replayTraces } from "@/lib/agent/replay";
import type { StepKind } from "@/lib/agent/types";
import { viewportOnce } from "@/lib/motion";

const kindColor: Record<StepKind, string> = {
  input: "#8b7fe8",
  observe: "#7ee8c8",
  reason: "#c4b0ff",
  decide: "#ffc581",
  report: "#6b5e8a",
};

const stepDelay = (kind: StepKind, i: number) => {
  if (i === 0) return 800;
  if (kind === "decide") return 1700;
  return 1500;
};

const cycle: ProductSlug[] = products.map((p) => p.slug);

export function SignalDesk() {
  const [productIdx, setProductIdx] = useState(0);
  const [visible, setVisible] = useState(1);
  const reduced = useReducedMotion();

  const product = cycle[productIdx];
  const trace = replayTraces[product];
  const steps = trace.steps;
  const meta = getProduct(product);
  const shown = reduced ? steps.length : Math.min(visible, steps.length);

  const switchProduct = useCallback(() => {
    setProductIdx((i) => (i + 1) % cycle.length);
    setVisible(1);
  }, []);

  // Stepper: reveal steps one at a time, then pause and switch product.
  // setState only fires inside setTimeout callbacks, never in the effect body.
  useEffect(() => {
    if (reduced) {
      const t = setTimeout(switchProduct, 13000);
      return () => clearTimeout(t);
    }
    if (visible < steps.length) {
      const kind = steps[visible - 1].kind;
      const t = setTimeout(
        () => setVisible((v) => v + 1),
        stepDelay(kind, visible - 1),
      );
      return () => clearTimeout(t);
    }
    const t = setTimeout(switchProduct, 4200);
    return () => clearTimeout(t);
  }, [product, visible, reduced, steps, switchProduct]);

  return (
    <section id="reasoning" className="relative py-32 sm:py-40">
      <Container>
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <TextReveal
            as="p"
            text="HOW THE PRODUCTS REASON"
            className="mb-4 text-xs uppercase tracking-[0.25em] text-ink-dim"
            stagger={0.04}
          />
          <TextReveal
            as="h2"
            text="See how they reason."
            className="font-display text-4xl leading-tight tracking-tight sm:text-5xl"
            stagger={0.06}
          />
          <TextReveal
            as="p"
            text="Not a funnel — a trace. How each product thinks on a simulated signal, in the open."
            className="mt-6 text-lg text-ink-muted"
            stagger={0.03}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl overflow-hidden rounded-[var(--radius-xl)] border border-line-strong bg-canvas-elevated/40 backdrop-blur-xl"
        >
          {/* Desk header */}
          <div className="flex items-center justify-between border-b border-line px-6 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <span
                className="h-2 w-2 animate-pulse rounded-full"
                style={{ background: meta.accent }}
              />
              <span className="font-display text-xl tracking-tight">
                {meta.name}
              </span>
              <span className="text-xs uppercase tracking-[0.18em] text-ink-dim">
                {meta.status}
              </span>
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-ink-dim"
              title="A recorded session — simulated signal, real reasoning. Not medical advice."
            >
              <span className="h-1 w-1 rounded-full bg-aurora-amber" />
              {reduced ? "recorded session" : "live trace · simulated signal"}
            </span>
          </div>

          {/* Trace */}
          <div className="px-6 py-8 sm:px-8">
            <AnimatePresence mode="popLayout">
              {steps.slice(0, shown).map((step, i) => {
                const color = kindColor[step.kind];
                const isDecide = step.kind === "decide";
                const isReport = step.kind === "report";
                return (
                  <motion.div
                    key={`${product}-${i}`}
                    layout
                    initial={reduced ? false : { opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: reduced ? 0 : 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="relative mb-4 pl-7 last:mb-0"
                  >
                    {/* rail */}
                    <span
                      className="absolute left-0 top-1.5 h-2 w-2 rounded-full"
                      style={{ background: color }}
                    />
                    {i < shown - 1 && (
                      <span
                        className="absolute left-[3px] top-4 h-[calc(100%+1rem)] w-px"
                        style={{ background: "var(--color-line)" }}
                      />
                    )}
                    <span className="mb-1 block text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                      {step.label}
                    </span>
                    {isDecide ? (
                      <p
                        className="rounded-[var(--radius-md)] border px-4 py-3 font-display text-lg leading-snug tracking-tight"
                        style={{
                          borderColor: `${color}55`,
                          background: `${color}14`,
                          color: "var(--color-ink)",
                          boxShadow: `0 0 40px -12px ${color}66`,
                        }}
                      >
                        {step.text}
                      </p>
                    ) : isReport ? (
                      <p
                        className="rounded-[var(--radius-md)] border border-dashed border-line-strong px-4 py-3 font-mono text-sm leading-relaxed text-ink-muted"
                      >
                        {step.text}
                      </p>
                    ) : (
                      <p className="text-sm leading-relaxed text-ink-muted">
                        {step.text}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* thinking pulse while more steps remain */}
            {shown < steps.length && !reduced && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                className="mt-2 flex items-center gap-2 pl-7 text-[10px] uppercase tracking-[0.18em] text-ink-dim"
              >
                <span className="flex gap-1">
                  <span className="h-1 w-1 rounded-full bg-aurora-lavender" />
                  <span className="h-1 w-1 rounded-full bg-aurora-lavender" />
                  <span className="h-1 w-1 rounded-full bg-aurora-lavender" />
                </span>
                reasoning
              </motion.div>
            )}
          </div>

          {/* progress: which product in the loop */}
          <div className="flex items-center justify-between border-t border-line px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-ink-dim sm:px-8">
            <span>{meta.category}</span>
            <span className="flex flex-wrap items-center gap-2">
              {cycle.map((slug, i) => {
                const p = getProduct(slug);
                return (
                  <span key={slug} className="flex items-center gap-1.5">
                    {i > 0 && (
                      <span className="mx-0.5 text-ink-dim/40">/</span>
                    )}
                    <ProductDot
                      active={product === slug}
                      color={p.accent}
                    />
                    {p.name}
                  </span>
                );
              })}
            </span>
          </div>
        </motion.div>

        <p className="mx-auto mt-6 max-w-xl text-center text-xs text-ink-dim">
          Simulated signal. Real reasoning. Not medical advice — a
          demonstration of how the products reason, supervised by a clinician in
          real use.
        </p>
        <div className="mt-4 text-center">
          <Link
            href="/ask"
            className="text-sm text-ink-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Ask it a question →
          </Link>
        </div>
      </Container>
    </section>
  );
}

function ProductDot({ active, color }: { active: boolean; color: string }) {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full transition-opacity"
      style={{ background: color, opacity: active ? 1 : 0.3 }}
    />
  );
}
