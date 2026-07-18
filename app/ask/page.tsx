import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/shell";
import { AskExperience } from "@/components/agent/ask-experience";
import { JsonLd } from "@/components/JsonLd";
import { webPageSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Mira",
  description: "Conversation with Mira. Not medical advice.",
  alternates: { canonical: "/ask" },
  openGraph: {
    title: "Mira — famile",
    description: "Attention, evidence, continuity.",
  },
};

export default function AskPage() {
  return (
    <MarketingShell>
      <JsonLd
        data={webPageSchema({
          path: "/ask",
          name: "Ask Mira",
          description: "Attention, evidence, and continuity for staying well.",
        })}
      />
      <AskExperience />
    </MarketingShell>
  );
}
