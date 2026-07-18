"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { AuroraCanvas } from "@/components/motion/aurora-canvas";
import { MorphBlob } from "@/components/motion/morph-blob";
import { Magnetic } from "@/components/motion/magnetic-button";
import { EASE, DUR, stagger, fadeUp, viewportOnce } from "@/lib/motion";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-24">
      <AuroraCanvas
        className="absolute inset-0 -z-10"
        intensity={1}
      />
      <div
        className="absolute inset-0 -z-10 bg-canvas/20"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-b from-transparent to-canvas"
        aria-hidden
      />

      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            <motion.p
              variants={fadeUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-line-strong bg-canvas-elevated/30 px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-ink-muted backdrop-blur-md"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-aurora-mint" />
              a compass for health &amp; wellness
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl leading-[0.95] tracking-[-0.03em] sm:text-6xl lg:text-7xl"
            >
              Orient.{" "}
              <span className="text-aurora-gradient text-luminous">
                Leave wiser.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-7 max-w-md text-lg leading-relaxed text-ink-muted"
            >
              Insight and orientation first — so you can name what you need.
              Deeper care and practice apps are there if you want them; never
              required.
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="mt-3 max-w-md text-sm leading-relaxed text-ink-dim"
            >
              Quiet when life is loud. Present when it matters.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Magnetic strength={0.3} className="inline-flex">
                <Button href="/ask" size="lg">
                  Ask for orientation
                </Button>
              </Magnetic>
              <Button href="#suite" size="lg" variant="secondary">
                Explore the suite
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -8 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 0,
              transition: { duration: DUR.cinematic, ease: EASE.cinematic, delay: 0.2 },
            }}
            viewport={viewportOnce}
            className="relative mx-auto aspect-square w-full max-w-[520px]"
          >
            <div
              className="absolute inset-8 rounded-full bg-aurora-iris/30 blur-[80px]"
              aria-hidden
            />
            <MorphBlob
              from="#c4b0ff"
              to="#7ee8c8"
              speed={1.4}
              distort={0.42}
              className="absolute inset-0"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ink-dim"
        >
          <div className="flex flex-col items-center gap-2 text-xs uppercase tracking-[0.2em]">
            <span>Scroll</span>
            <span className="h-8 w-px bg-gradient-to-b from-aurora-lavender to-transparent" />
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
