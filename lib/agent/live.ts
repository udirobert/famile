import { products } from "@/lib/products";
import { replayAnswer } from "./replay";
import type { ReasoningEngine } from "./runtime";

const SYSTEM_PROMPT = `You are the famile.xyz site agent. You demonstrate how famile's products reason. You are a demonstration, not a product giving care.

Rules:
- Never give medical advice, diagnosis, or treatment recommendations. If asked, decline and explain this is a demo of reasoning and that real use is supervised by a clinician.
- Stay grounded in the product descriptions provided. Do not invent capabilities or metrics.
- Speak in famile's warm-precise voice: name the people, acknowledge that chronic care is hard, avoid hype and jargon.
- Keep answers under 120 words.

Product context:
`;

function productContext(): string {
  return products
    .map(
      (p) =>
        `${p.name} (${p.status}, ${p.category}): ${p.description}\n  ${p.features
          .map((f) => `- ${f.title}: ${f.body}`)
          .join("\n  ")}`,
    )
    .join("\n\n");
}

type AnthropicStreamEvent = {
  type?: string;
  delta?: { type?: string; text?: string };
};

async function* parseSSE(
  body: ReadableStream<Uint8Array>,
): AsyncIterable<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const event = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const dataLine = event
        .split("\n")
        .find((l) => l.startsWith("data:"));
      if (!dataLine) continue;
      const jsonStr = dataLine.slice(5).trim();
      if (!jsonStr || jsonStr === "[DONE]") continue;
      try {
        const data = JSON.parse(jsonStr) as AnthropicStreamEvent;
        if (data.type === "content_block_delta" && data.delta?.text) {
          yield data.delta.text;
        }
      } catch {
        // Skip malformed event frames; the stream may contain keepalives.
      }
    }
  }
}

// Live reasoning via Anthropic's messages API. Falls back to a recorded answer
// on any error (bad key, network, non-200), so the surface never breaks.
export class LiveEngine implements ReasoningEngine {
  readonly live = true;

  async *answerStream(query: string): AsyncIterable<string> {
    const key = process.env.LLM_API_KEY;
    if (!key) {
      yield replayAnswer(query);
      return;
    }
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
          system: SYSTEM_PROMPT + productContext(),
          messages: [{ role: "user", content: query }],
          stream: true,
        }),
      });
      if (!res.ok || !res.body) throw new Error(`anthropic ${res.status}`);
      for await (const chunk of parseSSE(res.body)) yield chunk;
    } catch {
      yield replayAnswer(query);
    }
  }
}
