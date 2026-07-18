/** Sit rest cadence — used by the hero orb easter egg. */

export const INHALE_MS = 4000;
export const EXHALE_MS = 6000;
/** How long the field holds before quietly returning to Mira. */
export const REST_MS = 90_000;

const SIT_RE =
  /\b(just sit|sit with me|sit (here|for)|just be|a minute|breathe with|rest (here|with)|hold (the )?space|stay (here|with))\b/i;

/** Client-side intent: visitor asking to rest in the field, not for product help. */
export function wantsSit(text: string): boolean {
  return SIT_RE.test(text.trim());
}
