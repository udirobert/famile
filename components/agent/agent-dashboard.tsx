"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { getProduct } from "@/lib/products";
import { replayTraces, replayDashboardEvents } from "@/lib/agent/replay";
import type { DashboardEvent } from "@/lib/agent/types";

type Product = "sukari" | "orbura";

const feedColor: Record<DashboardEvent["kind"], string> = {
  signal: "#8b7fe8",
  action: "#ffc581",
  report: "#7ee8c8",
};

const focusProducts: Product[] = ["sukari", "orbura"];

export function AgentDashboard() {
  const reduced = useReducedMotion();
  const [focusIdx, setFocusIdx] = useState(0);
  const [feedCount, setFeedCount] = useState(reduced ? replayDashboardEvents.length : 1);
  const [rehearsing, setRehearsing] = useState(false);
  const [rStep, setRStep] = useState(0);

  const focusProduct = focusProducts[focusIdx];
  const focusTrace = replayTraces[focusProduct];
  const focusMeta = getProduct(focusProduct);
  const decideStep = focusTrace.steps.find((s) => s.kind === "decide");
  const feed = replayDashboardEvents.slice(0, feedCount);
  // Reduced motion: show the full rehearse trace (derived, no setState-in-effect).
  const shownStep = reduced ? focusTrace.steps.length : rStep;

  const rehearse = useCallback(() => {
    setRehearsing(true);
    setRStep(0);
  }, []);

  const stopRehearse = useCallback(() => setRehearsing(false), []);

  // Cycle today's focus every 9s (pause while rehearsing).
  useEffect(() => {
    if (reduced || rehearsing) return;
    const t = setTimeout(
      () => setFocusIdx((i) => (i + 1) % focusProducts.length),
      9000,
    );
    return () => clearTimeout(t);
  }, [focusIdx, reduced, rehearsing]);

  // Append to the "what shifted" feed every 5s.
  useEffect(() => {
    if (reduced || feedCount >= replayDashboardEvents.length) return;
    const t = setTimeout(() => setFeedCount((c) => c + 1), 5000);
    return () => clearTimeout(t);
  }, [feedCount, reduced]);

  // Rehearse: reveal the full trace step by step, then complete.
  useEffect(() => {
    if (!rehearsing) return;
    if (reduced) {
      const t = setTimeout(stopRehearse, 6000);
      return () => clearTimeout(t);
    }
    const total = focusTrace.steps.length;
    if (rStep < total) {
      const t = setTimeout(() => setRStep((s) => s + 1), 1300);
      return () => clearTimeout(t);
    }
    const t = setTimeout(stopRehearse, 2000);
    return () => clearTimeout(t);
  }, [rehearsing, rStep, reduced, focusTrace.steps.length, stopRehearse]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      {/* Today's focus */}
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-line-strong bg-canvas-elevated/40 p-8 backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-dim">
            Today&apos;s focus
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-ink-dim">
            <span className="h-1 w-1 rounded-full bg-aurora-amber" />
            recorded session
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: focusMeta.accent }}
          />
          <span className="font-display text-2xl tracking-tight">
            {focusMeta.name}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {!rehearsing ? (
            <motion.div
              key={`focus-${focusProduct}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: reduced ? 0 : 0.5 }}
            >
              <p className="mt-4 font-display text-2xl leading-snug tracking-tight text-ink">
                {decideStep?.text}
              </p>
              <button
                onClick={rehearse}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-aurora-amber/40 bg-aurora-amber/10 px-5 py-2 text-sm text-ink transition-colors hover:bg-aurora-amber/20"
              >
                Rehearse before it counts
                <span aria-hidden>→</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="rehearse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 space-y-2"
            >
              {focusTrace.steps.slice(0, shownStep).map((s, i) => (
                <motion.div
                  key={i}
                  initial={reduced ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: reduced ? 0 : 0.4 }}
                  className="rounded-[var(--radius-md)] border border-line px-3 py-2"
                >
                  <span className="text-[10px] uppercase tracking-[0.16em] text-ink-dim">
                    {s.label}
                  </span>
                  <p className="text-sm text-ink-muted">{s.text}</p>
                </motion.div>
              ))}
              {shownStep >= focusTrace.steps.length && (
                <p className="pt-2 text-xs text-aurora-mint">
                  Practice complete. Care team will only hear if it shifts.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* What shifted */}
      <div className="flex flex-col rounded-[var(--radius-xl)] border border-line-strong bg-canvas-elevated/40 p-8 backdrop-blur-xl">
        <p className="mb-6 text-xs uppercase tracking-[0.18em] text-ink-dim">
          What shifted
        </p>
        <div className="flex-1 space-y-3">
          <AnimatePresence initial={false}>
            {feed
              .slice()
              .reverse()
              .map((ev, i) => {
                const color = feedColor[ev.kind];
                return (
                  <motion.div
                    key={`${feed.length - i}`}
                    initial={reduced ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: reduced ? 0 : 0.4 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                        style={{ background: color }}
                      />
                      <div>
                        <span
                          className="text-[10px] uppercase tracking-[0.16em]"
                          style={{ color }}
                        >
                          {ev.kind}
                        </span>
                        <p className="text-sm leading-relaxed text-ink-muted">
                          {ev.text}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
        {feedCount < replayDashboardEvents.length && !reduced && (
          <motion.p
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="mt-4 text-[10px] uppercase tracking-[0.16em] text-ink-dim"
          >
            listening…
          </motion.p>
        )}
      </div>
    </div>
  );
}
