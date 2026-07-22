"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { AuroraCanvas } from "@/components/motion/aurora-canvas";
import { MorphBlob } from "@/components/motion/morph-blob";
import { MiraConversation } from "@/components/agent/mira-conversation";
import { EXHALE_MS, INHALE_MS, REST_MS } from "@/lib/agent/sit";
import { DUR, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function AskExperience() {
  const reduced = useReducedMotion();
  const [resting, setResting] = useState(false);
  const endRest = useCallback(() => setResting(false), []);
  const breathCycle = INHALE_MS + EXHALE_MS;

  useEffect(() => {
    if (!resting) return;
    const t = window.setTimeout(endRest, REST_MS);
    return () => window.clearTimeout(t);
  }, [resting, endRest]);

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-x-clip pt-28 pb-16">
      <AuroraCanvas
        className="absolute inset-0 -z-10"
        intensity={resting ? 0.82 : 1.15}
      />
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
            <motion.div
              className="relative mx-auto aspect-square w-full"
              animate={
                reduced
                  ? { scale: resting ? 1.04 : 1 }
                  : resting
                    ? {
                        scale: [1.02, 1.12, 1.02],
                        transition: {
                          duration: breathCycle / 1000,
                          times: [0, INHALE_MS / breathCycle, 1],
                          ease: "easeInOut",
                          repeat: Infinity,
                        },
                      }
                    : { scale: 1 }
              }
              transition={
                resting && !reduced
                  ? undefined
                  : { duration: DUR.slow, ease: EASE.soft }
              }
            >
              <div
                className={cn(
                  "absolute rounded-full bg-aurora-mint/25 blur-[80px] transition-all duration-700",
                  resting ? "inset-2" : "inset-4",
                )}
                aria-hidden
              />
              <div className="absolute inset-0 p-[6%] sm:p-[8%]">
                <MorphBlob
                  from="#7ee8c8"
                  to="#c4b0ff"
                  speed={resting ? 0.55 : 1.7}
                  distort={resting ? 0.28 : 0.48}
                  className="absolute inset-0"
                />
              </div>
            </motion.div>
            <p
              className={cn(
                "mt-2 text-center text-xs uppercase tracking-[0.2em] text-ink-dim transition-opacity duration-500 lg:absolute lg:inset-x-0 lg:-bottom-6",
                resting ? "opacity-0" : "opacity-100",
              )}
              aria-hidden={resting}
            >
              Mira
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: DUR.slow, ease: EASE.soft }}
            className="flex min-h-[420px] flex-col lg:order-2"
          >
            <MiraConversation
              autoFocus
              onSit={() => setResting(true)}
              resting={resting}
              onReturn={endRest}
              className="min-h-[480px]"
            />
            <p
              className={cn(
                "mt-3 text-xs text-ink-dim transition-opacity duration-500",
                resting && "opacity-0",
              )}
            >
              Not medical advice. Keep personal health details private.
            </p>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
