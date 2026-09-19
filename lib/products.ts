export type ProductSlug = "sukari" | "orbura" | "ardum" | "kytos" | "lemma";

export type ProductUrlStatus = "live" | "soon";

export type ProductKind = "practice" | "research";

export type Product = {
  slug: ProductSlug;
  kind: ProductKind;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  category: string;
  glyph: { from: string; to: string };
  accent: string;
  status: "AI-native" | "AI-enabled";
  url: string;
  urlStatus: ProductUrlStatus;
  repo?: string;
  features: { title: string; body: string }[];
  metric: { label: string; value: string }[];
};

export const products: Product[] = [
  {
    slug: "sukari",
    kind: "practice",
    name: "Sukari",
    tagline: "A daily companion for metabolic care that has to last.",
    description:
      "Sukari helps people managing type 2 diabetes, prediabetes, or GLP-1-supported care stay with it day to day — and gives care teams the signal that matters, not the noise that doesn't.",
    longDescription:
      "Living with a metabolic condition is daily, unglamorous work. Sukari reads the biomarker patterns, settles on one thing worth doing today, lets you try it before it counts, and tells your care team only what shifted. Built for the person at home, the clinician remote, and the programme in between.",
    category: "Metabolic Care",
    status: "AI-native",
    url: "https://sukari.famile.xyz",
    urlStatus: "live",
    glyph: { from: "#c4b0ff", to: "#7ee8c8" },
    accent: "#7ee8c8",
    features: [
      {
        title: "One thing today",
        body: "Biomarker patterns collapse into a single, doable action — never a wall of metrics to interpret first.",
      },
      {
        title: "Try it before it counts",
        body: "A short practice run primes the decision before it's live, so adherence is built by repetition, not willpower alone.",
      },
      {
        title: "Only what shifted",
        body: "Care teams see what diverged and why — a note, not another screen to watch.",
      },
    ],
    metric: [
      { label: "Daily focus", value: "1 action" },
      { label: "Practice before live", value: "90s" },
      { label: "Care-team signal", value: "By exception" },
    ],
  },
  {
    slug: "orbura",
    kind: "practice",
    name: "Orbura",
    tagline: "Recovery intelligence for people, and the teams around them.",
    description:
      "Orbura reads lifestyle and biometric signal to flag the early signs of burnout, injury, and plateau — then shapes a recovery plan that fits how people actually live.",
    longDescription:
      "Recovery isn't a phase you reach; it's the work between the work. Orbura reads the signals that precede burnout, injury, and plateau, then adapts a recovery plan to how someone actually lives. Built for individuals, squads, and the clinicians and coaches in their corner.",
    category: "Recovery Intelligence",
    status: "AI-enabled",
    url: "https://orbura.famile.xyz",
    urlStatus: "live",
    glyph: { from: "#ffb8e0", to: "#ffc581" },
    accent: "#ffb8e0",
    features: [
      {
        title: "Signal, not noise",
        body: "Recovery intelligence drawn from the lifestyle and biometric streams you already own — distilled, not dumped.",
      },
      {
        title: "Scales with the unit of care",
        body: "From one person to a whole squad's load management, Orbura grows with whoever's responsible.",
      },
      {
        title: "In the clinician's language",
        body: "Coaches and clinicians receive context they can act on — no translation layer, no second system.",
      },
    ],
    metric: [
      { label: "Early warning", value: "Days ahead" },
      { label: "Plan adaptivity", value: "Live" },
      { label: "Unit of care", value: "1 → squad" },
    ],
  },
  {
    slug: "ardum",
    kind: "practice",
    name: "Ardum",
    tagline: "The shape of your practice — intention before inventory.",
    description:
      "Ardum is a persistent guide for intentions that may become rest, reconnection, or retreat. Mira clarifies what matters, keeps the intention alive, and advances it without demanding premature certainty.",
    longDescription:
      "People do not want reservations first; they want rest, reconnection, celebration, recovery, or change. Ardum begins with the life intention. Mira remembers permitted context, recommends one next step, and can monitor, hold, coordinate, or book only when authority is explicitly granted. Booking is an implementation detail — continuity from intention to outcome is the product.",
    category: "Practice Continuity",
    status: "AI-native",
    url: "https://ardum.famile.xyz",
    urlStatus: "live",
    glyph: { from: "#7ee8c8", to: "#ffc581" },
    accent: "#ffc581",
    features: [
      {
        title: "Intention before inventory",
        body: "Begin with what you are trying to make space for — not a catalog of places and filters.",
      },
      {
        title: "One decision at a time",
        body: "Mira asks only for judgment the system cannot supply. Everything else stays in her care.",
      },
      {
        title: "Earned agency",
        body: "Monitoring, holds, coordination, and booking require explicit, scoped consent — never implied by memory.",
      },
    ],
    metric: [
      { label: "Primary object", value: "Episode" },
      { label: "Decisions asked", value: "One at a time" },
      { label: "Booking", value: "Secondary" },
    ],
  },
  {
    slug: "kytos",
    kind: "research",
    name: "Kytos",
    tagline: "How an unseen cell will answer perturbation, read from its quiet state.",
    description:
      "Kytos predicts how an unseen cellular context responds to CRISPRi perturbation from its unperturbed basal state alone. An entry for the 2026 Virtual Cell Challenge, built in public through the Kytos Observatory.",
    longDescription:
      "Kytos (κύτος, 'hollow vessel') holds what the measurements say and nothing more. Every experiment the project runs publishes to the Kytos Observatory — cell-eval metrics, ceiling headroom, biological audit flags, literature evidence — including the probe run deliberately built to fail. The next experiment is chosen by distance to the measured ceiling, not by leaderboard position.",
    category: "Cellular Modelling",
    status: "AI-native",
    url: "https://kytos.netlify.app",
    repo: "https://github.com/udirobert/kytos",
    urlStatus: "live",
    glyph: { from: "#7ec8ff", to: "#7ee8c8" },
    accent: "#7ec8ff",
    features: [
      {
        title: "Basal only",
        body: "Predictions are made from the unperturbed state alone — no peeking at the perturbation data for the context being tested.",
      },
      {
        title: "The Observatory",
        body: "Every run publishes its metrics, audit flags, and briefing as it lands. Failures stay on the wall beside the rest.",
      },
      {
        title: "Ceiling as compass",
        body: "Headroom to the measured ceiling decides the next experiment, not rank.",
      },
    ],
    metric: [
      { label: "Cells", value: "360k" },
      { label: "Targets", value: "300" },
      { label: "Runs shared", value: "Every one" },
    ],
  },
  {
    slug: "lemma",
    kind: "research",
    name: "Lemma",
    tagline: "An auditor of scientific claims that refuses to trust itself.",
    description:
      "Lemma takes an unseen paper, extracts its testable claims, writes and runs honest numerical audits, assembles an inspectable evidence trail — then a judge decides whether the trail is trustworthy before any human looks at it.",
    longDescription:
      "A paper becomes a self-judged evidence trail: supported, falsified, or inconclusive, with the receipts attached. Success criteria may only be derived from a claim's own wording — no added thresholds. Every LLM call and tool result lands in an append-only trace, so the reasoning is auditable end to end. Built for the re:AGENT End-to-End Agentic Science track at Founders Inc.",
    category: "Agentic Science",
    status: "AI-native",
    url: "https://github.com/udirobert/lemma",
    repo: "https://github.com/udirobert/lemma",
    urlStatus: "live",
    glyph: { from: "#e8e2b8", to: "#c4b0ff" },
    accent: "#e8e2b8",
    features: [
      {
        title: "Claims, not vibes",
        body: "Up to six testable claims are extracted per paper, ordered by importance, each with a success criterion drawn only from the claim's own statement.",
      },
      {
        title: "Honest audits",
        body: "Numerical audits are written and run per claim. Where reproduction can't reach the paper's number, the gap is recorded — not the threshold.",
      },
      {
        title: "Judge before human",
        body: "A judge grades the assembled logbook's trustworthiness first; every call and result sits in an append-only trace.",
      },
    ],
    metric: [
      { label: "Pipeline", value: "4 stages" },
      { label: "Claims / paper", value: "≤ 6" },
      { label: "Trace", value: "Append-only" },
    ],
  },
];

export function getProduct(slug: ProductSlug): Product {
  const product = products.find((p) => p.slug === slug);
  if (!product) throw new Error(`Unknown product: ${slug}`);
  return product;
}

export const practiceProducts = products.filter(
  (p): p is Product & { kind: "practice" } => p.kind === "practice",
);

export const researchProducts = products.filter(
  (p): p is Product & { kind: "research" } => p.kind === "research",
);

export function productOpenLabel(product: Product): string {
  if (product.urlStatus === "soon") return `${product.name} coming soon`;
  return `Open ${product.name}`;
}
