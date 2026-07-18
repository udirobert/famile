import type { Metadata } from "next";
import { ProductDetail } from "@/components/app/product-detail";
import { getProduct } from "@/lib/products";

export function generateMetadata(): Metadata {
  const product = getProduct("sukari");
  return {
    title: `${product.name} - ${product.tagline}`,
    description: product.description,
    alternates: { canonical: "/products/sukari" },
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

export default function SukariPage() {
  return <ProductDetail product={getProduct("sukari")} />;
}
