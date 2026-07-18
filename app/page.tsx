import { MarketingShell } from "@/components/marketing/shell";
import { Hero } from "@/components/marketing/hero";
import { ProductSuite } from "@/components/marketing/product-suite";
import { SignalDesk } from "@/components/agent/signal-desk";
import { ExperienceSection } from "@/components/marketing/experience-section";
import { Principles } from "@/components/marketing/principles";
import { CTA } from "@/components/marketing/cta";
import { JsonLd } from "@/components/JsonLd";
import { webPageSchema, productListSchema } from "@/lib/schema";

export default function Home() {
  return (
    <MarketingShell>
      <JsonLd
        data={webPageSchema({
          path: "/",
          name: "famile",
          description: "A compass for health and wellness. Leave wiser. Apps optional.",
        })}
      />
      <JsonLd data={productListSchema()} />
      <Hero />
      <ProductSuite />
      <SignalDesk />
      <ExperienceSection />
      <Principles />
      <CTA />
    </MarketingShell>
  );
}
