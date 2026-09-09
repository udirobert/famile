"use client";

import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef } from "react";
import { Container } from "@/components/ui/container";
import { getProduct, type ProductSlug } from "@/lib/products";
import { CssOrb } from "@/components/motion/css-orb";

/**
 * The experience section, rebuilt as a single-orb scrollytelling sequence
 * (docs/EXPERIENCE_REVIEW.md §4.3). One CSS orb morphs through the three
 * product accents while each aphorism arrives attached to a plain, checkable
 * sentence about what the product does. Zero WebGL contexts — the render
 * budget stays reserved for the hero orb and the aurora.
 */

type Phase = {
  slug: ProductSlug;
  line: string;
  body: string;
};

const phases: Phase[] = [
  {
    slug: "sukari",
    line: "Calm enough to live with.",
    body: "Sukari turns the day’s biomarker patterns into one doable action — and tells your care team only what shifted.",
  },
  {
    slug: "orbura",
    line: "Clear enough to act on.",
    body: "Orbura reads recovery signals days early, and adapts the plan to the week that happened.",
  },
  {
    slug: "ardum",
    line: "Steady enough to return to.",
    body: "Ardum holds an intention — rest, reconnection, retreat — and moves it forward one decision at a time.",
  },
];

// Scroll timing: each phase fades in over F, holds, fades out over F —
// except the first, which starts visible so the pinned field is never empty,
// and the last, which holds to the end. Transform inputs must be strictly
// increasing, hence the explicit windows.
const F = 0.06;
const WINDOWS: [number, number][] = [
  [0, 0.3],
  [0.36, 0.63],
  [0.69, 1],
];

function PhaseText({
  progress,
  index,
  phase,
}: {
  progress: MotionValue<number>;
  index: number;
  phase: Phase;
}) {
  const [visStart, visEnd] = WINDOWS[index];
  const product = getProduct(phase.slug);
  const first = index === 0;
  const last = index === phases.length - 1;
  const input = [visStart - F, visStart, visEnd, visEnd + F];

  const opacity = useTransform(progress, input, [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  const y = useTransform(progress, input, [first ? 0 : 32, 0, 0, last ? 0 : -32]);

  const words = phase.line.split(" ");
  const lead = words.slice(0, -2).join(" ");
  const tail = words.slice(-2).join(" ");

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col items-center justify-center text-center"
    >
      <p
        className="mb-6 inline-flex items-center rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em]"
        style={{ borderColor: `${product.accent}55`, color: product.accent }}
      >
        {product.name}
      </p>
      <p className="font-display text-5xl leading-[1.15] tracking-tight sm:text-7xl lg:text-8xl">
        {lead}{" "}
        <span className="text-aurora-gradient text-luminous inline-block px-0.5">
          {tail}
        </span>
      </p>
      <p className="mt-8 max-w-md text-base leading-relaxed text-ink-muted sm:text-lg">
        {phase.body}
      </p>
    </motion.div>
  );
}

function RailDot({
  progress,
  index,
}: {
  progress: MotionValue<number>;
  index: number;
}) {
  const [visStart, visEnd] = WINDOWS[index];
  const first = index === 0;
  const last = index === phases.length - 1;
  const opacity = useTransform(
    progress,
    [visStart - F, visStart, visEnd, visEnd + F],
    [first ? 1 : 0.25, 1, 1, last ? 1 : 0.25],
  );
  const product = getProduct(phases[index].slug);
  return (
    <motion.span
      style={{ opacity, background: product.accent }}
      className="h-1.5 w-6 rounded-full"
      aria-hidden
    />
  );
}

function ProgressRail({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2">
      {phases.map((phase, i) => (
        <RailDot key={phase.slug} progress={progress} index={i} />
      ))}
    </div>
  );
}

export function ExperienceSection() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // The orb takes each product's glyph color during its phase, then morphs
  // through the crossfade to the next: Sukari, Orbura, Ardum.
  const orbFrom = useTransform(
    scrollYProgress,
    [0, 0.3, 0.36, 0.63, 0.69, 1],
    ["#c4b0ff", "#7ee8c8", "#ffb8e0", "#ffc581", "#7ee8c8", "#ffc581"],
  );
  const orbTo = useTransform(
    scrollYProgress,
    [0, 0.3, 0.36, 0.63, 0.69, 1],
    ["#7ee8c8", "#c4b0ff", "#ffc581", "#ffb8e0", "#ffc581", "#7ee8c8"],
  );
  const orbBackground = useMotionTemplate`radial-gradient(circle at 35% 30%, ${orbFrom}, ${orbTo} 72%)`;
  const orbScale = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66, 1],
    [0.92, 1, 1.04, 1],
  );

  // Reduced motion: no pin, no scroll-jacking — the same three statements,
  // stacked and still.
  if (reduced) {
    return (
      <section className="relative py-32 sm:py-40">
        <Container>
          <div className="mx-auto max-w-3xl space-y-24 text-center">
            {phases.map((phase) => {
              const product = getProduct(phase.slug);
              return (
                <div key={phase.slug}>
                  <CssOrb
                    from={product.glyph.from}
                    to={product.glyph.to}
                    animate={false}
                    className="mx-auto mb-8 h-24 w-24"
                  />
                  <p
                    className="mb-4 inline-flex items-center rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em]"
                    style={{
                      borderColor: `${product.accent}55`,
                      color: product.accent,
                    }}
                  >
                    {product.name}
                  </p>
                  <p className="font-display text-4xl leading-[1.15] tracking-tight sm:text-5xl">
                    {phase.line}
                  </p>
                  <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-ink-muted">
                    {phase.body}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[340vh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        {/* The scroll-driven orb — one div, colors interpolated by scroll */}
        <motion.div
          style={{ scale: orbScale }}
          className="absolute left-1/2 top-1/2 aspect-square w-[70vw] max-w-[560px] -translate-x-1/2 -translate-y-1/2 opacity-50"
          aria-hidden
        >
          <motion.div
            className="absolute inset-[10%] rounded-full blur-2xl"
            style={{ background: orbBackground }}
          />
        </motion.div>
        <div
          className="absolute inset-0 bg-canvas/55 backdrop-blur-sm"
          aria-hidden
        />

        <Container className="relative z-10">
          <div className="relative mx-auto h-[70vh] max-w-4xl">
            {phases.map((phase, i) => (
              <PhaseText
                key={phase.slug}
                progress={scrollYProgress}
                index={i}
                phase={phase}
              />
            ))}
          </div>
        </Container>

        <ProgressRail progress={scrollYProgress} />
      </div>
    </section>
  );
}
