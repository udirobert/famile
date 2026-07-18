"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { provenance } from "@/lib/agent/replay";
import type { ProductSlug } from "@/lib/products";

// An expandable "why?" affordance under a metric, revealing the agent's
// source and reasoning for that claim. Honest by construction: the claim is
// surfaced alongside how it was reasoned, not as an unattributed number.
export function ProvenanceAffordance({
  slug,
  claim,
}: {
  slug: ProductSlug;
  claim: string;
}) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const entry = provenance[slug].find((p) => p.claim === claim);

  if (!entry) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-[10px] uppercase tracking-[0.16em] text-ink-dim transition-colors hover:text-ink-muted"
        aria-expanded={open}
      >
        {open ? "hide reasoning" : "why?"}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-[var(--radius-md)] border border-dashed border-line-strong p-3 text-left">
              <p className="text-[10px] uppercase tracking-[0.16em] text-ink-dim">
                source
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">{entry.source}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-ink-dim">
                reasoning
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                {entry.reasoning}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
