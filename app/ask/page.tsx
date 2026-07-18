import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/shell";
import { Container } from "@/components/ui/container";
import { Ask } from "@/components/agent/ask";
import { JsonLd } from "@/components/JsonLd";
import { webPageSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Mira",
  description: "Sit with Mira. Not medical advice.",
  alternates: { canonical: "/ask" },
  openGraph: {
    title: "Ask Mira — famile",
    description: "Company, if you'd like it.",
  },
};

export default function AskPage() {
  return (
    <MarketingShell>
      <JsonLd
        data={webPageSchema({
          path: "/ask",
          name: "Ask Mira",
          description: "Sit with Mira on famile.",
        })}
      />
      <section className="py-32 sm:py-40">
        <Container>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-ink-dim">
              Mira
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              Company, if you&apos;d{" "}
              <span className="text-aurora-gradient text-luminous">
                like it.
              </span>
            </h1>
          </div>
          <Ask />
        </Container>
      </section>
    </MarketingShell>
  );
}
