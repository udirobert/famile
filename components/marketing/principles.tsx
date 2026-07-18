"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { TextReveal } from "@/components/motion/text-reveal";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { fadeUp, viewportOnce } from "@/lib/motion";

const principles = [
  {
    n: "01",
    title: "Being here is enough.",
    body: "No task to complete. Peruse, sit, talk with Mira — or leave. All of that counts.",
  },
  {
    n: "02",
    title: "You are the story.",
    body: "famile is space around you, not a pitch. Mira keeps company; she doesn't own the plot.",
  },
  {
    n: "03",
    title: "Quiet by default.",
    body: "Present when you want company. Never sharp for sharpness's sake.",
  },
  {
    n: "04",
    title: "Apps stay in the family.",
    body: "Sukari, Orbura, and Ardum live nearby. They aren't the reason this space exists.",
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
            text="How this space feels."
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
