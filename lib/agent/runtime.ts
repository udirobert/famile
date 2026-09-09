import { replayAnswer } from "./replay";
import { LiveEngine, anyProviderConfigured } from "./live";
import type { ResearchContext } from "@/lib/research";

// The reasoning engine backs the conversational surface. Replay (recorded
// answers) by default; Live (LLM) when any provider API key is present.
// Both expose the same streaming contract so the UI is uniform.
export interface ReasoningEngine {
  readonly live: boolean;
  /**
   * Stream an answer. `research` is an optional literature-grounding context
   * (Firecrawl Research Index) that the live engine folds into its prompt.
   * Ignored by the replay engine, which streams recorded answers.
   */
  answerStream(
    query: string,
    research?: ResearchContext | null,
  ): AsyncIterable<string>;
}

// Evaluated at request time on the server (non-public env vars are not
// inlined at build), so a deploy that sets a provider key upgrades to live.
export const LIVE = anyProviderConfigured();

export function getEngine(): ReasoningEngine {
  return LIVE ? new LiveEngine() : new ReplayEngine();
}

class ReplayEngine implements ReasoningEngine {
  readonly live = false;

  async *answerStream(_query: string, _research?: unknown): AsyncIterable<string> {
    const answer = replayAnswer(_query);
    // Reveal gradually so the UX matches the live path; it's still a recorded
    // answer, labeled as such on the client.
    for (const part of answer.split(/(\s+)/)) {
      yield part;
      await delay(28);
    }
  }
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
