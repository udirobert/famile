# Famile shared Mira backend

A Base44 backend that powers the cross-product Mira agent network for the
Famile health and wellness product suite. Built for the
[Base44 Dev Build-Off](https://backendcompetition.base44.app/)
(July 21-28, 2026).

## What this is

Famile is a health and wellness product suite with four surfaces:

| Surface | Stack | Repo |
|---------|-------|------|
| famile.xyz | Next.js 16 marketing + conversational surface | `.` (this repo) |
| Sukari | Expo / React Native mobile | `../../sukari` |
| Orbura | Next.js 16 + Drizzle + Postgres | `../../orbura` |
| Ardum | Next.js 16 + Supabase | `../../ardum` |

Each product has its own Mira instance (the persistent personal agent). The
canonical persona spec lives at [`docs/MIRA.md`](../docs/MIRA.md).
Until now, that spec explicitly stated:

> Today: no cross-product memory. Each Mira says "Mira in Sukari" if the
> boundary matters, never "Mira remembers from Ardum." This is a current
> contract, not a future promise. When a shared memory store lands, this
> section updates and every system prompt follows.

This Base44 backend is that shared memory store, and the agentic layer on
top of it: realtime posture sync, automated follow-ups and digests, and
exception-oriented care-team escalation. It is the literal gap the spec
names, plus the agent behaviors the spec says Mira should do but couldn't
without a backend.

## Architecture

```
famile.xyz  ──┐               ┌──▶  MiraSession + MiraTurn (RLS, PHI scrub)
              │               │
sukari     ──┼──▶  Base44 ──▶┼──▶  PostureEvent (realtime feed)
              │     backend   │
orbura     ──┤               ├──▶  CareTeamAlert (escalation queue)
              │               │
ardum      ──┘               ├──▶  Automations (follow-up, digest, escalation)
                              │
                              └──▶  Slack connector (care-team delivery)
```

### The agent loop

1. A person talks to Mira on any surface. `miraAnswer` persists the turn
   (PHI-scrubbed), loads context, streams the reply, and persists the agent
   turn.
2. Posture transitions are written to `PostureEvent` via `miraPosture`. The
   realtime subscription on famile.xyz picks these up so the orb and
   dashboard update live across surfaces.
3. `miraFollowUp` (hourly automation) finds sessions in `holding` posture
   that haven't had a turn in 24h and posts a gentle follow-up. This is the
   "follow up once on a deferred promise" behavior from `docs/MIRA.md`.
4. `miraDigest` (weekly automation, Monday 09:00 UTC) compiles an
   operational digest of posture transitions per session. No chat content,
   no PHI, just posture counts and dominant state.
5. `miraEscalation` (entity automation on PostureEvent create) fires when
   valence >= 0.6 or posture is `resolving`. Creates a `CareTeamAlert` and,
   for `escalate` severity, posts to the care-team Slack channel via the
   shared Slack connector.

## Base44 features used (10/10)

- [x] **Entities** — `MiraSession`, `MiraTurn`, `PostureEvent`,
  `CareTeamAlert` with JSON Schema, validation, and enums
- [x] **Row-Level Security** — `session_key`-scoped reads/writes on session
  and turn entities; admin-only on alerts; public read on posture events
  (the realtime feed)
- [x] **Backend Functions** — six Deno serverless functions:
  `miraAnswer`, `miraHistory`, `miraPosture`, `miraNetwork`,
  `miraFollowUp`, `miraDigest`, `miraEscalation`
- [x] **AI Integrations** — OpenAI via the Base44 AI integration (API key
  stored as a project secret `OPENAI_API_KEY`). The `miraAnswer` function
  calls the OpenAI-compatible API directly with the canonical Mira system
  prompt.
- [x] **Automations** — three automation types:
  - Scheduled (simple): `miraFollowUp` hourly
  - Scheduled (weekly): `miraDigest` every Monday 09:00 UTC
  - Entity event: `miraEscalation` on `PostureEvent` create
- [x] **Realtime** — `PostureEvent` creates trigger the dashboard's realtime
  feed and the orb's posture sync via SDK subscribe / polling
- [x] **Connectors** — shared `slackbot` connector for care-team escalation
  via Slack Web API
- [x] **Auth** — Google login enabled for care-team dashboard access
- [x] **AI Agents** — native `mira` agent config with entity tools
  (MiraSession, MiraTurn, PostureEvent) and function tools (miraPosture,
  miraHistory)
- [x] **External SDK client** — famile/web calls Base44 over HTTP without
  hosting on Base44; the Next.js app keeps its own hosting

## Privacy posture

The Famile suite operates in a health context, so the backend carries a PHI
scrub before any user turn is persisted. The `miraAnswer` function checks
incoming queries against a PHI pattern (medication/dose/diagnosis/lab value
entry). Matching turns are stored with `content = "[redacted — personal
health detail]"` and `redacted = true`, preserving the conversation shape
for context without retaining the sensitive text.

Care-team alerts carry operational context only (posture, valence, surface),
never chat content or PHI. The Slack message is the same: operational signal,
not a transcript.

## Local development

```bash
npm install -g base44@latest
base44 login
base44 link       # link this directory to your Base44 project

# Set the OpenAI API key as a project secret (Base44 stores it securely):
base44 secrets set OPENAI_API_KEY sk-...
# Optional: override the default model (defaults to gpt-4o-mini):
base44 secrets set MIRA_MODEL gpt-4o

base44 dev        # run entities + functions locally
```
Set in `.env.local` (repo root):
```
BASE44_APP_ID=<your-app-id>
NEXT_PUBLIC_BASE44_APP_ID=<your-app-id>
```

When unset, famile/web falls back to its existing in-process engine
(stateless, replay data) so the Ask surface and dashboard never go dark.

## Cross-product probe

The sibling repo `../../orbura` ships a read-only probe at
`scripts/probe-shared-mira.mjs`. It reads a session started on famile.xyz
from Orbura, proving the shared memory store is readable across products
without any changes to Orbura's own Drizzle/Postgres backend.

```bash
cd ../../orbura
BASE44_APP_ID=<app-id> node scripts/probe-shared-mira.mjs <session-key>
```

The session-key is the value of the `famile_mira_session` cookie set after
visiting `https://famile.xyz/ask` and asking Mira a question.

## Project structure

```
base44/
├── base44.config.jsonc
├── agents/
│   └── mira.jsonc                  # native AI agent with entity + function tools
├── auth/
│   └── config.jsonc                # Google login for care-team access
├── connectors/
│   └── slackbot.jsonc              # shared Slack connector for escalation
├── entities/
│   ├── MiraSession.json            # one per person per surface (RLS)
│   ├── MiraTurn.json               # individual messages (RLS, PHI-scrubbed)
│   ├── PostureEvent.json           # realtime posture feed (public read)
│   └── CareTeamAlert.json          # escalation queue (admin-only)
└── functions/
    ├── miraAnswer/                 # streaming conversation + persistence
    │   └── entry.ts
    ├── miraHistory/                # read session turns for hydration
    │   └── entry.ts
    ├── miraPosture/                # write posture transition (realtime trigger)
    │   └── entry.ts
    ├── miraNetwork/                # network snapshot for dashboard
    │   └── entry.ts
    ├── miraFollowUp/               # hourly: follow up on deferred promises
    │   ├── entry.ts
    │   └── function.jsonc          # scheduled automation (hourly)
    ├── miraDigest/                 # weekly: compile posture digest
    │   ├── entry.ts
    │   └── function.jsonc          # scheduled automation (Mon 09:00 UTC)
    └── miraEscalation/             # on posture disruption: create alert + Slack
        ├── entry.ts
        └── function.jsonc          # entity automation (PostureEvent create)
```

## Demo video script (60 seconds)

1. **(0-10s)** Open famile.xyz/ask. The orb breathes. Ask Mira: "I keep
   forgetting my morning metformin." Mira replies, the conversation is
   persisted to Base44 (MiraSession + MiraTurn).
2. **(10-20s)** Refresh the page. The conversation is still there, hydrated
   from Base44. No login required, the httpOnly session cookie holds the
   capability.
3. **(20-30s)** Open the dashboard at /dashboard. The "Mira network - live"
   panel shows the famile session, posture transitions, and surface counts
   pulling from Base44 in realtime.
4. **(30-40s)** In another tab, run the orbura probe:
   `node scripts/probe-shared-mira.mjs <session-key>`. The same conversation
   reads from Orbura, proving cross-product memory. Orbura's own
   Drizzle/Postgres is untouched.
5. **(40-50s)** Back on famile.xyz/ask, the orb shifts, speed and aura
   changing, as a posture transition arrives from another surface. No label,
   no narration, the orb itself is the signal.
6. **(50-60s)** A care-team alert fires (valence spike). If Slack is
   configured, the alert lands in `#famile-care` with operational signal
   only, no PHI.

## What this is not

- Not a migration of Orbura's Drizzle/Postgres or Ardum's Supabase. Both
  keep their own tested backends. This Base44 backend is the shared agent
  layer only.
- Not full end-user auth. The session cookie is an opaque capability handle,
  not an identity. Care-team auth (Google login) is configured; end-user
  auth is a post-competition concern. The RLS rules are written to enforce
  it natively when it lands.
- Not all three LLM providers on Base44. The `miraAnswer` function uses
  OpenAI via the Base44 AI integration (API key as a project secret).
  famile/web keeps its Venice -> 0G -> Anthropic failover chain as the
  fallback path when Base44 is unreachable.

## Submission feedback (for the Base44 team)

Built for the Dev Build-Off. Notes for the feedback form:

- The external SDK client pattern (`createClient` over HTTP, no hosting
  required) is what made this viable for an existing Next.js app. Keeping
  famile/web on its own hosting while using Base44 as the backend was the
  right call for a 2-day build window with an existing production app.
- Row-level security on entities is well-suited to the capability-handle
  pattern (session_key as the scoped key). The `data.<field>` template
  syntax for entity-to-user comparison was clear.
- The `asServiceRole` escape hatch is necessary for anonymous surfaces
  (httpOnly cookie, no login), but the docs could be clearer that this is
  the intended pattern for anonymous + capability-scoped access.
- Entity automations are the strongest feature for agentic apps. The
  `miraEscalation` function firing on `PostureEvent` create is exactly the
  "agent that acts, not a chatbot" pattern. The atomic deploy (function +
  automations together) is well-designed.
- Streaming an OpenAI response through a Deno function back to an external
  client required manual SSE parsing and ReadableStream wrapping. A helper
  for "stream AI response through function to external client" would reduce
  boilerplate.
- Connector automations requiring trigger conditions for Slack is a good
  guardrail. The `getConnection()` + direct API call pattern for shared
  connectors is clean.
- The 50-function limit is comfortable (we used 7). The 5-minute timeout is
  generous for conversational functions.
- Native AI agent config (`agents/mira.jsonc`) with entity and function
  tools is a clean way to define an agent's capabilities declaratively.
