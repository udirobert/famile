import { products, type Product } from "./products";

const SITE = "https://famile.xyz";

const ORG_DESCRIPTION =
  "famile — attention, evidence, and continuity for the long arc of staying well.";

// Site-wide Organization + WebSite graph. Emitted once in the root layout so
// every page inherits publisher/site identity for crawlers and AI agents.
export const organizationSchema = {
  "@type": "Organization",
  "@id": `${SITE}/#organization`,
  name: "famile",
  url: SITE,
  description: ORG_DESCRIPTION,
  logo: `${SITE}/icon.svg`,
};

export const websiteSchema = {
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  url: SITE,
  name: "famile",
  description: ORG_DESCRIPTION,
  publisher: { "@id": `${SITE}/#organization` },
  inLanguage: "en",
};

export function siteGraphSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, websiteSchema],
  };
}

// Per-page WebPage node. `isPartOf` links back to the WebSite, `about` to the
// Organization, so agents can traverse the graph from any entry point.
export function webPageSchema(opts: {
  path: string;
  name: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE}${opts.path}`,
    url: `${SITE}${opts.path}`,
    name: opts.name,
    description: opts.description,
    isPartOf: { "@id": `${SITE}/#website` },
    about: { "@id": `${SITE}/#organization` },
    inLanguage: "en",
  };
}

// ItemList of the product suite, for the home page so agents see the catalogue
// structure without having to infer it from rendered markup.
export function productListSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "famile product suite",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: `${SITE}/products/${p.slug}`,
    })),
  };
}

// SoftwareApplication node for a product. No `offers` (these are not priced
// consumer SKUs) — accuracy over a rich-result badge.
export function productSchema(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.description,
    applicationCategory: "HealthApplication",
    applicationSubCategory: product.category,
    operatingSystem: "Web",
    url: `${SITE}/products/${product.slug}`,
    publisher: { "@id": `${SITE}/#organization` },
    inLanguage: "en",
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.path}`,
    })),
  };
}
