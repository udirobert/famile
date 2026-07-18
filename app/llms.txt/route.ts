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

  const names = products.map((p) => p.name).join(", ");

  const body = `# famile

> famile is a compass for health and wellness: orientation and insight first, with optional paths into continuous care and practice apps. Quiet by default, present when it matters. Leaving wiser without opening another app is a successful visit.

## Products
${productLines}

## Site
- [Home](https://famile.xyz/): Orientation overview — ${names}, design principles, and how the products reason.
- [Ask](https://famile.xyz/ask): An orientation guide. Takeaway-first; soft product mentions only when clearly mapped. Not medical advice.
- [About](https://famile.xyz/about): Why famile exists as a compass, not a storefront.
- [Contact](https://famile.xyz/contact): Partnerships, care-team integrations, and guided walkthroughs.

## Machine-readable
- [Sitemap](https://famile.xyz/sitemap.xml)
- [Robots](https://famile.xyz/robots.txt)
- [Manifest](https://famile.xyz/manifest.webmanifest)

## Legal
- [Privacy Policy](https://famile.xyz/privacy): How famile handles information. /ask queries are not stored; input is sent to the AI provider (Anthropic). Not medical advice.
- [Terms of Use](https://famile.xyz/terms): Terms for using the site and the /ask agent. Informational only, not medical advice.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
