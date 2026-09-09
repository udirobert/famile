"use client";

import { motion, type Variants } from "motion/react";
import { EASE, DUR, viewportOnce } from "@/lib/motion";

type TextRevealProps = {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  stagger?: number;
};

const wordParent: Variants = {
  hidden: {},
  visible: (stagger: number = 0.08) => ({
    transition: { staggerChildren: stagger, delayChildren: 0.05 },
  }),
};

// No filter: blur() here — animating blur on display type forces a repaint
// every frame. y + opacity composite on the GPU and read just as soft.
const wordChild: Variants = {
  hidden: { opacity: 0, y: "0.55em" },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.base, ease: EASE.soft },
  },
};

export function TextReveal({
  text,
  className,
  wordClassName,
  delay = 0,
  as = "div",
  stagger = 0.08,
}: TextRevealProps) {
  const words = text.split(" ");
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      variants={wordParent}
      custom={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      transition={{ delay }}
    >
      {words.map((word, i) => (
        // Generous clip pad so italic descenders / blur never get shaved
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom py-[0.18em] [-webkit-box-decoration-break:clone] [box-decoration-break:clone]"
        >
          <motion.span
            className={`inline-block will-change-transform ${wordClassName ?? ""}`}
            variants={wordChild}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
