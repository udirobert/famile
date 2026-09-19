import { products } from "@/lib/products";

// https://llmstxt.org — a markdown index for AI agents. Kept in sync with the
// product data layer so descriptions never drift from the rendered site.
export const dynamic = "force-static";

export function GET() {
  const line = (p: (typeof products)[number]) =>
    `- [${p.name}](https://famile.xyz/products/${p.slug}): ${p.description}${p.repo ? ` — source: ${p.repo}` : p.urlStatus === "soon" ? " (app coming soon)" : ` — app: ${p.url}`}`;
  const practiceLines = products
    .filter((p) => p.kind === "practice")
    .map(line)
    .join("\n");
  const benchLines = products
    .filter((p) => p.kind === "research")
    .map(line)
    .join("\n");

  const body = `# famile

> Attention, evidence, and continuity for the long arc of staying well. Mira offers conversation. Practice apps hold longer arcs. Research projects are open, not care apps.

## Practice
${practiceLines}

## Bench (open research, not care apps)
${benchLines}

## Site
- [Home](https://famile.xyz/): Field for attention; notes; Mira.
- [Mira](https://famile.xyz/ask): Conversation. Not medical advice.
- [The bench, live](https://famile.xyz/research): Kytos Observatory runs and Lemma claim audits, read from their public feeds.
- [About](https://famile.xyz/about): Care that compounds.
- [Contact](https://famile.xyz/contact): Partnerships and walkthroughs.

## Machine-readable
- [Bench data (JSON)](https://famile.xyz/api/bench): latest Observatory runs + Lemma audit ledger.
- [Sitemap](https://famile.xyz/sitemap.xml)
- [Robots](https://famile.xyz/robots.txt)
- [Manifest](https://famile.xyz/manifest.webmanifest)

## Legal
- [Privacy Policy](https://famile.xyz/privacy): How famile handles information. /ask queries are not stored; input is sent to the AI provider (Anthropic). Not medical advice.
- [Terms of Use](https://famile.xyz/terms): Terms for using the site and Mira. Informational only, not medical advice.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
