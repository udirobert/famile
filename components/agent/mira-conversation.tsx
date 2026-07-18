"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { sampleQA } from "@/lib/agent/replay";
import {
  products,
  type Product,
  type ProductSlug,
} from "@/lib/products";
import { EASE, DUR } from "@/lib/motion";
import { cn } from "@/lib/utils";

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
};

export function MiraConversation({
  className,
  autoFocus = false,
  onClose,
}: MiraConversationProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState<boolean | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const accRef = useRef("");
  const inputRef = useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  async function send(q: string) {
    const query = q.trim();
    if (!query || busy) return;
    setInput("");
    setMessages((m) => [
      ...m,
      { role: "user", text: query },
      { role: "agent", text: "" },
    ]);
    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const msg =
          res.status === 429
            ? "Too many questions — wait a moment and try again."
            : "Mira couldn't respond right now. Try again.";
        setMessages((m) => {
          const copy = m.slice();
          copy[copy.length - 1] = { role: "agent", text: msg };
          return copy;
        });
        return;
      }
      setLive(res.headers.get("X-Famile-Live") === "true");
      if (!res.body) throw new Error("no body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      accRef.current = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accRef.current =
          accRef.current + decoder.decode(value, { stream: true });
        const snapshot = accRef.current;
        setMessages((m) => {
          const copy = m.slice();
          copy[copy.length - 1] = { role: "agent", text: snapshot };
          return copy;
        });
      }
    } catch {
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
    }
  }

  const lastAgent = [...messages].reverse().find((m) => m.role === "agent");
  const chips =
    !busy && lastAgent?.text ? softMatches(lastAgent.text) : [];
  const speaking = busy;

  return (
    <motion.div
      layout={!reduced}
      className={cn(
        "flex min-h-0 flex-1 flex-col rounded-[var(--radius-xl)] border border-line-strong bg-canvas-elevated/50 backdrop-blur-xl",
        className,
      )}
      style={{
        // Soft gooey-adjacent edge glow while Mira speaks
        boxShadow: speaking
          ? "0 0 48px -12px rgba(126,232,200,0.35)"
          : "0 0 40px -20px rgba(196,176,255,0.2)",
      }}
      transition={{ duration: DUR.slow, ease: EASE.soft }}
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
            {live === null ? "here" : live ? "live" : "sample"}
          </span>
          {onClose && (
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

      <div className="min-h-[180px] flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-ink-muted">
              Say whatever&apos;s on your mind.
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
                  initial={reduced ? false : { opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: reduced ? 0 : 0.35, ease: EASE.soft }}
                  className={m.role === "user" ? "text-right" : ""}
                >
                  <span
                    className={cn(
                      "inline-block max-w-[90%] px-4 py-2.5 text-sm leading-relaxed",
                      m.role === "user"
                        ? "rounded-[var(--radius-md)] bg-aurora-lavender/15 text-ink"
                        : "rounded-[var(--radius-md)] text-ink-muted",
                    )}
                  >
                    {m.text || (
                      <span className="inline-flex gap-1">
                        <Dot /> <Dot delay={0.15} /> <Dot delay={0.3} />
                      </span>
                    )}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
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
        className="flex items-center gap-2 border-t border-line px-3 py-3 sm:px-4"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What’s on your mind…"
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:outline-none"
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="shrink-0 rounded-full bg-aurora-lavender/20 px-4 py-2 text-sm text-ink transition-colors hover:bg-aurora-lavender/30 disabled:opacity-40"
        >
          {busy ? "…" : "Send"}
        </button>
      </form>
    </motion.div>
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
