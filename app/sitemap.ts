import type { MetadataRoute } from "next";
import { products } from "@/lib/products";

const BASE = "https://famile.xyz";

// Reflects the last real content change, not the build time. Bump this when
// copy or routes change so crawlers re-fetch only what moved.
const LAST_UPDATED = new Date("2026-07-18");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, lastModified: LAST_UPDATED, changeFrequency: "monthly", priority: 1 },
    ...products.map((p) => ({
      url: `${BASE}/products/${p.slug}`,
      lastModified: LAST_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    { url: `${BASE}/ask`, lastModified: LAST_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/about`, lastModified: LAST_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: LAST_UPDATED, changeFrequency: "monthly", priority: 0.6 },
  ];
}
