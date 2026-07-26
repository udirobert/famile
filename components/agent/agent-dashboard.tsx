"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { getProduct, products, type ProductSlug } from "@/lib/products";
import { replayTraces, replayDashboardEvents } from "@/lib/agent/replay";
import type { DashboardEvent } from "@/lib/agent/types";
import {
  useNetworkRealtime,
  type PostureEventRow,
} from "@/lib/agent/network";

const feedColor: Record<DashboardEvent["kind"], string> = {
  signal: "#8b7fe8",
  action: "#ffc581",
  report: "#7ee8c8",
};

const focusProducts: ProductSlug[] = products.map((p) => p.slug);

// Map a live posture event into the same shape as a replay dashboard event
// so the existing feed motion and styling work unchanged. The text is
// phrased in the product voice — operational, human, never a database log.
function postureEventToFeedItem(e: PostureEventRow): DashboardEvent {
  const product = e.surface as ProductSlug;
  const meta = getProduct(product);

  // Reaction-driven kind: settle/relief = report, bloom/pinch = action,
  // plain transition = signal.
  let kind: DashboardEvent["kind"] = "signal";
  if (e.reaction === "settle" || e.reaction === "relief") kind = "report";
  else if (e.reaction === "bloom" || e.reaction === "pinch") kind = "action";

  // Human-readable phrasing per posture transition. Maps the operational
  // vocabulary to the product voice — attention, stillness, return.
  let text: string;
  if (e.reaction === "bloom") {
    text = `${meta.name}: something landed.`;
  } else if (e.reaction === "pinch") {
    text = `${meta.name}: a setback absorbed.`;
  } else if (e.reaction === "settle") {
    text = `${meta.name}: settled.`;
  } else if (e.reaction === "relief") {
    text = `${meta.name}: relief.`;
  } else if (e.posture === "inquiry") {
    text = `${meta.name}: something being asked.`;
  } else if (e.posture === "offering") {
    text = `${meta.name}: something offered.`;
  } else if (e.posture === "holding") {
    text = `${meta.name}: held for later.`;
  } else if (e.posture === "watching") {
    text = `${meta.name}: watching.`;
  } else if (e.posture === "completed") {
    text = `${meta.name}: done.`;
  } else if (e.posture === "resolving") {
    text = `${meta.name}: re-forming.`;
  } else {
    text = `${meta.name}: ${e.posture}.`;
  }

  return { product, kind, text };
}

export function AgentDashboard() {
  const reduced = useReducedMotion();
  const { events: liveEvents, connected } = useNetworkRealtime(12);
  const [focusIdx, setFocusIdx] = useState(0);
  const [feedCount, setFeedCount] = useState(
    reduced ? replayDashboardEvents.length : 1,
  );
  const [rehearsing, setRehearsing] = useState(false);
  const [rStep, setRStep] = useState(0);

  const focusProduct = focusProducts[focusIdx];
  const focusTrace = replayTraces[focusProduct];
  const focusMeta = getProduct(focusProduct);
  const decideStep = focusTrace.steps.find((s) => s.kind === "decide");

  // When live events are available, the feed reads from Base44 posture
  // transitions; otherwise it falls back to the replay data. Same shape,
  // same motion, same styling — the data source is the only seam.
  const liveFeed = useMemo(
    () => liveEvents.map(postureEventToFeedItem),
    [liveEvents],
  );
  const usingLive = connected && liveFeed.length > 0;
  const feedSource = usingLive ? liveFeed : replayDashboardEvents;
  const feed = feedSource.slice(0, feedCount);

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

  // Append to the "what shifted" feed every 5s. When live, show all events
  // immediately (they arrive in real time from Base44).
  useEffect(() => {
    if (reduced || feedCount >= feedSource.length) return;
    const t = setTimeout(() => setFeedCount((c) => c + 1), 5000);
    return () => clearTimeout(t);
  }, [feedCount, reduced, feedSource.length]);

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
            <span
              className={`h-1 w-1 rounded-full ${usingLive ? "bg-aurora-mint animate-pulse" : "bg-aurora-amber"}`}
            />
            {usingLive ? "live" : "recorded session"}
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

      {/* What shifted — live when Base44 is connected, replay otherwise.
          Same motion, same styling, same shape. The data source is the only
          seam. */}
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
        {feedCount < feedSource.length && !reduced && (
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
