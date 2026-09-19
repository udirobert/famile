// Live data for The bench: Kytos publishes every experiment to the
// Observatory RSS feed; Lemma ships its audit ledger as JSON in-repo.
// Both are fetched server-side (no CORS on the feed) and cached — this
// module renders what the projects published, never invented numbers.

export type BenchRun = {
  title: string;
  url: string;
  date: string;
  description: string;
};

export type BenchClaim = {
  id: string;
  title: string;
  testable: boolean;
  status: string;
  attempts: number;
  notes?: string;
};

export type BenchPaper = {
  slug: string;
  title: string;
  source_label: string;
  source_url: string | null;
  audited_at: string;
  blurb: string;
  role: string;
  status: string;
  links: { paper?: string | null; logbook?: string | null };
  claims: BenchClaim[];
};

export type BenchData = {
  kytos: { runs: BenchRun[] };
  lemma: { generatedAt: string | null; papers: BenchPaper[] };
};

const OBSERVATORY_FEED = "https://kytosapp.netlify.app/feed.xml";
const LEMMA_LEDGER =
  "https://raw.githubusercontent.com/udirobert/lemma/HEAD/papers/_index.json";

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  if (!m) return "";
  const raw = m[1].replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, "$1").trim();
  return decodeEntities(raw);
}

export function parseObservatoryFeed(xml: string, limit = 8): BenchRun[] {
  return xml
    .split(/<item>/)
    .slice(1, 1 + limit)
    .map((block) => ({
      title: tag(block, "title"),
      url: tag(block, "link"),
      date: tag(block, "pubDate"),
      description: tag(block, "description"),
    }))
    .filter((r) => r.title && r.url);
}

async function fetchKytosRuns(): Promise<BenchRun[]> {
  try {
    const res = await fetch(OBSERVATORY_FEED, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return parseObservatoryFeed(await res.text());
  } catch {
    return [];
  }
}

type RawIndex = {
  generated_at?: string;
  papers?: Array<{
    slug?: string;
    title?: string;
    source_label?: string;
    source_url?: string | null;
    audited_at?: string;
    blurb?: string;
    role?: string;
    status?: string;
    links?: { paper?: string | null; logbook?: string | null };
    claims?: Array<Partial<BenchClaim>>;
  }>;
};

async function fetchLemmaLedger(): Promise<BenchData["lemma"]> {
  try {
    const res = await fetch(LEMMA_LEDGER, { next: { revalidate: 3600 } });
    if (!res.ok) return { generatedAt: null, papers: [] };
    const raw = (await res.json()) as RawIndex;
    const papers: BenchPaper[] = (raw.papers ?? [])
      .filter((p) => p.slug && p.title && Array.isArray(p.claims))
      .map((p) => ({
        slug: p.slug as string,
        title: p.title as string,
        source_label: p.source_label ?? p.slug as string,
        source_url: p.source_url ?? null,
        audited_at: p.audited_at ?? "",
        blurb: p.blurb ?? "",
        role: p.role ?? "",
        status: p.status ?? "",
        links: p.links ?? {},
        claims: (p.claims as Array<Partial<BenchClaim>>).map((c) => ({
          id: c.id ?? "",
          title: c.title ?? "",
          testable: c.testable ?? true,
          status: c.status ?? "unknown",
          attempts: c.attempts ?? 0,
          notes: c.notes,
        })),
      }));
    return { generatedAt: raw.generated_at ?? null, papers };
  } catch {
    return { generatedAt: null, papers: [] };
  }
}

export async function getBenchData(): Promise<BenchData> {
  const [runs, lemma] = await Promise.all([
    fetchKytosRuns(),
    fetchLemmaLedger(),
  ]);
  return { kytos: { runs }, lemma };
}
