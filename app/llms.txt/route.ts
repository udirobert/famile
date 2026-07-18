import { products } from "@/lib/products";

// https://llmstxt.org — a markdown index for AI agents. Kept in sync with the
// product data layer so descriptions never drift from the rendered site.
export const dynamic = "force-static";

export function GET() {
  const productLines = products
    .map(
      (p) =>
        `- [${p.name}](https://famile.xyz/products/${p.slug}): ${p.description}${p.urlStatus === "soon" ? " (app coming soon)" : ` — app: ${p.url}`}`,
    )
    .join("\n");

  const body = `# famile

> Attention, evidence, and continuity for the long arc of staying well. Mira offers conversation. Practice apps hold longer arcs.

## Practice
${productLines}

## Site
- [Home](https://famile.xyz/): Field for attention; notes; Mira.
- [Mira](https://famile.xyz/ask): Conversation. Not medical advice.
- [About](https://famile.xyz/about): Care that compounds.
- [Contact](https://famile.xyz/contact): Partnerships and walkthroughs.

## Machine-readable
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
