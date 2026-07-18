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
          className="relative overflow-hidden rounded-[var(--radius-xl)] border border-line-strong bg-canvas-elevated/40 p-12 text-center backdrop-blur-xl sm:p-16"
        >
          <div
            className="absolute inset-0 -z-10 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(196,176,255,0.22), transparent 60%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(126,232,200,0.14), transparent 70%)",
            }}
            aria-hidden
          />
          <TextReveal
            as="h2"
            text="Leave with something useful."
            className="font-display text-4xl tracking-tight sm:text-5xl"
            stagger={0.06}
          />
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            <Magnetic strength={0.3} className="inline-flex">
              <Button href="/ask" size="lg">
                Ask
              </Button>
            </Magnetic>
            <Button href="/contact" size="lg" variant="secondary">
              Contact
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
