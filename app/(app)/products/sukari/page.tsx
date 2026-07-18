import type { Metadata } from "next";
import { ProductDetail } from "@/components/app/product-detail";
import { JsonLd } from "@/components/JsonLd";
import { getProduct } from "@/lib/products";
import { productSchema, breadcrumbSchema } from "@/lib/schema";

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
  const product = getProduct("sukari");
  return (
    <>
      <JsonLd data={productSchema(product)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Suite", path: "/#suite" },
          { name: product.name, path: `/products/${product.slug}` },
        ])}
      />
      <ProductDetail product={product} />
    </>
  );
}
