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

const wordChild: Variants = {
  hidden: { opacity: 0, y: "0.6em", rotateX: -45, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)",
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
      style={{ perspective: 800 }}
      variants={wordParent}
      custom={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      transition={{ delay }}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className={`inline-block ${wordClassName ?? ""}`}
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
