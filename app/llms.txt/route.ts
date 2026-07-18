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

> famile is a warm place to peruse — or just be. Mira keeps company. Apps in the family are optional and not the point of the visit.

## Also in the family
${productLines}

## Site
- [Home](https://famile.xyz/): A warm space. Atmosphere, principles, Mira.
- [Mira](https://famile.xyz/ask): Sit with Mira. Not medical advice.
- [About](https://famile.xyz/about): You are the story; this is space around you.
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
