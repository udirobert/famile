# Mira alignment — implementation plan

**Companion to:** [MIRA.md](./MIRA.md)
**Goal:** One Mira persona across Famile, Sukari, Orbura, and Ardum, with the
orb's render tier as part of the emotional vocabulary.

This plan is phased so each phase ships value on its own. No phase depends on
a later one. Work can proceed in parallel across repos once Phase 0 lands.

---

## Phase 0 — Canonical contract (week 1)

**Outcome:** Every repo points to one document and one contract file.

- [x] Publish `famile/web/docs/MIRA.md` (canonical persona + orb spec).
- [x] Publish `famile/web/docs/MIRA_IMPLEMENTATION_PLAN.md` (this file).
- [ ] In Orbura: mark `docs/mira-famile-handoff.md` as superseded, replace
      its body with a one-line pointer to `famile/web/docs/MIRA.md`. Keep
      `src/lib/mira/contract.ts` as the shared contract code source for now.
- [ ] In Ardum: add a pointer line at the top of
      `docs/design/mira-presence.md` → `famile/web/docs/MIRA.md`.
- [ ] In Sukari: add a pointer line at the top of the Mira section in
      `docs/PRODUCT_DESIGN.md` → `famile/web/docs/MIRA.md`.
- [x] In Famile: link `MIRA.md` from `docs/VOICE.md` and the nav in
      `docs/VISION.md`.

**No code changes.** This phase is documentation only. It establishes the
arbiter before any product diverges further.

---

## Phase 1 — Persona convergence (week 2)

**Outcome:** Every Mira speaks in the same register and enforces the same
safety charter.

### Voice: shift to 2nd person

The network voice is 2nd person, present tense, warm-restrained. Today
Sukari and Orbura use 3rd person ("Mira noticed…"). Ardum and Famile already
use 2nd person.

- [ ] **Sukari** `server/leaderboard-worker/src/coach.ts`: rewrite the
      `SYSTEM` prompt to 2nd person. Update copy templates in
      `domain/agent/miraPresence.ts` from "Mira noticed a pattern" to
      "I noticed a pattern" (or drop the subject: "A pattern surfaced").
      Keep the operational content; change only the person.
- [ ] **Orbura** `src/lib/mira/contract.ts` and
      `src/lib/mira/orbura-mapping.ts`: update voice guidelines from 3rd to
      2nd person. Update prescription copy templates.
- [ ] **Ardum** `src/agent/mira-voice.ts`: already 2nd person. Audit only.
- [ ] **Famile** `lib/agent/live.ts`: already 2nd person. Audit only.

### Safety charter: adopt Sukari's agency charter network-wide

- [ ] Lift `sukari/constants/agencyCharter.ts` into the shared contract
      shape (Always / Asks first / Never lanes).
- [ ] Add the charter to each product's system prompt as a structured block,
      not free text.
- [ ] Surface the charter in each product's UI where it already exists
      (Sukari's `app/charter.tsx`) — at minimum, link to it from the
      conversation panel footer.

### Cross-product memory line

- [ ] Every system prompt includes the current contract: "Do not imply
      cross-product memory. Say 'Mira in {product}' if the boundary matters."
- [ ] Track this as a single string in the shared contract so it updates in
      one place when the shared memory store lands.

---

## Phase 2 — Posture vocabulary alignment (week 3)

**Outcome:** Every product computes postures from the canonical enum.

### Renames (breaking, do in one pass)

- [ ] **Ardum**: rename `arriving` → `completed` in `mira-presence.ts`,
      `mira-voice.ts`, and all callers. Semantics unchanged.
- [ ] **Sukari**: rename `waiting` → `watching` in `miraPresence.ts` and
      all callers. Semantics unchanged.

### Additions

- [ ] **Sukari**: add `steady` as the default/idle posture (landing state,
      no active mission). Update `miraPresence.ts` and the mission card.
- [ ] **Famile**: add posture projection. Today the orb has zero postures —
      it just morphs colors. Add a `miraPresence` projection from chat state
      (`steady` idle → `inquiry` user typing → `offering` Mira responding →
      `steady` after). This is the biggest single UX upgrade on the home
      page.

### Shared contract file

- [ ] Copy `orbura/src/lib/mira/contract.ts` into:
      - `ardum/src/agent/mira-contract.ts`
      - `sukari/domain/agent/miraContract.ts`
      - `famile/web/lib/agent/mira-contract.ts`
- [ ] Update each product's presence module to import
      `MiraPosture`, `MiraPresence`, `MiraReactionKind`, `MorphParams` from
      the shared contract instead of defining them locally.
- [ ] Add a `// @famile/mira-contract — keep in sync with
      // famile/web/docs/MIRA.md` header to each copy.

When the contract stabilises after Phase 2, extract to a private npm package.
Until then, manual sync with this doc as arbiter.

---

## Phase 3 — Orb spec: morph params + tier transitions (weeks 4–5)

**Outcome:** Every orb reads from the same `MorphParams` shape and the same
tier-transition semantics. Mira escalates and settles between tiers as
emotional signal.

### Reference implementation

Ardum's `mira-presence.ts` already emits `MorphParams`. Promote it to the
canonical shape in the shared contract.

- [ ] Add `MorphParams` to `contract.ts` with the fields defined in
      [MIRA.md §3](./MIRA.md#morph-parameters-canonical).
- [ ] Add `MiraRenderTier` (`inline` | `standard` | `hero`) and
      `tierTransition` semantics to the contract.
- [ ] Add the posture → `MorphParams` table as a pure function in the
      contract: `postureMorph(posture, valence): MorphParams`.

### Per-product tier adoption

- [ ] **Ardum** (reference): already has hero/standard/inline. Audit
      `MiraScene.tsx` against the canonical `MorphParams` field names. Add
      the tier-transition easing (600–900ms, seek-safe) if missing.
- [ ] **Famile** `components/motion/morph-blob.tsx`: adopt posture-driven
      morph. Today it lerps colors only. Add `MorphParams` consumption:
      distortion from `bloom` + `pinch`, speed from `speed`, float from
      `asymmetry`. Add tier escalation: hero on `/ask`, standard on landing
      hero, inline in nav.
- [ ] **Orbura** `components/screens/DebtOrb.tsx`: keep the CSS blob as the
      inline tier. Add a `standard` tier (2D WebGL metaball) for the
      dashboard hero. Map `MorphParams` to CSS custom properties at inline,
      to shader uniforms at standard. The debt gauge stays separate from
      Mira's orb — Mira is a smaller presence beside the prescription, not a
      replacement for the gauge.
- [ ] **Sukari** `components/agent/MiraOrb.tsx`: keep SVG as the inline tier
      (native constraint). Map `MorphParams` to SVG gradient stops and
      Reanimated values. Add posture-driven hue temperature from the
      palette tokens table. Sukari will not have hero/standard on native —
      that's fine, inline is the native ceiling.

### Tier-transition wiring

- [ ] Define `useMiraTier(presence, surface)` hook in the contract: returns
      the current tier and a transition state. Each product implements the
      actual render swap against its stack.
- [ ] Wire tier transitions to operational moments:
      - User focuses input → inline → standard
      - Recommendation surfaces → standard → hero
      - Decision made → hero → standard
      - Person leaves surface → standard → inline

---

## Phase 4 — Conversation surface everywhere (weeks 5–6)

**Outcome:** Tapping the orb opens a conversation with Mira in every product.

### Canonical chat component

Famile's `components/agent/mira-conversation.tsx` is the reference. Extract
its spec into the shared contract (props, states, streaming protocol).

- [ ] **Famile**: already has the chat. Extract the spec; no functional
      change.
- [ ] **Sukari**: replace the modal sheet in `MainMenu.tsx` with a
      posture-aware chat panel that follows the canonical spec. Keep the
      mission context header. Native reimplementation against the spec —
      the component itself is web-only.
- [ ] **Ardum**: add "tap orb → ask Mira" on the workbench. Reuse the
      recommendation explanation prompt (`buildRecommendationExplanationPrompt`)
      as the chat backend. Stream the response.
- [ ] **Orbura**: add "tap orb → ask Mira" on the dashboard. This is the
      product with the biggest gap — today Mira is output-only. Wire the
      chat to the QVAC pipeline with a `/api/mira/chat` route that streams.

### Streaming protocol convergence

- [ ] Every product's chat route speaks the Famile wire format:
      `POST { query }` → `ReadableStream` of text chunks, `X-Famile-Live`
      header.
- [ ] Orbura's SSE layering stays for the analysis pipeline; the chat route
      is a separate, simpler stream.
- [ ] Add a `X-Famile-Product` header so a future shared backend can route
      by product.

---

## Phase 5 — Shared persona runtime (weeks 7–8, optional)

**Outcome:** One system-prompt builder, one streaming endpoint, one place to
update Mira's voice.

This phase is optional and only worth doing once Phases 1–4 are stable. It is
the step that makes "one AI persona" literally true at the backend.

- [ ] Extract a `buildMiraPrompt({ product, productContext, posture, safetyCharter })`
      function into the shared contract. Every product calls it instead of
      hand-writing its system prompt.
- [ ] Stand up a shared `/api/mira` route (likely in the Famile repo or a
      small worker) that takes `{ product, query, presence }` and streams a
      response. Each product points its chat UI at this route, falling back
      to its local route on failure.
- [ ] Add the `X-Famile-Product` routing so the shared backend can inject
      the right product context.
- [ ] Decide on cross-product memory. If yes: build a shared memory store
      (Supabase is already in use across products) and update the memory
      line in [MIRA.md §1](./MIRA.md#cross-product-memory). If no: leave the
      current contract and document the decision.

---

## Sequencing and parallelism

```
Phase 0 (docs only)
  └─ Phase 1 (persona)        ─┐
  └─ Phase 2 (postures)       ─┼─ can run in parallel across repos
  └─ Phase 3 (orb spec)       ─┘
        └─ Phase 4 (chat)     ── depends on Phase 3 tier work
              └─ Phase 5 (shared runtime) ── depends on 1–4 stable
```

Phases 1, 2, and 3 can proceed in parallel across the four repos once
Phase 0 lands, because they touch different files per repo. Phase 4 depends
on the tier work in Phase 3 (the chat panel mounts at a specific tier).
Phase 5 is the consolidation step and is optional until the rest is stable.

---

## Verification per phase

| Phase | Verification |
|---|---|
| 0 | Every repo's docs link to `famile/web/docs/MIRA.md`; no conflicting posture definitions remain in docs |
| 1 | A user reading Mira copy in any product cannot tell which product wrote it (blind test); safety charter present in every system prompt |
| 2 | `grep -r "MiraPosture" --include="*.ts"` shows imports from the shared contract in all four repos; no local enum definitions remain |
| 3 | Every orb renders the same posture to the same `MorphParams` (snapshot test against `postureMorph()`); tier transitions share easing and duration |
| 4 | Tapping the orb in every product opens a chat panel; streaming works; `X-Famile-Live` and `X-Famile-Product` headers present |
| 5 | One `buildMiraPrompt()` call site per product; shared route serves at least one product's chat in production |

---

## What this plan does not do

- **Does not force one component.** Sukari stays React Native; the orb is a
  spec, not a shared import. The chat is a spec on native, a shared component
  on web.
- **Does not force one palette.** Each product keeps its hues. Only
  temperature (warm/cool/muted) is shared.
- **Does not force one LLM.** Provider choice stays per-product. Phase 5
  consolidates the *prompt builder*, not the model.
- **Does not promise cross-product memory yet.** That is a deliberate
  decision point in Phase 5, not a precondition.

The contract is posture grammar, voice, and orb spec. The pixels, the
provider, and the product domain stay where they are.
