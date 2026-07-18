import { products } from "@/lib/products";

// https://llmstxt.org — a markdown index for AI agents. Kept in sync with the
// product data layer so descriptions never drift from the rendered site.
export const dynamic = "force-static";

export function GET() {
  const body = `# famile

> famile is a suite of AI-native and AI-enabled health products, built for the long arc of staying well. Quiet by default, present when it matters.

## Products
- [Sukari](https://famile.xyz/products/sukari): ${products[0].description}
- [Orbura](https://famile.xyz/products/orbura): ${products[1].description}

## Site
- [Home](https://famile.xyz/): The suite overview — Sukari and Orbura, the design principles, and the experience.
- [About](https://famile.xyz/about): Why famile builds health products that disappear into care.
- [Contact](https://famile.xyz/contact): Partnerships, care-team integrations, and guided walkthroughs.

## Machine-readable
- [Sitemap](https://famile.xyz/sitemap.xml)
- [Robots](https://famile.xyz/robots.txt)
- [Manifest](https://famile.xyz/manifest.webmanifest)
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
