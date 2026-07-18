import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/shell";
import { AskExperience } from "@/components/agent/ask-experience";
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
      <AskExperience />
    </MarketingShell>
  );
}
