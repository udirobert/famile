import type { ProductSlug } from "@/lib/products";

// A single reasoning step in a trace. `input` is the synthetic signal in;
// `decide` is the one action surfaced; `report` is the note to the care team.
export type StepKind = "input" | "observe" | "reason" | "decide" | "report";

export type ReasoningStep = {
  kind: StepKind;
  label: string;
  text: string;
};

export type AgentTrace = {
  product: ProductSlug;
  steps: ReasoningStep[];
};

// A dashboard event appended to the "what shifted" feed over time.
export type DashboardEvent = {
  product: ProductSlug;
  kind: "signal" | "action" | "report";
  text: string;
};

// Curated Q&A for the conversational agent's replay fallback.
export type SampleQA = { q: string; a: string };

// Provenance for a product metric or capability claim.
export type ProvenanceEntry = {
  claim: string;
  source: string;
  reasoning: string;
};
