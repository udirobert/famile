import type { Metadata } from "next";
import { ProductDetail } from "@/components/app/product-detail";
import { getProduct } from "@/lib/products";

export function generateMetadata(): Metadata {
  const product = getProduct("orbura");
  return {
    title: `${product.name} - ${product.tagline}`,
    description: product.description,
    alternates: { canonical: "/products/orbura" },
    openGraph: {
      title: `${product.name} - ${product.tagline}`,
      description: product.description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} - ${product.tagline}`,
      description: product.description,
    },
  };
}

export default function OrburaPage() {
  return <ProductDetail product={getProduct("orbura")} />;
}
