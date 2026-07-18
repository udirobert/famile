import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/shell";
import { Container } from "@/components/ui/container";
import { Ask } from "@/components/agent/ask";
import { JsonLd } from "@/components/JsonLd";
import { webPageSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Ask",
  description: "Ask Mira for a takeaway. Not medical advice.",
  alternates: { canonical: "/ask" },
  openGraph: {
    title: "Ask Mira",
    description: "Orientation first. Apps optional.",
  },
};

export default function AskPage() {
  return (
    <MarketingShell>
      <JsonLd
        data={webPageSchema({
          path: "/ask",
          name: "Ask Mira",
          description: "Orientation guide for famile.",
        })}
      />
      <section className="py-32 sm:py-40">
        <Container>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-ink-dim">
              Ask
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              Orient with{" "}
              <span className="text-aurora-gradient text-luminous">Mira.</span>
            </h1>
          </div>
          <Ask />
        </Container>
      </section>
    </MarketingShell>
  );
}
