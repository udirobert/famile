"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic-button";
import { TextReveal } from "@/components/motion/text-reveal";
import { stagger, fadeUp, viewportOnce } from "@/lib/motion";

export function CTA() {
  return (
    <section className="relative py-32 sm:py-40">
      <Container>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="relative overflow-hidden rounded-[var(--radius-xl)] border border-line-strong bg-canvas-elevated/40 p-12 text-center backdrop-blur-xl sm:p-20"
        >
          <div
            className="absolute inset-0 -z-10 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(196,176,255,0.22), transparent 60%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(126,232,200,0.14), transparent 70%)",
            }}
            aria-hidden
          />
          <motion.p
            variants={fadeUp}
            className="text-xs uppercase tracking-[0.25em] text-ink-dim"
          >
            Begin
          </motion.p>
          <TextReveal
            as="h2"
            text="Start the care arc."
            className="mt-4 font-display text-4xl tracking-tight sm:text-6xl"
            stagger={0.06}
          />
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-md text-lg text-ink-muted"
          >
            Meet Sukari and Orbura. Two products, one calmer kind of care -
            calm enough to live with, energising enough to act on.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            <Magnetic strength={0.3} className="inline-flex">
              <Button
                href="/dashboard"
                size="lg"
                transitionTypes={["nav-forward"]}
              >
                Enter the suite
              </Button>
            </Magnetic>
            <Button href="/contact" size="lg" variant="secondary">
              Talk to us
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
