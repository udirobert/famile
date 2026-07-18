import { replayAnswer } from "./replay";
import { LiveEngine, anyProviderConfigured } from "./live";

// The reasoning engine backs the conversational surface. Replay (recorded
// answers) by default; Live (LLM) when any provider API key is present.
// Both expose the same streaming contract so the UI is uniform.
export interface ReasoningEngine {
  readonly live: boolean;
  answerStream(query: string): AsyncIterable<string>;
}

// Evaluated at request time on the server (non-public env vars are not
// inlined at build), so a deploy that sets a provider key upgrades to live.
export const LIVE = anyProviderConfigured();

export function getEngine(): ReasoningEngine {
  return LIVE ? new LiveEngine() : new ReplayEngine();
}

class ReplayEngine implements ReasoningEngine {
  readonly live = false;

  async *answerStream(query: string): AsyncIterable<string> {
    const answer = replayAnswer(query);
    // Reveal gradually so the UX matches the live path; it's still a recorded
    // answer, labeled as such on the client.
    for (const part of answer.split(/(\s+)/)) {
      yield part;
      await delay(28);
    }
  }
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
