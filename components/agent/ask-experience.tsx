"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { AuroraCanvas } from "@/components/motion/aurora-canvas";
import { MorphBlob } from "@/components/motion/morph-blob";
import { MiraConversation } from "@/components/agent/mira-conversation";
import { DUR, EASE } from "@/lib/motion";

export function AskExperience() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-x-clip pt-28 pb-16">
      <AuroraCanvas className="absolute inset-0 -z-10" intensity={1.15} />
      <div className="absolute inset-0 -z-10 bg-canvas/20" aria-hidden />

      <Container className="relative w-full">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-ink-dim transition-colors hover:text-ink-muted"
          >
            ← famile
          </Link>
        </div>
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: DUR.cinematic, ease: EASE.cinematic }}
            className="relative mx-auto aspect-square w-full max-w-[560px] lg:order-1"
          >
            <div
              className="absolute inset-4 rounded-full bg-aurora-mint/25 blur-[80px]"
              aria-hidden
            />
            <div className="absolute inset-0 p-[6%] sm:p-[8%]">
              <MorphBlob
                from="#7ee8c8"
                to="#c4b0ff"
                speed={1.7}
                distort={0.48}
                className="absolute inset-0"
              />
            </div>
            <p className="mt-2 text-center text-xs uppercase tracking-[0.2em] text-ink-dim lg:absolute lg:inset-x-0 lg:-bottom-6">
              Mira
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: DUR.slow, ease: EASE.soft }}
            className="flex min-h-[420px] flex-col lg:order-2"
          >
            <MiraConversation autoFocus className="min-h-[480px]" />
            <p className="mt-3 text-xs text-ink-dim">
              Not medical advice. Keep personal health details private.
            </p>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
