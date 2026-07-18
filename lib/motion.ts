import type { Variants } from "motion/react";

export const EASE = {
  soft: [0.22, 1, 0.36, 1] as const,
  energise: [0.34, 1.56, 0.64, 1] as const,
  cinematic: [0.16, 1, 0.3, 1] as const,
  linear: [0, 0, 1, 1] as const,
};

export const DUR = {
  fast: 0.2,
  base: 0.4,
  slow: 0.8,
  cinematic: 1.2,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE.soft } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DUR.slow, ease: EASE.soft } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: DUR.slow, ease: EASE.energise } },
};

export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const staggerSlow: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.16, delayChildren: 0.15 } },
};

export const viewportOnce = { once: true, margin: "-10% 0px -10% 0px" } as const;
