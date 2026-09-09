"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { sampleQA } from "@/lib/agent/replay";
import { wantsSit } from "@/lib/agent/sit";
import {
  products,
  type Product,
  type ProductSlug,
} from "@/lib/products";
import { EASE, DUR } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useVoiceInput } from "@/lib/agent/voice-input";
import { needsResearch } from "@/lib/research-intent";

type Msg = { role: "user" | "agent"; text: string };

function softMatches(text: string): Product[] {
  const lower = text.toLowerCase();
  return products.filter((p) => lower.includes(p.name.toLowerCase()));
}

type MiraConversationProps = {
  className?: string;
  /** Autofocus the field when the mira surface opens. */
  autoFocus?: boolean;
  onClose?: () => void;
  /** Fired once when sit intent is detected and the reply begins. */
  onSit?: () => void;
  /** Parent-owned rest mode — dims the panel; Return stays interactive. */
  resting?: boolean;
  onReturn?: () => void;
  /** Fired when the conversational posture changes. The orb uses this to
   * react *during* the conversation, not after a 5-second poll. */
  onPosture?: (posture: "inquiry" | "offering" | "steady") => void;
  /** Fired once when prior turns hydrate from Base44 on mount. The orb
   * uses this to bloom, signaling continuity without words. */
  onMemory?: () => void;
};

export function MiraConversation({
  className,
  autoFocus = false,
  onClose,
  onSit,
  resting = false,
  onReturn,
  onPosture,
  onMemory,
}: MiraConversationProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState<boolean | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const accRef = useRef("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sitFiredRef = useRef(false);
  const reduced = useReducedMotion();
  const voice = useVoiceInput(setInput);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Set once a question is sent this session, so hydrated history is not
  // announced on mount.
  const [started, setStarted] = useState(false);
  // Whether the last agent reply was grounded in the Firecrawl Research Index.
  const [grounded, setGrounded] = useState<boolean | null>(null);
  // Whether the current request is waiting on evidence retrieval.
  const [checking, setChecking] = useState(false);

  // Hydrate prior turns from the Base44 shared memory store on first mount.
  // When Base44 is not configured (local dev, or 503), this silently no-ops
  // and the conversation starts empty — the local engine path is stateless.
  // When a ?session=<key> URL parameter is present (share link), it's passed
  // to the history endpoint so the right conversation hydrates.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    let cancelled = false;
    const sessionParam = new URLSearchParams(window.location.search).get("session");
    const historyUrl = sessionParam
      ? `/api/agent/history?session=${encodeURIComponent(sessionParam)}`
      : "/api/agent/history";
    (async () => {
      try {
        const res = await fetch(historyUrl, { method: "GET" });
        if (!res.ok) return;
        const data = (await res.json()) as { turns?: { role: string; content: string }[] };
        if (cancelled || !data.turns || data.turns.length === 0) return;
        setMessages(
          data.turns.map((t) => ({
            role: t.role === "user" ? "user" : "agent",
            text: t.content,
          })),
        );
        // Signal the orb that memory hydrated — a warm bloom to say
        // "I was here" without words.
        onMemory?.();
      } catch {
        // Non-fatal: start with an empty conversation.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onMemory]);

  useEffect(() => {
    if (!autoFocus || resting) return;
    // preventScroll: focusing the input was yanking the page mid-viewport on open
    inputRef.current?.focus({ preventScroll: true });
  }, [autoFocus, resting]);

  // Keep the latest exchange in view while replies stream in.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Auto-grow the composer up to ~5 lines, then let it scroll.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  async function send(q: string) {
    const query = q.trim();
    if (!query || busy || resting) return;
    setStarted(true);
    setGrounded(null);
    setChecking(needsResearch(query));
    const sit = wantsSit(query);
    sitFiredRef.current = false;
    setInput("");
    setMessages((m) => [
      ...m,
      { role: "user", text: query },
      { role: "agent", text: "" },
    ]);
    setBusy(true);
    onPosture?.("inquiry");
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      // Include the session parameter from the URL when present (shared link),
      // so new messages go to the right conversation even without a cookie.
      const sessionParam = new URLSearchParams(window.location.search).get("session");
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          sessionParam ? { query, session: sessionParam } : { query },
        ),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const msg =
          res.status === 429
            ? "Too many questions — wait a moment and try again."
            : "Mira couldn't respond right now. Try again.";
        setGrounded(null);
        setChecking(false);
        setMessages((m) => {
          const copy = m.slice();
          copy[copy.length - 1] = { role: "agent", text: msg };
          return copy;
        });
        return;
      }
      setLive(res.headers.get("X-Famile-Live") === "true");
      setGrounded(res.headers.get("X-Famile-Grounded") === "true");
      if (!res.body) throw new Error("no body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      accRef.current = "";
      let firstToken = true;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accRef.current =
          accRef.current + decoder.decode(value, { stream: true });
        const snapshot = accRef.current;
        if (firstToken && snapshot) {
          firstToken = false;
          setChecking(false);
          onPosture?.("offering");
        }
        if (sit && snapshot && !sitFiredRef.current) {
          sitFiredRef.current = true;
          onSit?.();
        }
        setMessages((m) => {
          const copy = m.slice();
          copy[copy.length - 1] = { role: "agent", text: snapshot };
          return copy;
        });
      }
    } catch {
      setGrounded(null);
      setMessages((m) => {
        const copy = m.slice();
        const last = copy[copy.length - 1];
        if (last && last.role === "agent" && !last.text) {
          copy[copy.length - 1] = {
            role: "agent",
            text: "Something interrupted. Try again.",
          };
        }
        return copy;
      });
    } finally {
      setBusy(false);
      setChecking(false);
      onPosture?.("steady");
    }
  }

  const lastAgent = [...messages].reverse().find((m) => m.role === "agent");
  // Screen-reader announcement: streaming tokens would spam a live region,
  // so only the completed reply is announced (role="status" = polite+atomic).
  // Derived during render: empty while busy, the full reply once finished.
  const announcement =
    started && !busy && lastAgent?.text ? lastAgent.text : "";
  const chips =
    !busy && !resting && lastAgent?.text ? softMatches(lastAgent.text) : [];
  const speaking = busy && !resting;

  return (
    <div className={cn("relative flex min-h-0 flex-1 flex-col", className)}>
      <motion.div
        layout={!reduced}
        className="flex min-h-0 flex-1 flex-col rounded-xl border border-line-strong bg-canvas-elevated/50 backdrop-blur-xl"
        animate={{ opacity: resting ? 0.32 : 1 }}
        transition={{ duration: DUR.slow, ease: EASE.soft }}
        style={{
          boxShadow: speaking
            ? "0 0 48px -12px rgba(126,232,200,0.35)"
            : "0 0 40px -20px rgba(196,176,255,0.2)",
          pointerEvents: resting ? "none" : undefined,
        }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "h-2 w-2 rounded-full bg-aurora-mint",
                speaking && "animate-pulse",
              )}
            />
            <span className="font-display text-lg tracking-tight">Mira</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.16em] text-ink-dim">
              {live === null ? "here" : live ? "live" : "recorded"}
            </span>
            {onClose && !resting && (
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-ink-dim transition-colors hover:text-ink-muted"
              >
                Close
              </button>
            )}
          </div>
        </div>

        <p className="sr-only" role="status">
          {announcement}
        </p>
        <div
          ref={scrollRef}
          role="log"
          aria-live="off"
          aria-label="Conversation with Mira"
          className="min-h-[180px] flex-1 overflow-y-auto px-5 py-5 sm:px-6"
        >
          {messages.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-ink-muted">
                What are you noticing?
              </p>
              <div className="flex flex-wrap gap-2">
                {sampleQA.map((qa) => (
                  <button
                    key={qa.q}
                    type="button"
                    onClick={() => send(qa.q)}
                    className="rounded-full border border-line-strong bg-canvas-elevated/30 px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-aurora-lavender/40 hover:text-ink"
                  >
                    {qa.q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: reduced ? 0 : 0.3,
                      ease: EASE.soft,
                    }}
                    className={m.role === "user" ? "text-right" : ""}
                  >
                    <span
                      className={cn(
                        "inline-block max-w-[90%] px-4 py-2.5 text-sm leading-relaxed",
                        m.role === "user"
                          ? "rounded-md bg-aurora-lavender/15 text-ink"
                          : "rounded-md text-ink-muted",
                      )}
                    >
                      {m.text ||
                        (checking && i === messages.length - 1 ? (
                          <span className="inline-flex items-center gap-2 text-xs text-ink-dim">
                            <span className="inline-flex gap-1">
                              <Dot /> <Dot delay={0.15} /> <Dot delay={0.3} />
                            </span>
                            Checking the literature…
                          </span>
                        ) : (
                          <span className="inline-flex gap-1">
                            <Dot /> <Dot delay={0.15} /> <Dot delay={0.3} />
                          </span>
                        ))}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {!busy && grounded && lastAgent && (
                <div className="flex items-center gap-2 pl-1 pt-2 text-[10px] uppercase tracking-[0.16em] text-ink-dim">
                  <span className="h-1.5 w-1.5 rounded-full bg-aurora-mint" />
                  Grounded in life-science literature
                </div>
              )}
              {chips.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {chips.map((p) => (
                    <SoftChip key={p.slug} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2 border-t border-line px-3 py-3 sm:px-4"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="What’s on your mind…"
            aria-label="Message Mira"
            rows={1}
            className="min-w-0 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-relaxed text-ink placeholder:text-ink-dim focus:outline-none"
            disabled={busy || resting}
          />
          {voice.supported && (
            <button
              type="button"
              onClick={voice.listening ? voice.stop : voice.start}
              disabled={busy || resting || voice.finalizing}
              aria-label={voice.listening ? "Stop voice input" : "Start voice input"}
              aria-pressed={voice.listening}
              className={cn(
                "shrink-0 rounded-full border px-3 py-2 text-xs transition-colors disabled:opacity-40",
                voice.listening
                  ? "border-aurora-amber/60 bg-aurora-amber/15 text-ink"
                  : "border-line-strong text-ink-dim hover:border-aurora-lavender/40 hover:text-ink",
              )}
            >
              {voice.finalizing ? "Finishing" : voice.listening ? "Stop" : "Speak"}
            </button>
          )}
          <button
            type="submit"
            disabled={busy || resting || !input.trim()}
            className="shrink-0 rounded-full bg-aurora-lavender/20 px-4 py-2 text-sm text-ink transition-colors hover:bg-aurora-lavender/30 disabled:opacity-40"
          >
            {busy ? "…" : "Send"}
          </button>
        </form>
        {voice.listening && (
          <p
            className="border-t border-line px-5 py-2 text-xs text-ink-dim sm:px-6"
            role="status"
          >
            {voice.mode === "websocket"
              ? "Listening. Audio is being sent to the configured transcription service; Famile does not save it."
              : "Listening. Nothing is saved. Stop when you are finished."}
          </p>
        )}
        {voice.finalizing && (
          <p
            className="border-t border-line px-5 py-2 text-xs text-ink-dim sm:px-6"
            role="status"
          >
            Finishing your transcript…
          </p>
        )}
        {voice.error && !voice.listening && (
          <p className="border-t border-line px-5 py-2 text-xs text-ink-dim sm:px-6" role="status">
            {voice.error}
          </p>
        )}
      </motion.div>

      {resting && onReturn && (
        <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center">
          <button
            type="button"
            onClick={onReturn}
            className="text-xs text-ink-dim transition-colors hover:text-ink-muted"
          >
            Return
          </button>
        </div>
      )}
    </div>
  );
}

function SoftChip({ product }: { product: Product }) {
  const href =
    product.urlStatus === "live"
      ? product.url
      : (`/products/${product.slug}` satisfies `/products/${ProductSlug}`);
  const external = product.urlStatus === "live";
  const label =
    product.urlStatus === "live" ? product.name : `About ${product.name}`;

  return (
    <a
      href={href}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className="rounded-full border border-line px-3 py-1 text-[11px] text-ink-dim transition-colors hover:border-line-strong hover:text-ink-muted"
      style={{ borderColor: `${product.accent}44` }}
    >
      {label} →
    </a>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1, repeat: Infinity, delay, ease: "easeInOut" }}
      className="inline-block h-1.5 w-1.5 rounded-full bg-ink-dim"
    />
  );
}
