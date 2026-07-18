import { MarketingShell } from "@/components/marketing/shell";
import { Hero } from "@/components/marketing/hero";
import { ProductSuite } from "@/components/marketing/product-suite";
import { ExperienceSection } from "@/components/marketing/experience-section";
import { Principles } from "@/components/marketing/principles";
import { CTA } from "@/components/marketing/cta";

export default function Home() {
  return (
    <MarketingShell>
      <Hero />
      <ProductSuite />
      <ExperienceSection />
      <Principles />
      <CTA />
    </MarketingShell>
  );
}
