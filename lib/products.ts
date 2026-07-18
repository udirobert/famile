export type ProductSlug = "sukari" | "orbura";

export type Product = {
  slug: ProductSlug;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  category: string;
  glyph: { from: string; to: string };
  accent: string;
  status: "AI-native" | "AI-enabled";
  features: { title: string; body: string }[];
  metric: { label: string; value: string }[];
};

export const products: Product[] = [
  {
    slug: "sukari",
    name: "Sukari",
    tagline: "The adherence layer for continuous metabolic care.",
    description:
      "An AI adherence engine for at-home metabolic programmes - type 2 diabetes, prediabetes, GLP-1-supported lifestyle care.",
    longDescription:
      "Sukari turns biomarker patterns into one daily mission, rehearses the decision in a short practice, measures the response, and sends the care team an exception-oriented summary - not another dashboard.",
    category: "Metabolic Care",
    status: "AI-native",
    glyph: { from: "#c4b0ff", to: "#7ee8c8" },
    accent: "#7ee8c8",
    features: [
      {
        title: "One daily mission",
        body: "Biomarker patterns collapse into a single, rehearseable action - never a wall of metrics.",
      },
      {
        title: "Rehearse before you act",
        body: "A short practice run primes the decision before it counts, building adherence through repetition.",
      },
      {
        title: "Exception-oriented summary",
        body: "Care teams see what diverged and why - not another dashboard to babysit.",
      },
    ],
    metric: [
      { label: "Adherence lift", value: "+38%" },
      { label: "Mission rehearsal", value: "90s" },
      { label: "Care-team load", value: "-52%" },
    ],
  },
  {
    slug: "orbura",
    name: "Orbura",
    tagline: "Recovery intelligence from lifestyle and biometric signal.",
    description:
      "Turns lifestyle and biometric data into recovery intelligence for people, teams, and care providers.",
    longDescription:
      "Orbura reads the signals that precede burnout, injury, and plateau - then shapes a recovery plan that adapts to how you actually live. Built for individuals, squads, and the clinicians who support them.",
    category: "Recovery Intelligence",
    status: "AI-enabled",
    glyph: { from: "#ffb8e0", to: "#ffc581" },
    accent: "#ffb8e0",
    features: [
      {
        title: "Signal, not noise",
        body: "Recovery intelligence distilled from lifestyle and biometric streams you already own.",
      },
      {
        title: "For people and teams",
        body: "From an individual athlete to squad-level load management, Orbura scales with the unit of care.",
      },
      {
        title: "Care-provider ready",
        body: "Clinicians and coaches receive context in their language - no translation layer required.",
      },
    ],
    metric: [
      { label: "Burnout flags", value: "5d ahead" },
      { label: "Plan adaptivity", value: "live" },
      { label: "Squad coverage", value: "unlimited" },
    ],
  },
];

export function getProduct(slug: ProductSlug): Product {
  const product = products.find((p) => p.slug === slug);
  if (!product) throw new Error(`Unknown product: ${slug}`);
  return product;
}
