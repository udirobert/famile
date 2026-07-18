import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/shell";
import { Container } from "@/components/ui/container";
import { JsonLd } from "@/components/JsonLd";
import { webPageSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How famile.xyz handles information, including the demonstration AI agent at /ask. We do not store your queries.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "famile Privacy Policy",
    description:
      "How famile.xyz handles information. We do not store your /ask queries.",
  },
};

const UPDATED = "18 July 2026";

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <JsonLd
        data={webPageSchema({
          path: "/privacy",
          name: "famile Privacy Policy",
          description: "How famile.xyz handles information.",
        })}
      />
      <section className="py-32 sm:py-40">
        <Container>
          <article className="mx-auto max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-ink-dim">
              Legal
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              Privacy{" "}
              <span className="text-aurora-gradient text-luminous">Policy</span>
            </h1>

            <div className="mt-8 rounded-[var(--radius-md)] border border-aurora-amber/40 bg-aurora-amber/10 p-4 text-sm text-ink-muted">
              <strong className="text-ink">Draft.</strong> This is a draft for
              review by a qualified lawyer before launch. It is not legal
              advice. Last updated: {UPDATED}.
            </div>

            <div className="mt-10 space-y-10 text-sm leading-relaxed text-ink-muted">
              <p>
                famile (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates famile.xyz.
                This policy explains what information we process, why, and your
                rights. It covers visitors to the website and users of the
                demonstration AI agent at <code>/ask</code>.
              </p>

              <Section n="1" title="Who we are">
                <p>
                  famile is responsible for your personal data under this
                  policy. Contact:{" "}
                  <a className="underline" href="mailto:hello@famile.xyz">
                    hello@famile.xyz
                  </a>
                  .
                </p>
              </Section>

              <Section n="2" title="The AI agent (/ask)">
                <p>
                  When you submit a question to <code>/ask</code>, your query
                  text is sent to our AI provider, Anthropic (based in the
                  United States), to generate a response.
                </p>
                <ul className="ml-5 list-disc space-y-2">
                  <li>
                    We do <strong className="text-ink">not</strong> store your
                    queries, the responses, or any log linking you to a query.
                    Queries are processed in real time to return an answer and
                    then discarded.
                  </li>
                  <li>
                    Anthropic acts as a processor on our behalf for the sole
                    purpose of returning a response.
                  </li>
                  <li>
                    The agent is designed to refuse personal health
                    information. Please do not submit it.
                  </li>
                </ul>
              </Section>

              <Section n="3" title="Contact">
                <p>
                  If you email partners@, care@, or hello@famile.xyz, we retain
                  the contents of your message only to respond to your enquiry,
                  then delete it within a reasonable period.
                </p>
              </Section>

              <Section n="4" title="Cookies and analytics">
                <p>
                  We do not use analytics or advertising cookies on famile.xyz
                  at present; the site sets no tracking cookies. If we add
                  measurement tools, we will update this policy and, where
                  required, ask for consent.
                </p>
              </Section>

              <Section n="5" title="Legal basis (UK GDPR / GDPR)">
                <ul className="ml-5 list-disc space-y-2">
                  <li>
                    For the <code>/ask</code> agent, we rely on our legitimate
                    interests in providing and demonstrating the service.
                  </li>
                  <li>
                    For contact emails, we rely on our legitimate interests
                    (or necessity to take steps at your request) to respond to
                    you.
                  </li>
                </ul>
                <p>
                  Because we do not store <code>/ask</code> queries, there is no
                  retained personal data to exercise rights over for those
                  inputs; for contact emails you may exercise the rights below.
                </p>
              </Section>

              <Section n="6" title="US consumers (CCPA)">
                <p>
                  We do not &ldquo;sell&rdquo; or &ldquo;share&rdquo; personal
                  information as defined by the CCPA, and we do not profile.
                  California and other US-state consumers may request to know,
                  delete, or correct the limited personal information we hold
                  (contact emails); we will not discriminate for exercising
                  these rights.
                </p>
              </Section>

              <Section n="7" title="International transfers">
                <p>
                  Your <code>/ask</code> queries are transmitted to Anthropic in
                  the United States. Under the UK GDPR/GDPR, such transfers
                  rely on Standard Contractual Clauses (or the provider&rsquo;s
                  equivalent data-processing terms) and the safeguards in our
                  agreement with the provider.
                </p>
              </Section>

              <Section n="8" title="AI transparency">
                <p>
                  <code>/ask</code> is an artificial-intelligence system. Its
                  responses may be inaccurate or unexpected. It is not medical
                  advice. Real use of famile products is supervised by a
                  clinician. This reflects the transparency expectations of the
                  EU AI Act.
                </p>
              </Section>

              <Section n="9" title="Your rights">
                <p>
                  Under the UK GDPR/GDPR you may request access, rectification,
                  erasure, restriction, objection, and portability, and you may
                  lodge a complaint with the Information
                  Commissioner&rsquo;s Office or your local supervisory
                  authority. Under the CCPA and similar US laws you may request
                  to know, delete, and correct. Email{" "}
                  <a className="underline" href="mailto:hello@famile.xyz">
                    hello@famile.xyz
                  </a>{" "}
                  to exercise any right. We respond within the timeframes the
                  law requires.
                </p>
              </Section>

              <Section n="10" title="Children">
                <p>
                  famile.xyz is not directed at children under 16 (UK/EU) or 13
                  (US), and we do not knowingly collect their personal data.
                </p>
              </Section>

              <Section n="11" title="Retention">
                <p>
                  <code>/ask</code> queries: not retained. Contact emails:
                  retained only as long as necessary to respond, then deleted.
                </p>
              </Section>

              <Section n="12" title="Security">
                <p>
                  We use standard technical and organisational measures. The
                  agent is rate-limited and refuses personal health
                  information. Transmitting information to any online service
                  carries residual risk; please do not submit sensitive health
                  details to the agent.
                </p>
              </Section>

              <Section n="13" title="Changes">
                <p>
                  We may update this policy and will note the date above.
                </p>
              </Section>

              <Section n="14" title="Contact">
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
