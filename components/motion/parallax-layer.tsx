"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, type ReactNode } from "react";

type ParallaxLayerProps = {
  children: ReactNode;
  className?: string;
  speed?: number;
  axis?: "y" | "x";
};

export function ParallaxLayer({
  children,
  className,
  speed = 0.3,
  axis = "y",
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const distance = speed * 100;
  const transform = useTransform(
    scrollYProgress,
    [0, 1],
    [distance, -distance],
  ) as MotionValue<number>;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={axis === "y" ? { y: transform } : { x: transform }}
    >
      {children}
    </motion.div>
  );
}
