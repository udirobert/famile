// Warms the WebGL chunks (three.js ≈ 1 MB) while the browser is idle, so the
// first orb/aurora mount doesn't wait on a network fetch. The specifiers
// match the next/dynamic calls in hero/ask/product-detail — same chunks.
export function preloadMotionChunks() {
  const whenIdle = (fn: () => void) =>
    typeof window.requestIdleCallback === "function"
      ? window.requestIdleCallback(fn, { timeout: 4000 })
      : setTimeout(fn, 2500);
  whenIdle(() => {
    void import("@/components/motion/aurora-canvas");
    void import("@/components/motion/morph-blob");
  });
}
