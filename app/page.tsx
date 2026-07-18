import { MarketingShell } from "@/components/marketing/shell";
import { Hero } from "@/components/marketing/hero";
import { ExperienceSection } from "@/components/marketing/experience-section";
import { Principles } from "@/components/marketing/principles";
import { CTA } from "@/components/marketing/cta";
import { JsonLd } from "@/components/JsonLd";
import { webPageSchema } from "@/lib/schema";

export default function Home() {
  return (
    <MarketingShell>
      <JsonLd
        data={webPageSchema({
          path: "/",
          name: "famile",
          description: "A warm place to peruse — or just be.",
        })}
      />
      <Hero />
      <ExperienceSection />
      <Principles />
      <CTA />
    </MarketingShell>
  );
}
