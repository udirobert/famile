// Firecrawl Research Index — grounds Mira's answers in life-science literature.
//
// Server-only (never imported from client components; uses process.env). Wraps
// Firecrawl's POST /v2/search/research endpoint, which indexes 41M+ papers
// across drug discovery, clinical trials, and biology from authoritative
// sources. The intent is provenance, not prescription: Mira characterizes what
// the literature says without turning a paper into a recommendation.
//
// Degradation posture (matches the rest of famile/web): if FIRECRAWL_API_KEY is
// unset, the query doesn't look evidence-seeking, or the call fails, we return
// an empty context and the surface answers from conversation alone. Evidence
// retrieval never takes /ask dark.

export type ResearchSource = {
  title: string;
  url: string;
  publishedDate?: string;
  description?: string;
};

export type ResearchContext = {
  grounded: boolean;
  sources: ResearchSource[];
  contextText: string;
};

const ENDPOINT = "https://api.firecrawl.dev/v2/search/research";
const DEFAULT_MAX = 4;
const TIMEOUT_MS = 8_000;

export function researchConfigured(): boolean {
  return Boolean(process.env.FIRECRAWL_API_KEY?.trim());
}

// Conservative intent gate: only fetch evidence for questions that clearly
// ask what the literature/evidence says. Product questions, "sit with me",
// and personal-health turns (already PHI-scrubbed upstream) must not trigger
// a lookup — that would waste credits and risk over-stepping Mira's lane.
const EVIDENCE_HINTS: RegExp[] = [
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

function clampInt(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  if (!value) return fallback;
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function parseSources(json: unknown): ResearchSource[] {
  if (!json || typeof json !== "object") return [];
  const data = (json as { data?: unknown }).data;
  if (!Array.isArray(data)) return [];
  return data
    .map((item): ResearchSource | null => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const title = typeof o.title === "string" ? o.title.trim() : "";
      const url = typeof o.url === "string" ? o.url.trim() : "";
      if (!title && !url) return null;
      return {
        title,
        url,
        publishedDate:
          typeof o.publishedDate === "string"
            ? o.publishedDate
            : undefined,
        description:
          typeof o.description === "string" ? o.description : undefined,
      };
    })
    .filter((s): s is ResearchSource => s !== null);
}

function formatContext(sources: ResearchSource[]): string {
  const lines = sources.map((s, i) => {
    const date = s.publishedDate ? ` (${s.publishedDate})` : "";
    return `${i + 1}. ${s.title}${date} — ${s.url}`;
  });
  return [
    "Research context (life-science literature).",
    "Use it only to characterize what the literature says. Never turn a paper into a recommendation; distinguish what is known from what is not.",
    ...lines,
  ].join("\n");
}

/**
 * Resolve an optional literature-grounded research context for a query.
 * Returns an empty (ungrounded) context whenever evidence isn't wanted,
 * isn't configured, or the upstream call fails — never throws.
 */
export async function resolveResearch(
  query: string,
  max = DEFAULT_MAX,
): Promise<ResearchContext> {
  const empty: ResearchContext = {
    grounded: false,
    sources: [],
    contextText: "",
  };
  if (!researchConfigured()) return empty;
  if (!needsResearch(query)) return empty;

  const maxResults = clampInt(process.env.FIRECRAWL_RESEARCH_MAX, max, 1, 8);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let json: unknown;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({ query, limit: maxResults }),
      signal: ctrl.signal,
    });
    if (!res.ok) return empty;
    json = await res.json();
  } catch {
    return empty;
  } finally {
    clearTimeout(t);
  }

  const sources = parseSources(json).slice(0, maxResults);
  if (!sources.length) return empty;
  return {
    grounded: true,
    sources,
    contextText: formatContext(sources),
  };
}
