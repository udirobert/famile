import { anthropicProvider } from "./anthropic";
import { ogProvider, veniceProvider } from "./openai-compatible";
import type { LlmProvider, LlmProviderId } from "./types";

const REGISTRY: Record<LlmProviderId, LlmProvider> = {
  venice: veniceProvider,
  og: ogProvider,
  anthropic: anthropicProvider,
};

const DEFAULT_ORDER: LlmProviderId[] = ["venice", "og", "anthropic"];

/**
 * Resolve the live provider chain.
 * Override with LLM_PROVIDER_ORDER=venice,og,anthropic (comma-separated ids).
 * Only configured providers (API key present) are returned.
 */
export function getProviderChain(): LlmProvider[] {
  const raw = process.env.LLM_PROVIDER_ORDER?.trim();
  const order = raw
    ? raw
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter((s): s is LlmProviderId => s in REGISTRY)
    : DEFAULT_ORDER;

  const seen = new Set<LlmProviderId>();
  const chain: LlmProvider[] = [];
  for (const id of order) {
    if (seen.has(id)) continue;
    seen.add(id);
    const p = REGISTRY[id];
    if (p.configured()) chain.push(p);
  }
  return chain;
}

export function anyProviderConfigured(): boolean {
  return getProviderChain().length > 0;
}

export type { LlmProvider, LlmProviderId, ChatMessage } from "./types";
