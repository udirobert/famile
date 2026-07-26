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
- [x] Flip Ardum `urlStatus` to `live` when DNS is ready (`lib/products.ts`)

## Phase 5 — Shared Mira memory store (Base44)

The shared backend that `docs/MIRA.md` calls for. Lives in `../../base44/`.

- [x] Base44 entities: `MiraSession`, `MiraTurn`, `PostureEvent`,
      `CareTeamAlert` (with RLS scoped to `session_key`)
- [x] `miraAnswer` function: streams Mira's reply, persists both turns
      (PHI-scrubbed), loads context, emits posture transitions
- [x] `miraHistory` function: reads session turns for client hydration
- [x] `miraPosture` function: writes posture transitions (realtime trigger)
- [x] `miraNetwork` function: network snapshot for the dashboard feed
- [x] `miraFollowUp` automation: hourly, follows up on deferred promises
- [x] `miraDigest` automation: weekly, compiles posture digest
- [x] `miraEscalation` automation: on posture disruption, creates alert +
      posts to Slack
- [x] Auth (Google login) for care-team access
- [x] Native AI agent config (`agents/mira.jsonc`) with entity + function tools
- [x] Shared Slack connector for care-team escalation
- [x] `lib/agent/memory.ts`: client wrapper with graceful fallback
- [x] `app/api/agent/route.ts`: proxies to Base44 with local engine fallback
- [x] `app/api/agent/history/route.ts`: hydrates prior turns on mount
- [x] `app/api/agent/share/route.ts`: session key for cross-product share link
- [x] `lib/agent/network.ts`: realtime posture feed (polling for external SDK)
- [x] Orb reacts to conversational posture (instant, client-side)
- [x] Orb colors shift with posture (not just speed/distortion)
- [x] Memory bloom on hydration (wordless "I was here")
- [x] "What shifted" feed reads live posture events in product voice
- [x] Share link (`?session=<key>`) for cross-product browser moment
- [x] Sibling probe: `orbura/scripts/probe-shared-mira.mjs` (read-only)
