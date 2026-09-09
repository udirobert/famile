import { cn } from "@/lib/utils";

/**
 * CSS orb — the zero-WebGL tier of the render budget (see
 * docs/EXPERIENCE_REVIEW.md §3.5). Used as the loading bloom while the WebGL
 * orb streams in, for reduced motion, and for small glyphs (product cards)
 * where a full GL context is overkill. Pure gradients + compositor-friendly
 * transform animation; the global reduced-motion rule stills it.
 */
export function CssOrb({
  from,
  to,
  className,
  animate = true,
}: {
  from: string;
  to: string;
  className?: string;
  animate?: boolean;
}) {
  return (
    <div className={cn("relative", className)} aria-hidden>
      <div
        className={cn(
          "absolute inset-[8%] rounded-full blur-md",
          animate && "css-orb-drift",
        )}
        style={{
          background: `radial-gradient(circle at 35% 30%, ${from}, ${to} 72%)`,
        }}
      />
      <div
        className={cn(
          "absolute inset-[22%] rounded-full opacity-70 blur-lg",
          animate && "css-orb-drift css-orb-drift-slow",
        )}
        style={{
          background: `radial-gradient(circle at 65% 70%, ${to}, transparent 70%)`,
        }}
      />
    </div>
  );
}
