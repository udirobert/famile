"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Container } from "@/components/ui/container";
import { MorphBlob } from "@/components/motion/morph-blob";
import { ParallaxLayer } from "@/components/motion/parallax-layer";

export function ExperienceSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const blobScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.1, 0.9]);
  const blobRotate = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[120vh] items-center overflow-hidden py-32"
    >
      <motion.div
        style={{ scale: blobScale, rotate: blobRotate }}
        className="absolute left-1/2 top-1/2 aspect-square w-[80vw] max-w-[720px] -translate-x-1/2 -translate-y-1/2 opacity-60"
        aria-hidden
      >
        <MorphBlob
          from="#c4b0ff"
          to="#ffb8e0"
          speed={1.0}
          distort={0.5}
          className="absolute inset-0"
        />
      </motion.div>

      <div
        className="absolute inset-0 bg-canvas/60 backdrop-blur-sm"
        aria-hidden
      />

      <Container className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <ParallaxLayer speed={-0.15}>
            <p className="font-display text-5xl leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl">
              Calm enough to{" "}
              <span className="text-aurora-gradient text-luminous">live with.</span>
            </p>
          </ParallaxLayer>

          <div className="my-16 h-px w-full bg-gradient-to-r from-transparent via-line-strong to-transparent" />

          <ParallaxLayer speed={0.15}>
            <p className="font-display text-5xl leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl">
              Energising enough to{" "}
              <span className="text-aurora-gradient text-luminous">act on.</span>
            </p>
          </ParallaxLayer>

          <div className="mx-auto mt-20 max-w-xl">
            <p className="text-lg leading-relaxed text-ink-muted">
              Every famile product is shaped by this tension. Restful by
              default, so it never adds to the noise of care. Kinetic the
              moment it matters, so the right action arrives in time.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
