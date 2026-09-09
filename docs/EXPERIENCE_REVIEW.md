# Experience review — famile.xyz

A design + engineering review of the compass site: what already works, what
is broken, and where the highest-leverage improvements are across UX, product
design, motion, styling, performance, and language.

Read alongside [VISION.md](./VISION.md) and [VOICE.md](./VOICE.md). Every
recommendation here is framed to serve the vision — calm, embodied, no
conversion theater — not to overwrite it.

---

## 1. Summary

The site already has a real point of view: a living aurora, a breathing orb,
an honest agent ("live" vs "sample"), a rest mode. That is more than most
wellness sites have. The gaps are not taste — they are **structure, clarity,
and budget**:

1. **The products are missing from the homepage.** `ProductSuite` exists but
   is rendered nowhere. A first-time visitor can read every pixel of `/` and
   never learn that famile builds Sukari, Orbura, and Ardum. The hero promises
   "what follows from it" — and then nothing follows.
2. **The language is atmospheric to the point of opacity.** "A quiet field for
   attention" is a feeling, not a claim. VOICE.md prefers "short claims that
   could be checked over brand metaphors" — the current copy inverts that.
3. **The atmosphere is expensive where it should be cheap.** ~1 MB of WebGL
   JavaScript ships in the critical path, three WebGL contexts run on the
   homepage, and the main headline is absent from the prerendered HTML.

Everything else in this document is detail under those three headings.

---

## 2. What is already strong

Keep these. They are the spine.

- **The orb as presence, not decoration.** Posture-driven (inquiry / offering
  / steady), breathing during "sit", dimming during rest. This is the
  memorable asset. MIRA.md's contract thinking shows.
- **"Sit with me" rest mode.** A 90-second breathing pause on a marketing site
  is a genuine differentiator — it *is* the brand, enacted.
- **Honest labeling.** `live` / `sample` indicator, voice-listening
  disclosures, provenance affordances on metrics ("why 90s?"). Trust patterns
  most competitors fake.
- **Motion tokens.** `EASE` / `DUR` / shared variants in `lib/motion.ts`, and
  global `prefers-reduced-motion` handling in both CSS and components.
- **Directional view transitions** between marketing and app shells
  (`nav-forward` / `nav-back`). Subtle, correct, rare.
- **Design tokens in `@theme`.** Aurora palette, radii, shadows, easings —
  a real system, not ad-hoc hex values.
- **The documented restraint in `hero.tsx`** (why crossfade beats layoutId
  morphs). Keep writing these notes; they are how the system stays coherent.

---

## 3. Critical issues

### 3.1 The homepage never shows the products — and a dead anchor proves it

`components/marketing/product-suite.tsx` renders `<section id="suite">` but is
imported by no page. Consequences:

- The homepage story is Hero → aphorisms → principles → "Ask Mira" again.
  The actual offer — three live products — appears only in the footer.
- All three product pages emit a breadcrumb to `/#suite`, an anchor that does
  not exist on the rendered homepage. Dead end, and a signal this section was
  dropped accidentally in a refactor.
- `app/layout.tsx` targets keywords ("GLP-1", "type 2 diabetes",
  "prediabetes") that the homepage copy never mentions, because the section
  that mentions them is orphaned.

**Fix:** reinstate `ProductSuite` between `ExperienceSection` and
`Principles`. That single change repairs the narrative, the anchor, and the
SEO/content mismatch at once. (See §3.5 for the WebGL budget it will need.)

### 3.2 The main headline is not in the initial HTML

`Hero` calls `useSearchParams`, so everything inside its `Suspense` boundary
is client-rendered. The prerendered HTML contains only `HeroFallback` — a
ghost `<p>famile</p>` at 40% opacity. The page's only `h1`, its value
proposition, and its primary CTA all arrive post-hydration, behind ~1 MB of
JS (see 3.4). LCP, SEO, and no-JS resilience all take the hit.

**Fix:** make the fallback *be* the hero — real `h1`, real subline, real
(disabled) CTA — and let the client component hydrate over it. Cheap, high
value.

### 3.3 `ink-dim` fails contrast everywhere it is used

Measured ratios (WCAG):

| Pair | Ratio | AA (normal text) |
|---|---|---|
| `ink-dim` on `canvas` | **2.99:1** | ✗ (needs 4.5) |
| `ink-dim` on `canvas-elevated` | **2.66:1** | ✗ |
| `ink-dim` on `canvas-overlay` | **2.36:1** | ✗ |
| `ink-muted` on `canvas` | 7.94:1 | ✓ |
| `ink` on `canvas` | 15.35:1 | ✓ |

`ink-dim` is used for exactly the text that must be readable: the "Not medical
advice" disclaimer, metric labels, nav eyebrows, the live/sample indicator —
all at `text-xs` or smaller.

**Fix:** lift `ink-dim` to ≈ `#9b8cc4` (≈4.6:1 on canvas) or reserve it for
decorative glyphs only and promote all textual uses to `ink-muted`. One token
change, site-wide effect.

### 3.4 WebGL is in the critical path

`page.tsx` → `Hero` → static imports of `AuroraCanvas` and `MorphBlob` →
three.js + `@react-three/fiber` + `@react-three/drei` (≈800 KB–1 MB minified)
in the homepage's initial bundle. The `Suspense` wrapper does not code-split;
it only satisfies `useSearchParams`.

**Fix:** `next/dynamic(() => import(...), { ssr: false })` for both WebGL
components (this Next version supports `ssr: false` in Client Components),
with the existing reduced-motion CSS gradient as the `loading` fallback. The
page then paints text instantly; the atmosphere fades in when ready. That
fade-in can be *designed* — a slow bloom is more on-brand than a blocking
spinner anyway.

### 3.5 WebGL context budget

Today the homepage runs **3 live canvases** (aurora + hero orb + experience
blob). Reinstating `ProductSuite` adds 3 more (card glyphs) → **6**, plus one
per product page. Browsers cap contexts at ~8–16 and mobile GPUs pay real
memory per context. MIRA.md already anticipates a "render tier budget per
page" — the site needs one:

- **Tier 1 (hero orb):** full WebGL, always.
- **Tier 2 (aurora):** WebGL shader, `frameloop` already gated by viewport —
  good; keep.
- **Tier 3 (section + card glyphs):** replace with the CSS radial-gradient
  fallback (already built for reduced motion) or one shared canvas. Cards do
  not need real-time distortion; a slowly drifting gradient reads identically
  at 160 px.

### 3.6 Conversation is invisible to screen readers

MIRA.md states the text is "the accessible source of meaning" — but the
message list has no `role="log"` / `aria-live`, so streaming replies are
never announced. Also: the mobile menu has no Escape handling or focus
management, and `Magnetic` has no reduced-motion/touch guard (on touch
devices the first tap can make the button jump).

**Fix:** `role="log" aria-live="polite" aria-label="Conversation with Mira"`
on the message region (announce the finalized message, not every token);
Escape-to-close + focus return on the menu; bail out of `Magnetic` when
`useReducedMotion()` or `pointer: coarse`.


---

## 4. UX & product design

### 4.1 The five-second test

Land on `/`. In five seconds a visitor should be able to answer: *what is
this, who is it for, what can I do here?* Today: "famile / A quiet field for
attention — and what follows from it. / Ask Mira." Beautiful, and
unanswerable. The fix is not a manifesto (VISION.md rightly bans those) — it
is **one concrete layer under the poetry**. See §8.

### 4.2 Homepage narrative order

Current: Hero → Experience (two aphorisms, 120vh) → Principles → CTA.
Proposed: Hero → Experience (earned, see 4.3) → **Suite** → Principles → CTA.
Principles ("Measure. Attend. Return.") land *after* the visitor has seen
what is being measured. Philosophy as conclusion, not as gate.

### 4.3 `ExperienceSection` is the weakest section — and the biggest opportunity

120vh of scroll for "Calm enough to live with. / Clear enough to act on." —
pretty, empty, and it spends a whole WebGL context on a backdrop blob. This
is where immersion should *earn* itself: a scrollytelling sequence where the
single orb morphs through the three product accents (mint → pink → amber) as
three short lines pass: what Sukari does, what Orbura does, what Ardum does —
in plain sentences. One canvas instead of four, the products introduced by
*feeling* before the suite section introduces them by name. That is the
"immersive and memorable" you are asking for, and it is cheaper than what
ships today.

### 4.4 Two shells, one confused identity

`/dashboard` and `/products/*` live in an app shell (sidebar, "Dashboard",
"Suite map", noindex) but their content is marketing orientation
(PRODUCTS.md says so explicitly). Meanwhile `/contact` links *to* the
noindexed dashboard. Either:

- treat `/products/*` as marketing (move them under `MarketingShell`, index
  them, drop the sidebar), or
- treat the suite as an app (then it needs a real entry point and auth
  story).

Today it is both and neither. Recommendation: marketing. The sidebar shell
implies a logged-in product that does not exist at this domain.

### 4.5 Smaller UX notes

- **Nav:** no path to the products. Add "Suite" (or "Products"). "Notes" →
  the section is titled "NOTES" but the content is principles; "Principles"
  is the clearer label either way.
- **Hero on mobile:** the 480px orb stacks under the content, pushing the CTA
  near or below the fold. Shrink it, or let it sit *behind* the type as
  ambiance at reduced opacity.
- **Chat input is single-line.** A conversation surface wants a textarea
  (Enter to send, Shift+Enter for newline). Long questions feel cramped.
- **`sample` indicator:** honest, but jargon. "recorded" is the same truth in
  plain language.
- **Grain sits under content** (`z-[1]` vs `main z-10`), so glass surfaces
  are untextured. If intentional, fine; if not, raise it above content at
  the same 4% — it is safe with `soft-light`.
- **Dashboard header:** eyebrow "Suite map" + h1 "Suite map." + "Three paths.
  Optional." — duplicated label, and minimal to the point of shrug.

---

## 5. Motion design

The system is 80% excellent. The remaining 20%:

1. **Everything moves at the same tempo.** `fadeUp` is `DUR.slow` (0.8s) with
   `EASE.soft` everywhere — hero, cards, accordions, messages. Choreography
   needs hierarchy: hero moments slow (0.8–1.2s), UI feedback fast
   (0.15–0.3s), scroll-linked continuous. Today the site feels uniformly
   unhurried, which reads as *lag* in small interactions (message entrance,
   accordion).
2. **`filter: blur()` animation on display type.** `TextReveal` animates
   `blur(6px) → 0` per word on 4xl–8xl text, and messages do the same.
   Blur is paint-bound, not composited — this is the most likely source of
   jank on mid-tier hardware. Use `y` + `opacity` (+ maybe `scale` 0.98);
   reserve blur for one hero moment if at all.
3. **Lenis at 1.2s duration** is thematically right but functionally heavy;
   0.9–1.0s keeps the glide without the lag. Also confirm Lenis is stopped
   when the mobile menu locks scroll, and that it doesn't fight the hero's
   manual `scrollTo` during Mira open/close.
4. **Magnetic buttons** need the guards from §3.6. Magnetic is a delight
   layer; it must never make a target harder to hit.
5. **Keep:** the documented crossfade decision in the hero, the breathing
   rest state, staggered word reveals (minus blur), directional view
   transitions. The instinct is right; the budget and tempo map are what is
   missing.


---

## 6. Styling & design system

- **Tokens are good.** Two cleanups: in Tailwind v4, `--radius-xl` in
  `@theme` already generates `rounded-xl` — the `rounded-[var(--radius-xl)]`
  arbitrary values are redundant noise. Same for shadows (`shadow-soft`
  etc. are generated from `--shadow-*`).
- **Type pairing is right** (Fraunces optical sizes + Geist). `line-height:
  1.02` on all headings is aggressive for multi-line display text; the
  components already override per-use, so consider making 1.1 the base.
- **The animated aurora-gradient text** is tasteful and on-brand. Keep it for
  one or two phrases per viewport, never for body — current usage respects
  this; hold the line.
- **Surfaces:** `backdrop-blur-xl` is used on nav, cards, panel, and menu
  simultaneously. It is GPU-expensive; fine at this count, but do not add
  more full-viewport blurred layers (the mobile menu's `backdrop-blur-2xl`
  over the aurora is the current ceiling).

---

## 7. Performance

Ordered by impact:

1. **Dynamic-import the WebGL** (§3.4) — biggest win, ~1 MB off the critical
   path.
2. **Context budget** (§3.5) — biggest mobile win.
3. **The 1.6 MB HDR environment map** (`/hdri/empty_warehouse_01_1k.hdr`) is
   fetched for a decorative reflection. Downsize to a 256–512px HDR or a
   hand-authored `RoomEnvironment`-style PMREM; cache headers are already
   correct.
4. **Blur animations** (§5.2) — paint cost every frame.
5. **Measure.** Add web-vitals reporting before and after; target LCP < 2.0s
   on 4G mobile for the hero text. Right now there is no telemetry, so every
   perf claim is a guess — including these.
6. Already good: self-hosted variable fonts with `display: swap`, no raster
   images, viewport-gated `frameloop`s, `dpr` caps, static prerendering of
   every marketing route.


---

## 8. Language — making it clear without losing the calm

The voice rules are right. The execution over-indexes on metaphor and
under-indexes on checkable claims — VOICE.md's own tie-breaker ("prefer
short claims that could be checked over brand metaphors"). Clarity here is
not louder; it is *more concrete nouns, same calm verbs*. Pattern: **poetry
in the headline, plain sense in the subline.** Never make the visitor parse
a metaphor to learn what the company does.

### 8.1 Before / after

| Where | Now | Proposed | Why |
|---|---|---|---|
| Hero subline | "A quiet field for attention — and what follows from it." | "famile builds companions for the daily work of staying well — metabolic care, recovery, and practice." | Answers *what* in one line. The poetry stays in the `h1` and the orb; the subline does the work. |
| Experience section | "Calm enough to live with. / Clear enough to act on." | Keep the lines — but let each arrive *with* a product: "Calm enough to live with." → Sukari's one action; "Clear enough to act on." → Orbura's signal. (See §4.3.) | The aphorisms currently describe nothing; attached to products they become claims. |
| Nav | "Notes" | "Principles" | The section is principles; "Notes" is a riddle. |
| Mira: "What is this place?" | "A field for attention — stillness meeting measure." | "famile is a small studio for staying well. I am Mira — I can talk things through, and the suite (Sukari, Orbura, Ardum) holds daily practice. I don't diagnose." | Literal first, poetic second. The current answer makes a confused visitor work. |
| Mira: "Who are you?" | "Mira. Conversation, not care delivery. I don't dose, and I don't carry memory across Famile apps." | "Mira — company and clarity while you sort things out. I remember what you share here; I don't diagnose, dose, or replace your clinician." | Leads with what she *is*; one honest negation instead of two. (Also aligns with MIRA.md: memory on this surface now exists.) |
| Suite indicator | "sample" | "recorded" | Same honesty, plainer word. |
| Dashboard h1 | "Suite map." / "Three paths. Optional." | "The suite." / "Three practices. Each one thing at a time." | Minimal is fine; a shrug is not. |
| `<title>` | "famile" | "famile — attention, evidence, and continuity for staying well" | The description already says it; the title should too. |
| CTA | "A question, if you have one." | Keep. | On-voice, low-pressure, clear. |

### 8.2 Rules of thumb going forward

1. **One metaphor per screen.** The orb, the field, the breath — pick one;
   let the rest be plain.
2. **Negations are disclaimers, not introductions.** "Not medical advice" is
   necessary and well-placed; but a first answer should say what something
   *is* before what it is not.
3. **If a line could appear on any wellness site, cut it.** "Calm enough to
   live with" survives only because it is attached to a real product claim.
4. **Read it aloud at conversation speed.** Mira's register (short
   sentences, one idea per line) is the right benchmark for site copy too.

---

## 9. Prioritized roadmap

**Now (hours, no design risk):** — ✅ shipped
1. ✅ Fix production build (voice-gateway excluded from root tsconfig).
2. ✅ Reinstate `ProductSuite` on `/` (repairs story + `/#suite` + SEO mismatch).
3. ✅ Lift `ink-dim` contrast (one token).
4. ✅ Make `HeroFallback` the real static hero (h1 + subline in initial HTML).
5. ✅ `role="log"` / `aria-live` on the conversation; Escape + focus on the menu.

**Next (days, design-visible):** — ✅ shipped
6. ✅ Dynamic-import WebGL with the CSS-gradient bloom as the loading state.
7. ✅ Context budget: CSS glyphs for cards/sections, WebGL reserved for the
   hero orb + aurora (homepage contexts: 3 → 2).
8. ✅ Tempo map: `fadeUpFast` for UI feedback; blur dropped from `TextReveal`
   and message entrances.
9. ✅ Hero subline + Mira sample answers per §8.1.
10. ✅ Suite shell question resolved: `/products/*` and `/dashboard` are
    marketing pages; the app sidebar/topbar shell is retired.

**Later (the memorable layer):** — partially shipped
11. ✅ `ExperienceSection` rebuilt as the single-orb scrollytelling sequence
    through the three product accents (§4.3).
12. ✅ Textarea composer; "recorded" label; magnetic guards; Lenis tuning.
13. ✅ Web-vitals telemetry scaffold (`/api/vitals` + console in dev).
    Remaining: HDR downsize (deferred for now — the 1.6 MB map now loads
    post-hydration with the dynamic-imported orb, cached immutable), and
    iterating on measured data once vitals flow.

---

## 10. The one-paragraph version

The site has a soul and a skeleton problem. The orb, the rest mode, the
honest agent, and the motion vocabulary are genuinely best-in-class instincts.
But the homepage never says what famile makes, the copy asks metaphors to do
a sentence's job, the main headline is missing from the HTML, and the
atmosphere costs ~1 MB and three GPU contexts before a single word arrives.
Put the products back on the page, give the poetry a plain-spoken subline,
lazy-load the WebGL behind a designed bloom, and fix one color token — and
the same site becomes clear, fast, and much more itself.

