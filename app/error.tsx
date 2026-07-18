"use client";

import type { ErrorInfo } from "next/error";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  unstable_retry,
}: ErrorInfo) {
  return (
    <div className="relative flex min-h-screen items-center">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-canvas"
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 aspect-square w-[80vw] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(196,176,255,0.20), transparent 70%)",
        }}
      />
      <Container className="text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-ink-dim">
          Something diverged
        </p>
        <h1 className="mt-4 font-display text-6xl tracking-tight sm:text-7xl">
          An{" "}
          <span className="text-aurora-gradient text-luminous">
            exception.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-ink-muted">
          The page encountered an unexpected state. Like everything in famile,
          we surface it clearly - then offer a path back.
        </p>
        {error?.message && (
          <pre className="mx-auto mt-6 max-w-md overflow-x-auto rounded-[var(--radius-md)] border border-line bg-canvas-elevated/40 p-4 text-left text-xs text-ink-dim">
            {error.message}
          </pre>
        )}
        <div className="mt-10 flex justify-center gap-3">
          <Button onClick={() => unstable_retry()}>Try again</Button>
          <Button href="/" variant="secondary" transitionTypes={["nav-back"]}>
            Back to site
          </Button>
        </div>
      </Container>
    </div>
  );
}
