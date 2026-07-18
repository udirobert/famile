import { Suspense } from "react";
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
          description: "A quiet field for attention — and what follows from it.",
        })}
      />
      <Suspense fallback={<HeroFallback />}>
        <Hero />
      </Suspense>
      <ExperienceSection />
      <Principles />
      <CTA />
    </MarketingShell>
  );
}

function HeroFallback() {
  return (
    <section className="relative flex min-h-[100svh] items-center pt-24">
      <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-8 lg:px-12">
        <p className="font-display text-6xl italic tracking-tight text-ink/40">
          famile
        </p>
      </div>
    </section>
  );
}
