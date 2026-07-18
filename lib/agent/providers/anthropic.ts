import type { ChatMessage, LlmProvider } from "./types";

type AnthropicStreamEvent = {
  type?: string;
  delta?: { type?: string; text?: string };
};

async function* parseAnthropicSSE(
  body: ReadableStream<Uint8Array>,
): AsyncIterable<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const event = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const dataLine = event.split("\n").find((l) => l.startsWith("data:"));
        if (!dataLine) continue;
        const jsonStr = dataLine.slice(5).trim();
        if (!jsonStr || jsonStr === "[DONE]") continue;
        try {
          const data = JSON.parse(jsonStr) as AnthropicStreamEvent;
          if (data.type === "content_block_delta" && data.delta?.text) {
            yield data.delta.text;
          }
        } catch {
          // Skip malformed frames.
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }
}

const UPSTREAM_TIMEOUT_MS = 15_000;

/** Legacy Anthropic Messages API — kept as an optional fallback. */
export const anthropicProvider: LlmProvider = {
  id: "anthropic",
  label: "Anthropic",
  configured() {
    return Boolean(process.env.LLM_API_KEY?.trim() || process.env.ANTHROPIC_API_KEY?.trim());
  },
  async *stream(messages: ChatMessage[]) {
    const key =
      process.env.LLM_API_KEY?.trim() || process.env.ANTHROPIC_API_KEY?.trim();
    if (!key) throw new Error("anthropic: missing LLM_API_KEY");

    const system = messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n\n");
    const userMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), UPSTREAM_TIMEOUT_MS);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: process.env.LLM_MODEL || "claude-3-5-sonnet-latest",
          max_tokens: 400,
          system,
          messages: userMessages,
          stream: true,
        }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) throw new Error(`anthropic ${res.status}`);

      for await (const chunk of parseAnthropicSSE(res.body)) {
        yield chunk;
      }
    } finally {
      clearTimeout(timeout);
    }
  },
};
