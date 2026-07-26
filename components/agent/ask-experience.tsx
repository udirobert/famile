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
import { useLatestPosture } from "@/lib/agent/network";

// Conversational posture — what the orb is doing right now, driven by the
// conversation itself (instant) or the network (5s poll, for cross-surface
// sync when the person is idle). The three conversational states are the
// only ones the orb visualizes dramatically; the full 10-posture vocabulary
// lives in the data layer for the feed and the care-team surface.
type OrbPosture = "steady" | "inquiry" | "offering";

// Dramatic, perceivable differences. A judge should see the orb change state
// without being told what to look for. Colors shift with posture, not just
// speed and distortion.
const postureOrb: Record<
  OrbPosture,
  {
    speed: number;
    distort: number;
    aura: string;
    glow: string;
    from: string;
    to: string;
  }
> = {
  // Calm baseline. Slow, smooth, mint + lavender.
  steady: {
    speed: 1.2,
    distort: 0.35,
    aura: "bg-aurora-mint/20",
    glow: "rgba(126,232,200,0.18)",
    from: "#7ee8c8",
    to: "#c4b0ff",
  },
  // The person is asking. Fast, turbulent, pink + lavender. Visibly agitated.
  inquiry: {
    speed: 3.2,
    distort: 0.62,
    aura: "bg-aurora-lavender/40",
    glow: "rgba(196,176,255,0.35)",
    from: "#ffb8e0",
    to: "#c4b0ff",
  },
  // Mira is responding. Slow, warm, amber + mint. A visible exhale.
  offering: {
    speed: 0.7,
    distort: 0.28,
    aura: "bg-aurora-amber/35",
    glow: "rgba(255,197,129,0.30)",
    from: "#ffc581",
    to: "#7ee8c8",
  },
};

// Map the full network posture vocabulary to the three orb states. Network
// postures that don't have a dramatic orb representation fall back to steady
// (the orb stays calm when the person isn't actively talking here).
function networkToOrb(p: string | null): OrbPosture {
  if (p === "inquiry") return "inquiry";
  if (p === "offering" || p === "holding" || p === "watching") return "offering";
  return "steady";
}

export function AskExperience() {
  const reduced = useReducedMotion();
  const [resting, setResting] = useState(false);
  const [conversational, setConversational] = useState<OrbPosture>("steady");
  const [memoryBloom, setMemoryBloom] = useState(false);
  const endRest = useCallback(() => setResting(false), []);
  const breathCycle = INHALE_MS + EXHALE_MS;

  // Network posture — for cross-surface sync when the person is idle on
  // this surface. When they're actively talking here, the conversational
  // posture takes over (instant, no 5s lag).
  const { posture: networkPosture } = useLatestPosture();

  // Memory bloom: when the conversation hydrates from Base44, the orb
  // briefly blooms warm amber, then settles. A wordless "I was here."
  const handleMemory = useCallback(() => {
    setMemoryBloom(true);
    const t = setTimeout(() => setMemoryBloom(false), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!resting) return;
    const t = window.setTimeout(endRest, REST_MS);
    return () => window.clearTimeout(t);
  }, [resting, endRest]);

  // Conversational posture is primary. When idle (steady), fall back to the
  // network posture so a transition on another surface still ripples here.
  // Memory bloom overrides everything briefly on hydration.
  const basePosture: OrbPosture =
    conversational !== "steady"
      ? conversational
      : networkToOrb(networkPosture);
  const activePosture = memoryBloom ? "offering" : basePosture;
  const orb = postureOrb[activePosture];

  // During memory bloom, intensify the glow for a warmer welcome.
  const glowOverride = memoryBloom
    ? "rgba(255,197,129,0.45)"
    : orb.glow;

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-x-clip pt-28 pb-16">
      <AuroraCanvas
        className="absolute inset-0 -z-10"
        intensity={resting ? 0.82 : 1.15}
      />
      <div className="absolute inset-0 -z-10 bg-canvas/20" aria-hidden />

      <Container className="relative w-full">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-ink-dim transition-colors hover:text-ink-muted"
          >
            ← famile
          </Link>
          <ShareSessionLink />
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
              style={{
                transition: "box-shadow 1.2s var(--ease-soft)",
                boxShadow: resting ? "none" : `0 0 100px -10px ${glowOverride}`,
              }}
            >
              <div
                className={cn(
                  "absolute rounded-full blur-[80px] transition-all duration-1000",
                  resting ? "inset-2" : "inset-4",
                  resting
                    ? "bg-aurora-mint/25"
                    : memoryBloom
                      ? "bg-aurora-amber/45"
                      : orb.aura,
                )}
                aria-hidden
              />
              <div className="absolute inset-0 p-[6%] sm:p-[8%]">
                <MorphBlob
                  from={resting ? "#7ee8c8" : orb.from}
                  to={resting ? "#c4b0ff" : orb.to}
                  speed={resting ? 0.55 : orb.speed}
                  distort={resting ? 0.28 : orb.distort}
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
              onPosture={setConversational}
              onMemory={handleMemory}
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

// A share link that puts the session key in the URL. Open famile.xyz/ask,
// ask Mira something, click share, open the link in another tab or browser,
// the same conversation is there. This is the cross-product browser moment.
function ShareSessionLink() {
  const [copied, setCopied] = useState(false);

  function share() {
    fetch("/api/agent/share")
      .then((r) => r.json())
      .then((data) => {
        if (!data.session_key) return;
        const url = new URL(window.location.href);
        url.searchParams.set("session", data.session_key);
        navigator.clipboard.writeText(url.toString()).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      })
      .catch(() => {});
  }

  return (
    <button
      type="button"
      onClick={share}
      className="text-xs text-ink-dim transition-colors hover:text-ink-muted"
    >
      {copied ? "link copied" : "share"}
    </button>
  );
}
