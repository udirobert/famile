import { Suspense } from "react";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/shell";
import { Hero } from "@/components/marketing/hero";
import { ExperienceSection } from "@/components/marketing/experience-section";
import { ProductSuite } from "@/components/marketing/product-suite";
import { Principles } from "@/components/marketing/principles";
import { CTA } from "@/components/marketing/cta";
import { CssOrb } from "@/components/motion/css-orb";
import { JsonLd } from "@/components/JsonLd";
import { webPageSchema } from "@/lib/schema";

export default function Home() {
  return (
    <MarketingShell>
      <JsonLd
        data={webPageSchema({
          path: "/",
          name: "famile",
          description:
            "famile builds companions for the daily work of staying well — metabolic care, recovery, and practice.",
        })}
      />
      <Suspense fallback={<HeroFallback />}>
        <Hero />
      </Suspense>
      <ExperienceSection />
      <ProductSuite />
      <Principles />
      <CTA />
    </MarketingShell>
  );
}

function HeroFallback() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-x-clip pt-24 pb-16">
      <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-8 lg:px-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="flex min-h-[280px] flex-col justify-center sm:min-h-[320px] lg:min-h-[440px]">
            <h1 className="font-display text-6xl italic leading-[1.2] tracking-[-0.02em] sm:text-7xl lg:text-8xl">
              <span className="text-aurora-gradient text-luminous inline-block pr-[0.18em]">
                famile
              </span>
            </h1>
            <p className="mt-8 max-w-sm text-lg leading-relaxed text-ink-muted">
              Companions for the daily work of staying well — metabolic care,
              recovery, and practice.
            </p>
            <div className="mt-10">
              <Link
                href="/?mira=1"
                className="relative inline-flex h-13 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-aurora-lavender via-aurora-iris to-aurora-mint px-8 text-base font-medium tracking-tight text-canvas shadow-[0_8px_40px_-8px_rgba(196,176,255,0.5)]"
              >
                Ask Mira
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[260px] sm:max-w-[360px] lg:max-w-[480px]">
            <div className="relative mx-auto aspect-square w-full">
              <div
                className="absolute inset-10 rounded-full bg-aurora-iris/30 blur-[80px]"
                aria-hidden
              />
              <div className="absolute inset-0 p-[8%]">
                <CssOrb
                  from="#c4b0ff"
                  to="#7ee8c8"
                  className="absolute inset-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
