import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/shell";
import { Container } from "@/components/ui/container";
import { Ask } from "@/components/agent/ask";
import { JsonLd } from "@/components/JsonLd";
import { webPageSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Ask the agent",
  description:
    "Ask how famile's products reason. A grounded, on-domain demonstration of the reasoning behind Sukari and Orbura. Not medical advice.",
  alternates: { canonical: "/ask" },
  openGraph: {
    title: "Ask the famile agent",
    description:
      "A grounded demonstration of how Sukari and Orbura reason. Not medical advice.",
  },
};

export default function AskPage() {
  return (
    <MarketingShell>
      <JsonLd
        data={webPageSchema({
          path: "/ask",
          name: "Ask the famile agent",
          description:
            "A grounded demonstration of how Sukari and Orbura reason.",
        })}
      />
      <section className="py-32 sm:py-40">
        <Container>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-ink-dim">
              Agent in the open
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              Ask how it{" "}
              <span className="text-aurora-gradient text-luminous">reasons.</span>
            </h1>
            <p className="mt-6 text-lg text-ink-muted">
              The famile agent answers from the product context, in the open. It
              refuses to give medical advice, and stays on-domain.
            </p>
          </div>
          <Ask />
        </Container>
      </section>
    </MarketingShell>
  );
}
