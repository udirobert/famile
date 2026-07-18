import OpenAI from "openai";
import type { ChatMessage, LlmProvider, LlmProviderId } from "./types";

type OpenAiCompatibleConfig = {
  id: LlmProviderId;
  label: string;
  apiKeyEnv: string;
  baseUrlEnv: string;
  defaultBaseUrl: string;
  modelEnv: string;
  defaultModel: string;
};

/**
 * OpenAI Chat Completions streaming against any compatible base URL
 * (Venice, 0G Router, etc.).
 */
export function createOpenAiCompatibleProvider(
  cfg: OpenAiCompatibleConfig,
): LlmProvider {
  return {
    id: cfg.id,
    label: cfg.label,
    configured() {
      return Boolean(process.env[cfg.apiKeyEnv]?.trim());
    },
    async *stream(messages: ChatMessage[]) {
      const apiKey = process.env[cfg.apiKeyEnv]?.trim();
      if (!apiKey) throw new Error(`${cfg.id}: missing ${cfg.apiKeyEnv}`);

      const baseURL =
        process.env[cfg.baseUrlEnv]?.trim() || cfg.defaultBaseUrl;
      const model = process.env[cfg.modelEnv]?.trim() || cfg.defaultModel;

      const client = new OpenAI({ apiKey, baseURL });
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), UPSTREAM_TIMEOUT_MS);

      try {
        const stream = await client.chat.completions.create(
          {
            model,
            messages,
            max_tokens: 400,
            stream: true,
          },
          { signal: ctrl.signal },
        );

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) yield text;
        }
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

const UPSTREAM_TIMEOUT_MS = 15_000;

/** Venice AI — https://api.venice.ai/api/v1 */
export const veniceProvider = createOpenAiCompatibleProvider({
  id: "venice",
  label: "Venice",
  apiKeyEnv: "VENICE_API_KEY",
  baseUrlEnv: "VENICE_BASE_URL",
  defaultBaseUrl: "https://api.venice.ai/api/v1",
  modelEnv: "VENICE_MODEL",
  defaultModel: "zai-org-glm-5-1",
});

/**
 * 0G Compute Router — OpenAI-compatible gateway.
 * @see https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/quickstart
 */
export const ogProvider = createOpenAiCompatibleProvider({
  id: "og",
  label: "0G Router",
  apiKeyEnv: "OG_API_KEY",
  baseUrlEnv: "OG_BASE_URL",
  defaultBaseUrl: "https://router-api.0g.ai/v1",
  modelEnv: "OG_MODEL",
  // Docs example; override with OG_MODEL once you pick a live catalog model.
  defaultModel: "zai-org/GLM-5-FP8",
});
