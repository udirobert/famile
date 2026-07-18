# Implementation checklist

Phased build for the compass framing. See [VISION.md](./VISION.md).

## Phase 0 — Docs

- [x] `docs/VISION.md`
- [x] `docs/PRODUCTS.md`
- [x] `docs/VOICE.md`
- [x] `docs/IMPLEMENTATION.md`
- [x] README + AGENTS pointers

## Phase 1 — Data + routing truth

- [x] Extend `lib/products.ts` with Ardum, `url`, `urlStatus`
- [x] Propagate: nav, footer, sitemap, llms.txt, schema, signal desk, agent types, replay

## Phase 2 — Marketing copy → compass

- [x] Hero: orientation CTAs (Ask / explore), not “Enter the suite” as primary win
- [x] CTA section: leave with something useful; products optional
- [x] About: compass + three products
- [x] Principles / experience: insight can stand alone; routing is earned
- [x] Product detail: soft outbound “Open …” CTAs

## Phase 3 — Ask / agent as compass

- [x] Live system prompt: takeaway-first, three products, soft match only when mapped
- [x] Replay: Ardum traces + insight-only answers
- [x] Ask UI: optional quiet product chips after answers
- [x] Signal desk: three-product cycle, not a funnel

## Phase 4 — Polish

- [x] `/products/ardum` page
- [x] OG / llms.txt / JSON-LD for three products
- [ ] Flip Ardum `urlStatus` to `live` when DNS is ready (`lib/products.ts`)
