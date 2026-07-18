"use client";

import { useCallback } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { AuroraCanvas } from "@/components/motion/aurora-canvas";
import { MorphBlob } from "@/components/motion/morph-blob";
import { Magnetic } from "@/components/motion/magnetic-button";
import { MiraConversation } from "@/components/agent/mira-conversation";
import { EASE, DUR, stagger, fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function Hero() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduced = useReducedMotion();
  const mira = searchParams.get("mira") === "1";

  const openMira = useCallback(() => {
    router.replace("/?mira=1", { scroll: false });
  }, [router]);

  const closeMira = useCallback(() => {
    router.replace("/", { scroll: false });
  }, [router]);

  return (
    <section
      id="mira"
      className="relative flex min-h-[100svh] items-center overflow-x-clip pt-24 pb-16"
    >
      <AuroraCanvas className="absolute inset-0 -z-10" intensity={mira ? 1.15 : 1} />
      <div className="absolute inset-0 -z-10 bg-canvas/20" aria-hidden />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-b from-transparent to-canvas"
        aria-hidden
      />

      <Container className="relative w-full">
        <LayoutGroup id="hero-mira">
          <div
            className={cn(
              "grid items-center gap-10 lg:gap-14",
              mira
                ? "lg:grid-cols-[0.85fr_1.15fr]"
                : "lg:grid-cols-[1.05fr_0.95fr]",
            )}
          >
            <div
              className={cn(
                "relative min-w-0",
                mira && "lg:order-2",
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                {!mira ? (
                  <motion.div
                    key="space"
                    variants={stagger}
                    initial="hidden"
                    animate="visible"
                    exit={{
                      opacity: 0,
                      y: -12,
                      filter: "blur(8px)",
                      transition: {
                        duration: reduced ? 0 : 0.35,
                        ease: EASE.soft,
                      },
                    }}
                    className="max-w-xl"
                  >
                    <motion.h1
                      variants={fadeUp}
                      className="font-display text-6xl italic leading-[1.12] tracking-[-0.03em] sm:text-7xl lg:text-8xl"
                    >
                      <span className="text-aurora-gradient text-luminous inline-block px-1 -mx-1">
                        famile
                      </span>
                    </motion.h1>

                    <motion.p
                      variants={fadeUp}
                      className="mt-8 max-w-sm text-lg leading-relaxed text-ink-muted"
                    >
                      A warm place to peruse — or just be.
                    </motion.p>

                    <motion.div variants={fadeUp} className="mt-10">
                      <Magnetic strength={0.3} className="inline-flex">
                        <motion.div layoutId={reduced ? undefined : "mira-shell"}>
                          <Button type="button" size="lg" onClick={openMira}>
                            Ask Mira
                          </Button>
                        </motion.div>
                      </Magnetic>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="mira-field"
                    initial={
                      reduced
                        ? false
                        : { opacity: 0, y: 16, filter: "blur(10px)" }
                    }
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{
                      opacity: 0,
                      filter: "blur(8px)",
                      transition: { duration: 0.25 },
                    }}
                    transition={{ duration: DUR.slow, ease: EASE.soft }}
                    className="flex min-h-[420px] flex-col"
                  >
                    <motion.div
                      layoutId={reduced ? undefined : "mira-shell"}
                      className="flex min-h-[420px] flex-1 flex-col"
                      transition={{ duration: DUR.slow, ease: EASE.soft }}
                    >
                      <MiraConversation
                        autoFocus
                        onClose={closeMira}
                        className="min-h-[420px]"
                      />
                    </motion.div>
                    <p className="mt-3 text-xs text-ink-dim">
                      Not medical advice. Keep personal health details private.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              layout={!reduced}
              className={cn(
                "relative mx-auto w-full",
                mira ? "max-w-[560px] lg:order-1 lg:max-w-none" : "max-w-[480px]",
              )}
              transition={{ duration: DUR.cinematic, ease: EASE.cinematic }}
            >
              <motion.div
                layoutId={reduced ? undefined : "mira-orb"}
                className="relative mx-auto aspect-square w-full"
                animate={mira ? { scale: 1.06 } : { scale: 1 }}
                transition={{ duration: DUR.cinematic, ease: EASE.cinematic }}
              >
                <div
                  className={cn(
                    "absolute rounded-full bg-aurora-iris/30 blur-[80px]",
                    mira ? "inset-4" : "inset-10",
                  )}
                  aria-hidden
                />
                <div className="absolute inset-0 p-[6%] sm:p-[8%]">
                  <MorphBlob
                    from={mira ? "#7ee8c8" : "#c4b0ff"}
                    to={mira ? "#c4b0ff" : "#7ee8c8"}
                    speed={mira ? 1.7 : 1.4}
                    distort={mira ? 0.48 : 0.42}
                    className="absolute inset-0"
                  />
                </div>
              </motion.div>
              {mira && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-ink-dim"
                >
                  Mira
                </motion.p>
              )}
            </motion.div>
          </div>
        </LayoutGroup>

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
