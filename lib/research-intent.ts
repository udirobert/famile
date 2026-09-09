// Intent-only gate for evidence-seeking queries.
//
// This file has no server-side dependencies (no env, no fetch), so it can be
// imported from both client components and server modules. The Base44 Deno
// function at base44/functions/miraAnswer/entry.ts mirrors this list because
// it is deployed separately; if it is ever bundled from the same repo, it
// should import from here instead.

// Conservative intent gate: only fetch evidence for questions that clearly
// ask what the literature/evidence says. Product questions, "sit with me",
// and personal-health turns (already PHI-scrubbed upstream) must not trigger
// a lookup — that would waste credits and risk over-stepping Mira's lane.
export const EVIDENCE_HINTS: RegExp[] = [
  /what does the (research|literature|science|data|evidence|studies)\s+(say|show|suggest|tell)/i,
  /what (do|did) (studies|trials|researchers) (show|find|suggest)/i,
  /is there (any )?(evidence|research|data)/i,
  /\b(evidence|research|data) (for|that|shows|suggests|on)\b/i,
  /\bclinical trial/i,
  /\bmeta[- ]analysis/i,
  /\bsystematic review/i,
  /\bpeer[- ]reviewed/i,
  /stud(y|ies) (on|of|show|suggest|found|examined)/i,
  /\bscience behind/i,
  /\bwhat is known about/i,
  /\b(effect|effects|efficacy|effectiveness|mechanism) (of|on)/i,
  /\bcorrelat(ion|ions?|e) (between|with)/i,
  /\bdoes it (work|help|matter)\b/i,
  /\b(body|brain|sleep|fasting|glp-?1|metformin|meditation|cortisol|circadian|intermittent fasting)\b.*\b(research|evidence|studies|literature|science|data)\b/i,
];

export function needsResearch(query: string): boolean {
  return EVIDENCE_HINTS.some((re) => re.test(query));
}
