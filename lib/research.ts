import { needsResearch } from "./research-intent";

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
//
// Intent gating lives in ./research-intent.ts so the same patterns can be used
// on the client for UI state.

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
