"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { TextReveal } from "@/components/motion/text-reveal";
import { stagger, fadeUp, viewportOnce } from "@/lib/motion";

const principles = [
  {
    n: "01",
    title: "AI-native, not AI-decorated.",
    body: "Models that decide, rehearse, and report. Not dashboards that wait for a human to notice.",
  },
  {
    n: "02",
    title: "Exception-oriented.",
    body: "Surface what diverged. Trust the rest to run quietly. Care teams see signal, not noise.",
  },
  {
    n: "03",
    title: "Calm by default, energising on demand.",
    body: "Restful to live with day-to-day. Sharp and kinetic the moment a decision needs to be made.",
  },
  {
    n: "04",
    title: "Built for the care continuum.",
    body: "Not a single intervention. The long arc of staying well - metabolic, mental, physical.",
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
            text="How famile products are made."
            className="font-display text-4xl leading-tight tracking-tight sm:text-5xl"
            stagger={0.06}
          />
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-20 grid gap-px overflow-hidden rounded-[var(--radius-xl)] border border-line bg-line sm:grid-cols-2"
        >
          {principles.map((p) => (
            <motion.div
              key={p.n}
              variants={fadeUp}
              className="group relative bg-canvas-elevated/40 p-8 backdrop-blur-xl transition-colors duration-500 hover:bg-canvas-elevated/70 sm:p-10"
            >
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-sm text-aurora-mint/70">
                  {p.n}
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-2xl tracking-tight text-ink sm:text-3xl">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    {p.body}
                  </p>
                </div>
              </div>
              <div
                className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-aurora-lavender via-aurora-pink to-aurora-mint transition-all duration-700 group-hover:w-full"
                aria-hidden
              />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
