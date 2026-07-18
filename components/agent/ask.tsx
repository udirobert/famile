"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { sampleQA } from "@/lib/agent/replay";

type Msg = { role: "user" | "agent"; text: string };

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

  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-line-strong bg-canvas-elevated/40 backdrop-blur-xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-aurora-mint" />
            <span className="font-display text-lg tracking-tight">
              famile agent
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.16em] text-ink-dim">
            {live === null
              ? "ready"
              : live
                ? "live reasoning"
                : "sample answers · live needs a key"}
          </span>
        </div>

        {/* transcript */}
        <div className="max-h-[44vh] min-h-[200px] overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-ink-muted">
                Ask how Sukari or Orbura reason. This is a demonstration of the
                reasoning, not the products giving care.
              </p>
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
            </div>
          )}
        </div>

        {/* input */}
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
            placeholder="Ask how it reasons…"
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
        Not medical advice. A demonstration of how the products reason;
        supervised by a clinician in real use.
      </p>
    </div>
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
