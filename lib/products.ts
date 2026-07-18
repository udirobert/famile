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
    tagline: "A daily companion for metabolic care that has to last.",
    description:
      "Sukari helps people managing type 2 diabetes, prediabetes, or GLP-1-supported care stay with it day to day — and gives care teams the signal that matters, not the noise that doesn't.",
    longDescription:
      "Living with a metabolic condition is daily, unglamorous work. Sukari reads the biomarker patterns, settles on one thing worth doing today, lets you try it before it counts, and tells your care team only what shifted. Built for the person at home, the clinician remote, and the programme in between.",
    category: "Metabolic Care",
    status: "AI-native",
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
    name: "Orbura",
    tagline: "Recovery intelligence for people, and the teams around them.",
    description:
      "Orbura reads lifestyle and biometric signal to flag the early signs of burnout, injury, and plateau — then shapes a recovery plan that fits how people actually live.",
    longDescription:
      "Recovery isn't a phase you reach; it's the work between the work. Orbura reads the signals that precede burnout, injury, and plateau, then adapts a recovery plan to how someone actually lives. Built for individuals, squads, and the clinicians and coaches in their corner.",
    category: "Recovery Intelligence",
    status: "AI-enabled",
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
];

export function getProduct(slug: ProductSlug): Product {
  const product = products.find((p) => p.slug === slug);
  if (!product) throw new Error(`Unknown product: ${slug}`);
  return product;
}
