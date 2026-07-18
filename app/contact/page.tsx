import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/shell";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach the famile team for partnerships, care-team integrations, or a guided walkthrough of the suite.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact famile",
    description:
      "Let's build calmer care. For partnerships, care-team integrations, or a guided walkthrough.",
  },
};

export default function ContactPage() {
  return (
    <MarketingShell>
      <section className="py-32 sm:py-40">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-ink-dim">
              Contact
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              Let&apos;s build{" "}
              <span className="text-aurora-gradient text-luminous">
                calmer care.
              </span>
            </h1>
            <p className="mt-6 text-lg text-ink-muted">
              For partnerships, care-team integrations, or a guided walkthrough
              of the suite - reach out and we&apos;ll respond within one
              business day.
            </p>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Partnerships",
                  value: "partners@famile.xyz",
                },
                {
                  label: "Care teams",
                  value: "care@famile.xyz",
                },
                {
                  label: "General",
                  value: "hello@famile.xyz",
                },
              ].map((c) => (
                <a
                  key={c.label}
                  href={`mailto:${c.value}`}
                  className="group rounded-[var(--radius-lg)] border border-line bg-canvas-elevated/30 p-5 text-left backdrop-blur-xl transition-all duration-300 hover:border-aurora-lavender/40 hover:bg-canvas-elevated/60"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-ink-dim">
                    {c.label}
                  </p>
                  <p className="mt-2 text-sm text-ink transition-colors group-hover:text-aurora-lavender">
                    {c.value}
                  </p>
                </a>
              ))}
            </div>

            <div className="mt-12">
              <Button href="/dashboard" size="lg" transitionTypes={["nav-forward"]}>
                Or explore the suite
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </MarketingShell>
  );
}
