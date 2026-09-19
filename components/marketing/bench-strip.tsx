"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Run = { title: string; url: string; date: string };
type BenchResponse = { kytos?: { runs?: Run[] } };

// Reads the cached /api/bench proxy client-side so the home page stays
// static. Renders nothing until (and unless) real runs arrive.
export function BenchStrip() {
  const [runs, setRuns] = useState<Run[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/bench")
      .then((r) => (r.ok ? (r.json() as Promise<BenchResponse>) : null))
      .then((d) => {
        if (!cancelled && d?.kytos?.runs?.length)
          setRuns(d.kytos.runs.slice(0, 3));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!runs) return null;

  return (
    <div className="mt-6 rounded-xl border border-line bg-canvas-elevated/30 p-5 backdrop-blur-xl sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-ink-dim">
          Latest from the Observatory
        </p>
        <Link
          href="/research"
          transitionTypes={["nav-forward"]}
          className="text-xs text-ink-muted transition-colors hover:text-ink"
        >
          full ledger →
        </Link>
      </div>
      <ul className="space-y-2.5">
        {runs.map((r) => (
          <li key={r.url} className="flex items-baseline justify-between gap-4">
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm text-ink transition-opacity hover:opacity-80"
            >
              {r.title}
            </a>
            <span className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-ink-dim">
              {r.date.slice(5, 16)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
