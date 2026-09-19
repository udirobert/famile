# Famile product suite

Canonical catalog for the compass site. Depth lives in each product’s own repo; this page is orientation only.

External apps (not this Next.js app) deliver continuous care and practice:

| Product | Job | URL | Status |
|---------|-----|-----|--------|
| **Sukari** | One doable metabolic action + care-team exceptions | https://sukari.famile.xyz | Live |
| **Orbura** | Recovery / care-continuity — signal → one safe action | https://orbura.famile.xyz | Live |
| **Ardum** | Intention → continuity (Mira / episodes); booking is secondary | https://ardum.famile.xyz | Live |

Open research projects (not care apps — no health claims, no user health data):

| Project | Job | URL | Status |
|---------|-----|-----|--------|
| **Kytos** | Predict CRISPRi response in an unseen cellular context from its basal state; VCC 2026 entry, every run published to the Observatory | https://kytos.netlify.app · [repo](https://github.com/udirobert/kytos) | Live |
| **Lemma** | End-to-end claim-audit agent: extract → audit → evidence → judge, append-only trace | [repo](https://github.com/udirobert/lemma) | Live |

In-suite pages at `/products/[slug]` explain and orient. Outbound CTAs open the live apps gently.

## Soft-match guidance

Match only when the insight clearly maps. Otherwise leave the person with a takeaway.

| Situation | Soft match | Insight-only examples |
|-----------|------------|------------------------|
| Metabolic adherence, CGM/GLP-1 day-to-day, “one thing today” | **Sukari** | How exception-oriented care works; why one action beats a dashboard |
| Burnout, recovery debt, load vs capacity, early plateau signals | **Orbura** | What recovery debt means; why plans adapt to the week that happened |
| Making space for rest, practice, retreat; intention before inventory | **Ardum** | Why booking isn’t the job; how one decision at a time preserves momentum |
| General curiosity, “what is famile?”, AI-native vs AI-enabled | — | Explain principles; no product pitch required |
| Questions about the research projects, papers, cellular prediction | **Kytos / Lemma** | Describe factually; never offer them as health tools |

## One-liners (for copy and agents)

- **Sukari** — A daily companion for metabolic care that has to last.
- **Orbura** — Recovery intelligence for people, and the teams around them.
- **Ardum** — A persistent guide for intentions that may become practice or retreat. Booking is an implementation detail.
- **Kytos** — Predict how an unseen cellular context answers CRISPRi, from its quiet state alone. Every run published, failures included.
- **Lemma** — An AI auditor of scientific claims that judges its own evidence trail before a human sees it.

## Source of truth in code

[`lib/products.ts`](../lib/products.ts) holds slug, copy, accent, external `url`, optional `repo`, and `urlStatus` (`live` | `soon`). All five catalog entries are `live`.

## Deeper reading (sibling repos)

- Sukari: `../sukari/docs/PRODUCT_DESIGN.md`
- Orbura: `../orbura/docs/product-strategy.md`
- Ardum: `../ardum/docs/product-vision.md`
