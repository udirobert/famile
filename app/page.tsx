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
          name: "famile - a suite of health products",
          description:
            "AI-native and AI-enabled health products for the people living with chronic conditions, the teams who care for them, and the systems that support both.",
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
