// A held line is an intention the person asked Mira to keep between visits.
// Deliberately device-local (localStorage) until a real account layer exists
// — the UI must say so, and must never imply cross-product memory the
// backend doesn't have (see docs/MIRA.md).

const KEY = "famile.held";
const SELF_EVENT = "famile:held";

export type Held = { text: string; at: string };

export function subscribeHeld(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(SELF_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SELF_EVENT, onChange);
  };
}

export function getHeldSnapshot(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function getServerHeldSnapshot(): string {
  return "";
}

export function parseHeld(raw: string): Held | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Held>;
    if (typeof parsed.text !== "string" || typeof parsed.at !== "string")
      return null;
    return { text: parsed.text.slice(0, 500), at: parsed.at };
  } catch {
    return null;
  }
}

export function saveHeld(held: Held | null) {
  try {
    if (held) window.localStorage.setItem(KEY, JSON.stringify(held));
    else window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(SELF_EVENT));
  } catch {
    // Private-mode or quota: holding quietly unavailable, conversation fine.
  }
}
