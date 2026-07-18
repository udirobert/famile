export type LlmProviderId = "venice" | "og" | "anthropic";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface LlmProvider {
  readonly id: LlmProviderId;
  readonly label: string;
  /** True when env credentials for this provider are present. */
  configured(): boolean;
  /** Stream assistant text deltas. Throws if the call fails before/during open. */
  stream(messages: ChatMessage[]): AsyncIterable<string>;
}
