import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/shell";
import { Container } from "@/components/ui/container";
import { Ask } from "@/components/agent/ask";
import { JsonLd } from "@/components/JsonLd";
import { webPageSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Ask",
  description:
    "Ask Mira for orientation — takeaways that stand alone, or how Sukari, Orbura, and Ardum reason. Not medical advice. Opening an app is never required.",
  alternates: { canonical: "/ask" },
  openGraph: {
    title: "Ask Mira — famile orientation",
    description:
      "Takeaway-first orientation. Soft product mentions only when clearly mapped. Not medical advice.",
  },
};

export default function AskPage() {
  return (
    <MarketingShell>
      <JsonLd
        data={webPageSchema({
          path: "/ask",
          name: "Ask Mira — famile orientation",
          description:
            "Orientation guide: insight first, soft paths into suite products when earned.",
        })}
      />
      <section className="py-32 sm:py-40">
        <Container>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-ink-dim">
              Compass
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              Ask for{" "}
              <span className="text-aurora-gradient text-luminous">
                orientation.
              </span>
            </h1>
            <p className="mt-6 text-lg text-ink-muted">
              Leave with a clearer thought. Soft mentions of Sukari, Orbura, or
              Ardum only when they clearly help — never required.
            </p>
          </div>
          <Ask />
        </Container>
      </section>
    </MarketingShell>
  );
}
