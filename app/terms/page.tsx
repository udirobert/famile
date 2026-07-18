import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/shell";
import { Container } from "@/components/ui/container";
import { JsonLd } from "@/components/JsonLd";
import { webPageSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms for using famile.xyz and its demonstration AI agent. Informational only; not medical advice.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "famile Terms of Use",
    description:
      "Terms for using famile.xyz and the /ask agent. Not medical advice.",
  },
};

const UPDATED = "18 July 2026";

export default function TermsPage() {
  return (
    <MarketingShell>
      <JsonLd
        data={webPageSchema({
          path: "/terms",
          name: "famile Terms of Use",
          description: "Terms for using famile.xyz and the /ask agent.",
        })}
      />
      <section className="py-32 sm:py-40">
        <Container>
          <article className="mx-auto max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-ink-dim">
              Legal
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              Terms of{" "}
              <span className="text-aurora-gradient text-luminous">Use</span>
            </h1>

            <div className="mt-8 rounded-[var(--radius-md)] border border-aurora-amber/40 bg-aurora-amber/10 p-4 text-sm text-ink-muted">
              <strong className="text-ink">Draft.</strong> This is a draft for
              review by a qualified lawyer before launch. It is not legal
              advice. Last updated: {UPDATED}.
            </div>

            <div className="mt-10 space-y-10 text-sm leading-relaxed text-ink-muted">
              <p>
                By accessing famile.xyz you agree to these terms. If you do not
                agree, please do not use the site.
              </p>

              <Section n="1" title="The service">
                <p>
                  famile.xyz provides health-orientation content and a public
                  demonstration AI agent at <code>/ask</code> (&ldquo;the
                  agent&rdquo;). The site and agent are provided for general
                  informational and demonstration purposes.
                </p>
              </Section>

              <Section n="2" title="Not medical advice (important)">
                <p>
                  Content and agent responses are informational only. They are
                  not medical advice, diagnosis, or treatment, and do not
                  create a provider-patient relationship. Do not rely on them
                  for medical decisions. Always seek the advice of a qualified
                  health professional. In a medical emergency, contact your
                  local emergency number immediately.
                </p>
              </Section>

              <Section n="3" title="AI disclaimer">
                <p>
                  <code>/ask</code> is an artificial-intelligence system. Its
                  responses may be inaccurate, incomplete, or unexpected. Do
                  not rely on them for any decision, medical or otherwise.
                </p>
              </Section>

              <Section n="4" title="Acceptable use">
                <p>You agree not to:</p>
                <ul className="ml-5 list-disc space-y-2">
                  <li>submit personal health information to the agent;</li>
                  <li>
                    attempt to override, extract, or probe the agent&rsquo;s
                    instructions;
                  </li>
                  <li>
                    scrape, crawl, or access the{" "}
                    <code>/api/agent</code> endpoint via automated means;
                  </li>
                  <li>exceed or circumvent the rate limits; or</li>
                  <li>use the site for any unlawful or harmful purpose.</li>
                </ul>
              </Section>

              <Section n="5" title="Intellectual property">
                <p>
                  The famile name, marks, content, and design are owned by us.
                  The agent&rsquo;s responses are provided for your personal,
                  non-commercial use.
                </p>
              </Section>

              <Section n="6" title="Third-party processing">
                <p>
                  Submitting a query to <code>/ask</code> transmits it to our AI
                  provider (Anthropic, US) for the purpose of generating a
                  response. See the Privacy Policy.
                </p>
              </Section>

              <Section n="7" title="Limitation of liability">
                <p>
                  To the maximum extent permitted by law, famile is not liable
                  for any loss arising from use of the site or reliance on agent
                  responses. Nothing in these terms limits liability that
                  cannot be limited under applicable law (for example, liability
                  for fraud, or for death or personal injury caused by
                  negligence).
                </p>
              </Section>

              <Section n="8" title="Governing law">
                <p>
                  <em>To be confirmed with counsel</em> (suggest England &
                  Wales, or your operating seat). These terms are governed by
                  the laws of [jurisdiction], and the courts of [jurisdiction]
                  have exclusive jurisdiction over any dispute.
                </p>
              </Section>

              <Section n="9" title="Changes">
                <p>
                  We may update these terms and will note the date above.
                </p>
              </Section>

              <Section n="10" title="Contact">
                <p>
                  <a className="underline" href="mailto:hello@famile.xyz">
                    hello@famile.xyz
                  </a>
                </p>
              </Section>
            </div>
          </article>
        </Container>
      </section>
    </MarketingShell>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 font-display text-2xl tracking-tight text-ink">
        <span className="mr-3 font-mono text-sm text-aurora-mint/70">{n}</span>
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
