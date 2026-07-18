"use client";

import { useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { AuroraCanvas } from "@/components/motion/aurora-canvas";
import { MorphBlob } from "@/components/motion/morph-blob";
import { Magnetic } from "@/components/motion/magnetic-button";
import { MiraConversation } from "@/components/agent/mira-conversation";
import { EASE, DUR, stagger, fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Open transition notes (why this is simpler than layoutId morphs):
 * - Button→panel layoutId across a 40px→420px jump reads as jank.
 * - CSS order swap + grid col change + layout animation fight each other.
 * - Autofocus without preventScroll was scrolling the page to the input.
 * Crossfade in a stable grid; orb only gently scales in place.
 */
export function Hero() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduced = useReducedMotion();
  const mira = searchParams.get("mira") === "1";

  const openMira = useCallback(() => {
    // Hold scroll where it is (usually top of hero) through the URL update.
    const y = window.scrollY;
    router.replace("/?mira=1", { scroll: false });
    requestAnimationFrame(() => {
      window.scrollTo({ top: y, left: 0, behavior: "instant" });
    });
  }, [router]);

  const closeMira = useCallback(() => {
    const y = window.scrollY;
    router.replace("/", { scroll: false });
    requestAnimationFrame(() => {
      window.scrollTo({ top: Math.min(y, 80), left: 0, behavior: "instant" });
    });
  }, [router]);

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] items-center overflow-x-clip pt-24 pb-16"
    >
      <AuroraCanvas className="absolute inset-0 -z-10" intensity={mira ? 1.12 : 1} />
      <div className="absolute inset-0 -z-10 bg-canvas/20" aria-hidden />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-b from-transparent to-canvas"
        aria-hidden
      />

      <Container className="relative w-full">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* Stable left column — brand and Mira field crossfade in place */}
          <div className="relative min-h-[280px] min-w-0 sm:min-h-[320px] lg:min-h-[440px]">
            <AnimatePresence mode="sync" initial={false}>
              {!mira ? (
                <motion.div
                  key="space"
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  exit={{
                    opacity: 0,
                    y: -8,
                    transition: {
                      duration: reduced ? 0 : 0.28,
                      ease: EASE.soft,
                    },
                  }}
                  className="absolute inset-0 flex flex-col justify-center"
                >
                  <motion.h1
                    variants={fadeUp}
                    className="font-display text-6xl italic leading-[1.2] tracking-[-0.02em] sm:text-7xl lg:text-8xl"
                  >
                    {/* Extra end padding: background-clip:text + italic clips the last glyph */}
                    <span className="text-aurora-gradient text-luminous inline-block pr-[0.18em]">
                      famile
                    </span>
                  </motion.h1>

                  <motion.p
                    variants={fadeUp}
                    className="mt-8 max-w-sm text-lg leading-relaxed text-ink-muted"
                  >
                    A quiet field for attention — and what follows from it.
                  </motion.p>

                  <motion.div variants={fadeUp} className="mt-10">
                    <Magnetic strength={0.3} className="inline-flex">
                      <Button type="button" size="lg" onClick={openMira}>
                        Ask Mira
                      </Button>
                    </Magnetic>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="mira-field"
                  initial={
                    reduced
                      ? false
                      : { opacity: 0, y: 10 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: 6,
                    transition: { duration: 0.22, ease: EASE.soft },
                  }}
                  transition={{ duration: DUR.base, ease: EASE.soft, delay: reduced ? 0 : 0.06 }}
                  className="absolute inset-0 flex flex-col"
                >
                  <MiraConversation
                    autoFocus
                    onClose={closeMira}
                    className="min-h-0 flex-1"
                  />
                  <p className="mt-3 shrink-0 text-xs text-ink-dim">
                    Not medical advice. Keep personal health details private.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Orb stays put — only a quiet presence shift when Mira opens */}
          <div className="relative mx-auto w-full max-w-[480px]">
            <motion.div
              className="relative mx-auto aspect-square w-full"
              animate={
                reduced
                  ? undefined
                  : mira
                    ? { scale: 1.04 }
                    : { scale: 1 }
              }
              transition={{ duration: DUR.slow, ease: EASE.soft }}
            >
              <div
                className={cn(
                  "absolute rounded-full blur-[80px] transition-all duration-700",
                  mira
                    ? "inset-6 bg-aurora-mint/30"
                    : "inset-10 bg-aurora-iris/30",
                )}
                aria-hidden
              />
              <div className="absolute inset-0 p-[8%]">
                <MorphBlob
                  from="#c4b0ff"
                  to="#7ee8c8"
                  speed={mira ? 1.55 : 1.4}
                  distort={mira ? 0.45 : 0.42}
                  className="absolute inset-0"
                />
              </div>
            </motion.div>
            <p
              className={cn(
                "mt-3 text-center text-xs uppercase tracking-[0.2em] text-ink-dim transition-opacity duration-500",
                mira ? "opacity-100" : "opacity-0",
              )}
              aria-hidden={!mira}
            >
              Mira
            </p>
          </div>
        </div>

        {!mira && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-ink-dim"
          >
            <div className="flex flex-col items-center gap-2 text-xs uppercase tracking-[0.2em]">
              <span>Scroll</span>
              <span className="h-8 w-px bg-gradient-to-b from-aurora-lavender to-transparent" />
            </div>
          </motion.div>
        )}
      </Container>
    </section>
  );
}
