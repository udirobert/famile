import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/shell";
import { Container } from "@/components/ui/container";
import { JsonLd } from "@/components/JsonLd";
import { webPageSchema } from "@/lib/schema";
import { getBenchData } from "@/lib/bench";
import { researchProducts } from "@/lib/products";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The bench",
  description:
    "Live research ledgers: every Kytos Observatory run and every Lemma claim audit, read from what the projects publish.",
  alternates: { canonical: "/research" },
  openGraph: {
    title: "The bench — famile research, live",
    description:
      "Kytos Observatory runs and Lemma audit ledgers, read straight from their public feeds.",
  },
};

const STATUS_TONE: Record<string, string> = {
  supported: "border-aurora-mint/50 text-aurora-mint",
  falsified: "border-aurora-pink/50 text-aurora-pink",
  inconclusive: "border-aurora-amber/50 text-aurora-amber",
  untestable: "border-line text-ink-dim",
  unknown: "border-line text-ink-dim",
};

function runScore(title: string): string | null {
  const m = title.match(/([+-]\d+\.\d+)\s*$/);
  return m ? m[1] : null;
}

function shortDate(rfc2822: string): string {
  const d = new Date(rfc2822);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default async function ResearchPage() {
  const bench = await getBenchData();
  const kytos = researchProducts.find((p) => p.slug === "kytos");
  const lemma = researchProducts.find((p) => p.slug === "lemma");

  return (
    <MarketingShell>
      <JsonLd
        data={webPageSchema({
          path: "/research",
          name: "The bench",
          description:
            "Live research ledgers for Kytos and Lemma, read from their public feeds.",
        })}
      />
      <section className="py-28 sm:py-36">
        <Container>
          <header className="mb-16 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-ink-dim">
              The bench
            </p>
            <h1 className="mt-4 font-display text-5xl tracking-tight sm:text-6xl">
              Live, not curated.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted">
              Both research projects publish as they work. This page reads
              their public feeds directly — the Observatory logs every run
              that lands, and the ledger shows every claim Lemma audited,
              including the ones that did not survive. Not care apps; no
              health claims.
            </p>
          </header>

          <section className="mb-20">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-3xl tracking-tight">
                {kytos?.name ?? "Kytos"} — Observatory
              </h2>
              <a
                href="https://kytosapp.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ink-muted underline-offset-4 hover:underline"
              >
                all runs →
              </a>
            </div>
            {bench.kytos.runs.length === 0 ? (
              <p className="rounded-lg border border-dashed border-line-strong p-6 text-sm text-ink-muted">
                The Observatory feed didn&apos;t respond. Read it directly:{" "}
                <a
                  href="https://kytosapp.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline-offset-4 hover:underline"
                >
                  kytosapp.netlify.app
                </a>
                .
              </p>
            ) : (
              <ol className="space-y-px overflow-hidden rounded-xl border border-line">
                {bench.kytos.runs.map((run) => {
                  const score = runScore(run.title);
                  return (
                    <li
                      key={run.url}
                      className="bg-canvas-elevated/40 p-5 backdrop-blur-xl sm:px-7"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <a
                          href={run.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-display text-lg tracking-tight text-ink hover:opacity-80"
                        >
                          {run.title}
                        </a>
                        <span className="flex items-center gap-3">
                          {score && (
                            <span
                              className={`rounded-full border px-2.5 py-0.5 font-mono text-xs ${
                                score.startsWith("-")
                                  ? "border-aurora-pink/40 text-aurora-pink"
                                  : "border-aurora-mint/40 text-aurora-mint"
                              }`}
                            >
                              {score}
                            </span>
                          )}
                          <span className="text-[10px] uppercase tracking-[0.16em] text-ink-dim">
                            {shortDate(run.date)}
                          </span>
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                        {run.description}
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section>
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-3xl tracking-tight">
                {lemma?.name ?? "Lemma"} — audit ledger
              </h2>
              <a
                href="https://github.com/udirobert/lemma/issues/new?title=Paper%20suggestion%3A%20%22%3Ctitle%3E%22"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ink-muted underline-offset-4 hover:underline"
              >
                suggest a paper →
              </a>
            </div>
            {bench.lemma.papers.length === 0 ? (
              <p className="rounded-lg border border-dashed border-line-strong p-6 text-sm text-ink-muted">
                The ledger didn&apos;t load. Read it in the repo:{" "}
                <a
                  href="https://github.com/udirobert/lemma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline-offset-4 hover:underline"
                >
                  udirobert/lemma
                </a>
                .
              </p>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {bench.lemma.papers.map((paper) => (
                  <article
                    key={paper.slug}
                    className="rounded-xl border border-line-strong bg-canvas-elevated/40 p-7 backdrop-blur-xl"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-line-strong px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-ink-dim">
                        {paper.source_label}
                      </span>
                      {paper.role && (
                        <span className="rounded-full border border-line-strong px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-ink-dim">
                          {paper.role}
                        </span>
                      )}
                      {paper.audited_at && (
                        <span className="text-[10px] uppercase tracking-[0.16em] text-ink-dim">
                          audited {paper.audited_at}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-4 font-display text-xl leading-snug tracking-tight">
                      {paper.title}
                    </h3>
                    {paper.blurb && (
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                        {paper.blurb}
                      </p>
                    )}
                    <ul className="mt-5 space-y-2">
                      {paper.claims.map((c) => (
                        <li
                          key={c.id}
                          className="flex items-start gap-3 text-sm"
                        >
                          <span
                            className={`mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                              STATUS_TONE[c.status] ?? STATUS_TONE.unknown
                            }`}
                          >
                            {c.testable ? c.status : "untestable"}
                          </span>
                          <span className="text-ink-muted">
                            <span className="text-ink">{c.id}</span>{" "}
                            {c.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-5 flex flex-wrap gap-4 text-sm">
                      {paper.links.paper && (
                        <a
                          href={paper.links.paper}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink-muted underline-offset-4 hover:underline"
                        >
                          paper
                        </a>
                      )}
                      {paper.links.logbook && (
                        <a
                          href={paper.links.logbook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink-muted underline-offset-4 hover:underline"
                        >
                          evidence logbook
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
            {bench.lemma.generatedAt && (
              <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-ink-dim">
                ledger generated {bench.lemma.generatedAt.slice(0, 10)} ·
                refreshed hourly from the repo
              </p>
            )}
          </section>
        </Container>
      </section>
    </MarketingShell>
  );
}
