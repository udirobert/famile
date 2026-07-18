import type {
  AgentTrace,
  DashboardEvent,
  ProvenanceEntry,
  SampleQA,
} from "./types";
import type { ProductSlug } from "@/lib/products";

// Honestly-labeled replay data. These are authored traces that demonstrate how
// the products reason. UI surfaces must label them as a recorded session /
// simulated signal. When LLM_API_KEY is present the live engine takes over
// and the same surfaces stream real reasoning on the same simulated input.

export const replayTraces: Record<ProductSlug, AgentTrace> = {
  sukari: {
    product: "sukari",
    steps: [
      {
        kind: "input",
        label: "signal in",
        text: "Fasting glucose 142 mg/dL, up 18 over 7 days. Morning metformin slipped 2 of the last 3 days. GLP-1 on schedule.",
      },
      {
        kind: "observe",
        label: "observed",
        text: "The adherence gap precedes the fasting rise. This is a timing drift, not a medication failure.",
      },
      {
        kind: "reason",
        label: "reasoning",
        text: "Cheapest action with the most leverage: anchor metformin to an existing morning habit, rehearse the sequence once, and re-check fasting in 48 hours before escalating.",
      },
      {
        kind: "decide",
        label: "one thing today",
        text: "Take metformin right after you brush your teeth. Rehearse it once now — 90 seconds.",
      },
      {
        kind: "report",
        label: "to care team",
        text: "Adherence gap flagged and addressed at home. No escalation. Re-check fasting on the 20th. You'll only hear again if it shifts.",
      },
    ],
  },
  orbura: {
    product: "orbura",
    steps: [
      {
        kind: "input",
        label: "signal in",
        text: "HRV down 22% over 9 days. Sleep latency up 40 minutes. Load: 3 hard sessions, 1 recovery. No injury.",
      },
      {
        kind: "observe",
        label: "observed",
        text: "Recovery debt accumulating without injury. This is the plateau-risk signal, not the injury signal.",
      },
      {
        kind: "reason",
        label: "reasoning",
        text: "Pull Thursday's intensity to zone 2, protect the sleep window with a 23:00 hard cutoff, and let HRV guide Saturday's return. Adapt to the week that happened, not the one planned.",
      },
      {
        kind: "decide",
        label: "one thing today",
        text: "Move Thursday to easy. Protect a 23:00 sleep cutoff tonight.",
      },
      {
        kind: "report",
        label: "to coach / clinician",
        text: "Recovery debt flagged. Plan adapted: zone 2 plus sleep protection. No injury. Context sent in your language — no second system to read.",
      },
    ],
  },
  ardum: {
    product: "ardum",
    steps: [
      {
        kind: "input",
        label: "intention in",
        text: "“I need a quiet week before October — solitude more than novelty. Budget flexible. Two friends might join, not sure.”",
      },
      {
        kind: "observe",
        label: "observed",
        text: "The job is rest and reconnection, not a destination. Timing before October and solitude outrank group size.",
      },
      {
        kind: "reason",
        label: "reasoning",
        text: "Ask only the tradeoff that matters: if timing and solitude conflict, which wins? Hold inventory secondary until that preference is clear.",
      },
      {
        kind: "decide",
        label: "one decision",
        text: "Is timing or solitude more important if both cannot be perfect?",
      },
      {
        kind: "report",
        label: "episode note",
        text: "Intention held. No booking. Monitoring conditions until confidence is high enough for a non-binding hold — only with explicit grant.",
      },
    ],
  },
};

export const replayDashboardEvents: DashboardEvent[] = [
  { product: "sukari", kind: "signal", text: "Sukari: fasting glucose trending up over 7 days." },
  { product: "sukari", kind: "action", text: "One thing today: anchor metformin to your morning brush." },
  { product: "sukari", kind: "report", text: "Care team notified: addressed at home, no escalation." },
  { product: "orbura", kind: "signal", text: "Orbura: HRV down 22%, sleep latency up 40 min." },
  { product: "orbura", kind: "action", text: "One thing today: pull Thursday to zone 2, protect sleep." },
  { product: "orbura", kind: "report", text: "Coach notified: recovery debt flagged, plan adapted." },
  { product: "ardum", kind: "signal", text: "Ardum: intention held — quiet week before October." },
  { product: "ardum", kind: "action", text: "One decision: timing vs solitude if both cannot be perfect." },
  { product: "ardum", kind: "report", text: "Episode note: no booking; monitoring until a hold is granted." },
];

export const sampleQA: SampleQA[] = [
  {
    q: "What is this place?",
    a: "famile is a warm space to peruse or just be. I'm Mira — company if you'd like it. A few apps live in the family too; they aren't why you're here.",
  },
  {
    q: "Who are you?",
    a: "I'm Mira. I keep company here. I don't diagnose or dose, and I don't remember you across other Famile apps.",
  },
  {
    q: "What's Sukari?",
    a: "An app in the family for day-to-day metabolic care — one doable action at a time. Only if that ever feels useful to you.",
  },
  {
    q: "Is this medical advice?",
    a: "No. This is company and information, not care. Anything clinical stays with your clinician.",
  },
];

export function replayAnswer(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("medical") || q.includes("advice") || q.includes("diagnos"))
    return sampleQA[3].a;
  if (
    q.includes("who are you") ||
    q.includes("mira") ||
    (q.includes("you") && q.includes("who"))
  )
    return sampleQA[1].a;
  if (
    q.includes("what is this") ||
    q.includes("what is famile") ||
    q.includes("this place") ||
    q.includes("need an app") ||
    q.includes("have to")
  )
    return sampleQA[0].a;
  if (
    q.includes("ardum") ||
    q.includes("retreat") ||
    q.includes("intention") ||
    q.includes("booking")
  )
    return "Ardum is an app in the family for intentions that may become rest or practice. Booking stays secondary. Happy to say more — or we can talk about something else.";
  if (q.includes("orbura") || q.includes("recovery") || q.includes("burnout"))
    return "Orbura is an app in the family for recovery signals — adapting to the week that happened. Only if that ever feels useful.";
  if (q.includes("sukari") || q.includes("metabolic") || q.includes("surface"))
    return sampleQA[2].a;
  if (q.includes("native") || q.includes("ai-native") || q.includes("enabled"))
    return "Some Famile apps are AI-native; some AI-enabled. This space itself is just company — not a product demo.";
  return "I'm here. Ask about this place, about me, or about something in the family — or just say what's on your mind.";
}

export const provenance: Record<ProductSlug, ProvenanceEntry[]> = {
  sukari: [
    {
      claim: "1 action",
      source: "Sukari product spec: one daily focus",
      reasoning:
        "Adherence is built by repetition, not willpower. Collapsing the day to one rehearseable action is the core mechanism — a wall of metrics would reverse the burden onto the patient.",
    },
    {
      claim: "90s",
      source: "Sukari product spec: practice before live",
      reasoning:
        "A short practice run primes the decision before it's live. 90 seconds is the shortest interval that still lets the user rehearse the full sequence without dropping out.",
    },
    {
      claim: "By exception",
      source: "famile principle: exception-oriented",
      reasoning:
        "Care teams see only what shifted. Surfacing everything would reproduce the dashboard burden the product exists to remove; the default is silence, contact is by exception.",
    },
  ],
  orbura: [
    {
      claim: "Days ahead",
      source: "Orbura product spec: early warning",
      reasoning:
        "Recovery debt accumulates measurably before it becomes injury or plateau. Flagging days ahead gives enough runway to adapt the plan without cancelling work unnecessarily.",
    },
    {
      claim: "Live",
      source: "Orbura product spec: plan adaptivity",
      reasoning:
        "The plan adapts to the week that happened, not the one planned. Live adaptivity means the recommendation tracks the latest signal rather than a static programme.",
    },
    {
      claim: "1 → squad",
      source: "Orbura product spec: unit of care",
      reasoning:
        "Recovery intelligence is useful at the individual and the squad level. Scaling the unit of care means one clinician can oversee many people without losing individual context.",
    },
  ],
  ardum: [
    {
      claim: "Episode",
      source: "Ardum product vision: living episode",
      reasoning:
        "The episode — intention, constraints, holds, commitments — is the spine. A recommendation or booking belongs to the episode; none of them is the product itself.",
    },
    {
      claim: "One at a time",
      source: "Ardum interaction contract",
      reasoning:
        "Every state presents one primary human decision. Asking for more recreates the filter-and-compare burden the product exists to remove.",
    },
    {
      claim: "Secondary",
      source: "Ardum product vision: booking is implementation",
      reasoning:
        "People want rest, reconnection, or change — not logistics first. Booking is a terminal grant of authority, not the story of the journey.",
    },
  ],
};
