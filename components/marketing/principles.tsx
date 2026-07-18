"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { TextReveal } from "@/components/motion/text-reveal";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { fadeUp, viewportOnce } from "@/lib/motion";

const notes = [
  {
    n: "01",
    title: "Attention before action.",
    body: "What is noticed with care can be met with care. Most systems fail by rushing past the signal.",
  },
  {
    n: "02",
    title: "Stillness is data.",
    body: "Contemplative practice and clinical observation agree: the body often speaks before the crisis. Listening is empirical work.",
  },
  {
    n: "03",
    title: "One move, then the next.",
    body: "Adherence research favors small, repeatable acts over walls of advice. Complexity is usually the enemy of return.",
  },
  {
    n: "04",
    title: "Continuity over intensity.",
    body: "Outcomes compound in ordinary days. Drama is optional; showing up again is not.",
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
            text="NOTES"
            className="mb-4 text-xs uppercase tracking-[0.25em] text-ink-dim"
            stagger={0.04}
          />
          <TextReveal
            as="h2"
            text="Measure. Attend. Return."
            className="font-display text-4xl leading-[1.2] tracking-tight sm:text-5xl"
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
            {notes.map((p) => (
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
