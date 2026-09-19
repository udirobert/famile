"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { CssOrb } from "@/components/motion/css-orb";
import { INHALE_MS, EXHALE_MS } from "@/lib/agent/sit";
import { getHeldSnapshot, parseHeld, saveHeld } from "@/lib/agent/held";
import { EASE, DUR, stagger, fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

const TOTAL_S = 90;
const BREATH_S = (INHALE_MS + EXHALE_MS) / 1000;
const INHALE_S = INHALE_MS / 1000;
const R = 88;
const CIRC = 2 * Math.PI * R;

type Phase = "name" | "run" | "hold";

function clock(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * The 90-second wedge: one small action, one guided breath loop, one held
 * line. Everything runs in the browser — the copy must never imply an account,
 * a server, or health tracking that doesn't exist here.
 */
export function PracticeRun({ onClose }: { onClose: () => void }) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("name");
  const [action, setAction] = useState("");
  const [left, setLeft] = useState(TOTAL_S);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (phase !== "run") return;
    const t0 = performance.now();
    const id = window.setInterval(() => {
      const remaining = Math.max(
        0,
        TOTAL_S - Math.floor((performance.now() - t0) / 1000),
      );
      setLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(id);
        setPhase("hold");
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const elapsed = TOTAL_S - left;
  const inhaling = elapsed % BREATH_S < INHALE_S;
  const priorHeld = phase === "hold" ? parseHeld(getHeldSnapshot()) : null;
  const replaces = !!priorHeld && priorHeld.text !== `Practice: ${action}`;

  return (
    <div className="flex h-full flex-col justify-center">
      <AnimatePresence mode="wait" initial={false}>
        {phase === "name" && (
          <motion.div
            key="name"
            variants={stagger}
            initial="hidden"
            animate="visible"
            exit={{
              opacity: 0,
              y: -6,
              transition: { duration: reduced ? 0 : 0.2, ease: EASE.soft },
            }}
          >
            <motion.h2
              variants={fadeUp}
              className="font-display text-4xl italic tracking-tight sm:text-5xl"
            >
              Ninety seconds.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted"
            >
              Name one small thing you will actually do today. Then keep it in
              view while you breathe for ninety seconds.
            </motion.p>
            <motion.form
              variants={fadeUp}
              className="mt-8"
              onSubmit={(e) => {
                e.preventDefault();
                if (!action.trim()) return;
                setLeft(TOTAL_S);
                setStuck(false);
                setPhase("run");
              }}
            >
              <div className="flex items-center gap-3 rounded-full border border-line-strong bg-canvas-elevated/40 px-2 py-2 backdrop-blur-xl focus-within:border-aurora-lavender/50">
                <input
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  maxLength={120}
                  placeholder="A glass of water. Ten deep breaths…"
                  aria-label="One small thing"
                  autoFocus
                  className="min-w-0 flex-1 bg-transparent px-3 py-1.5 text-sm text-ink placeholder:text-ink-dim focus:outline-none"
                />
                <Button type="submit" size="sm" disabled={!action.trim()}>
                  Begin
                </Button>
              </div>
            </motion.form>
            <motion.p
              variants={fadeUp}
              className="mt-4 text-xs text-ink-dim"
            >
              Runs in this browser. Nothing is sent.
            </motion.p>
          </motion.div>
        )}

        {phase === "run" && (
          <motion.div
            key="run"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: -6,
              transition: { duration: 0.2, ease: EASE.soft },
            }}
            transition={{ duration: DUR.base, ease: EASE.soft }}
            className="flex flex-col items-center"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-ink-dim">
              holding
            </p>
            <p className="mt-2 max-w-sm truncate text-center font-display text-xl italic tracking-tight text-ink">
              {action}
            </p>
            <div className="relative mt-8 aspect-square w-full max-w-[300px]">
              <motion.div
                className="absolute inset-[22%]"
                animate={
                  reduced
                    ? { scale: 1 }
                    : {
                        scale: [1, 1.14, 1],
                        transition: {
                          duration: BREATH_S,
                          times: [0, INHALE_S / BREATH_S, 1],
                          ease: "easeInOut",
                          repeat: Infinity,
                        },
                      }
                }
              >
                <CssOrb from="#7ee8c8" to="#c4b0ff" className="absolute inset-0" />
              </motion.div>
              <svg
                viewBox="0 0 200 200"
                className="absolute inset-0 h-full w-full -rotate-90"
                aria-hidden
              >
                <circle
                  cx="100"
                  cy="100"
                  r={R}
                  fill="none"
                  strokeWidth="1.5"
                  className="stroke-line"
                />
                <circle
                  cx="100"
                  cy="100"
                  r={R}
                  fill="none"
                  stroke="url(#practice-progress)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC * (left / TOTAL_S)}
                  style={{ transition: "stroke-dashoffset 0.3s linear" }}
                />
                <defs>
                  <linearGradient id="practice-progress" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#c4b0ff" />
                    <stop offset="100%" stopColor="#7ee8c8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-4xl tabular-nums tracking-tight text-ink">
                  {clock(left)}
                </span>
                <span
                  className={cn(
                    "mt-1 text-xs uppercase tracking-[0.2em] transition-opacity duration-700",
                    reduced ? "text-ink-dim" : inhaling ? "text-aurora-mint" : "text-aurora-lavender",
                  )}
                  aria-hidden
                >
                  {reduced ? "breathe" : inhaling ? "breathe in" : "breathe out"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setLeft(TOTAL_S);
                setPhase("name");
              }}
              className="mt-8 text-xs text-ink-dim transition-colors hover:text-ink"
            >
              end early
            </button>
          </motion.div>
        )}

        {phase === "hold" && (
          <motion.div
            key="hold"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: -6,
              transition: { duration: 0.2, ease: EASE.soft },
            }}
            transition={{ duration: DUR.base, ease: EASE.soft }}
            className="flex flex-col items-center text-center"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-aurora-mint">
              ninety seconds, done
            </p>
            <p className="mt-4 max-w-sm font-display text-2xl italic tracking-tight text-ink">
              {action}
            </p>
            {stuck ? (
              <>
                <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink-muted">
                  Held on this device. Mira will pick it up the next time you
                  talk.
                </p>
                <div className="mt-8 flex items-center gap-3">
                  <Button href="/ask" size="md">
                    Practice with Mira →
                  </Button>
                  <Button variant="ghost" size="md" onClick={onClose}>
                    Back to the field
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink-muted">
                  Keep it where you started it — this device. Mira will offer
                  it back on your next visit.
                </p>
                {replaces && (
                  <p className="mt-2 text-xs text-ink-dim">
                    Replaces the line Mira is currently holding.
                  </p>
                )}
                <div className="mt-8 flex items-center gap-3">
                  <Button
                    size="md"
                    onClick={() => {
                      saveHeld({
                        text: `Practice: ${action}`,
                        at: new Date().toISOString(),
                      });
                      setStuck(true);
                    }}
                  >
                    Hold this
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => {
                      setAction("");
                      setLeft(TOTAL_S);
                      setPhase("name");
                    }}
                  >
                    Another ninety
                  </Button>
                </div>
              </>
            )}
            <p className="mt-6 text-xs text-ink-dim">
              Runs in this browser. Nothing is sent.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
