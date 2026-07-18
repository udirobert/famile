"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { sampleQA } from "@/lib/agent/replay";
import {
  products,
  type Product,
  type ProductSlug,
} from "@/lib/products";

type Msg = { role: "user" | "agent"; text: string };

function softMatches(text: string): Product[] {
  const lower = text.toLowerCase();
  return products.filter((p) => lower.includes(p.name.toLowerCase()));
}

export function Ask() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState<boolean | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const accRef = useRef("");

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
            : "The agent couldn't respond right now. Try again.";
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
        accRef.current = accRef.current + decoder.decode(value, { stream: true });
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
            text: "Something interrupted the stream. Try again.",
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

  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-line-strong bg-canvas-elevated/40 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-aurora-mint" />
            <span className="font-display text-lg tracking-tight">Mira</span>
            <span className="text-xs text-ink-dim">orientation</span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.16em] text-ink-dim">
            {live === null
              ? "ready"
              : live
                ? "live reasoning"
                : "sample answers · live needs a key"}
          </span>
        </div>

        <div className="max-h-[44vh] min-h-[200px] overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-ink-muted">Try a question.</p>
              <div className="flex flex-wrap gap-2">
                {sampleQA.map((qa) => (
                  <button
                    key={qa.q}
                    onClick={() => send(qa.q)}
                    className="rounded-full border border-line-strong bg-canvas-elevated/30 px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-aurora-lavender/40 hover:text-ink"
                  >
                    {qa.q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={m.role === "user" ? "text-right" : ""}
                  >
                    <span
                      className={`inline-block max-w-[85%] rounded-[var(--radius-md)] px-4 py-2.5 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-aurora-lavender/15 text-ink"
                          : "border border-line text-ink-muted"
                      }`}
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
          className="flex items-center gap-2 border-t border-line px-4 py-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask…"
            className="flex-1 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:outline-none"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-full bg-aurora-lavender/20 px-4 py-2 text-sm text-ink transition-colors hover:bg-aurora-lavender/30 disabled:opacity-40"
          >
            {busy ? "…" : "Send"}
          </button>
        </form>
      </div>
      <p className="mt-4 text-center text-xs text-ink-dim">
        Not medical advice. Don&apos;t share personal health details.
      </p>
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
    product.urlStatus === "live"
      ? product.name
      : `About ${product.name}`;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-line px-3 py-1 text-[11px] text-ink-dim transition-colors hover:border-line-strong hover:text-ink-muted"
        style={{ borderColor: `${product.accent}44` }}
      >
        {label} →
      </a>
    );
  }

  return (
    <a
      href={href}
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
      className="h-1.5 w-1.5 rounded-full bg-ink-dim"
    />
  );
}
