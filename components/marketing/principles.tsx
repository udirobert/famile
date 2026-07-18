"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { TextReveal } from "@/components/motion/text-reveal";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { fadeUp, viewportOnce } from "@/lib/motion";

const principles = [
  {
    n: "01",
    title: "Insight can stand alone.",
    body: "A clearer thought is enough. Product paths are earned, not required.",
  },
  {
    n: "02",
    title: "AI-native, not AI-decorated.",
    body: "Software that decides, practices, and reports — not just charts.",
  },
  {
    n: "03",
    title: "Exception-oriented.",
    body: "Surface what shifted. Silence is the default.",
  },
  {
    n: "04",
    title: "Quiet by default. Present when it matters.",
    body: "Easy to live with. Ready when a decision needs making.",
  },
];

export function Principles() {
  return (
    <section
      id="principles"
      className="relative border-y border-line bg-canvas-elevated/20 py-32 sm:py-40"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <TextReveal
            as="p"
            text="PRINCIPLES"
            className="mb-4 text-xs uppercase tracking-[0.25em] text-ink-dim"
            stagger={0.04}
          />
          <TextReveal
            as="h2"
            text="How we build."
            className="font-display text-4xl leading-tight tracking-tight sm:text-5xl"
            stagger={0.06}
          />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="mx-auto mt-16 max-w-2xl rounded-[var(--radius-xl)] border border-line bg-canvas-elevated/40 px-6 py-2 backdrop-blur-xl sm:px-8"
        >
          <Accordion>
            {principles.map((p) => (
              <AccordionItem
                key={p.n}
                title={
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-aurora-mint/70">
                      {p.n}
                    </span>
                    <span className="font-display text-xl tracking-tight sm:text-2xl">
                      {p.title}
                    </span>
                  </span>
                }
              >
                {p.body}
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </Container>
    </section>
  );
}
