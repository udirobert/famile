import type {
  AgentTrace,
  DashboardEvent,
  ProvenanceEntry,
  SampleQA,
} from "./types";

// Honestly-labeled replay data. These are authored traces that demonstrate how
// the products reason. UI surfaces must label them as a recorded session /
// simulated signal. When LLM_API_KEY is present the live engine takes over
// and the same surfaces stream real reasoning on the same simulated input.

export const replayTraces: Record<"sukari" | "orbura", AgentTrace> = {
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
};

// Events the dashboard appends over time to feel stateful. Each is honest
// about being a recorded session.
export const replayDashboardEvents: DashboardEvent[] = [
  { product: "sukari", kind: "signal", text: "Sukari: fasting glucose trending up over 7 days." },
  { product: "sukari", kind: "action", text: "One thing today: anchor metformin to your morning brush." },
  { product: "sukari", kind: "report", text: "Care team notified: addressed at home, no escalation." },
  { product: "orbura", kind: "signal", text: "Orbura: HRV down 22%, sleep latency up 40 min." },
  { product: "orbura", kind: "action", text: "One thing today: pull Thursday to zone 2, protect sleep." },
  { product: "orbura", kind: "report", text: "Coach notified: recovery debt flagged, plan adapted." },
];

export const sampleQA: SampleQA[] = [
  {
    q: "How does Sukari decide what to surface?",
    a: "Sukari reads the biomarker patterns for the day and collapses them into one doable action — never a wall of metrics. It settles on the cheapest move with the most leverage, lets you rehearse it once before it counts, and only tells the care team what shifted. The rest runs quietly.",
  },
  {
    q: "What does Orbura do with my recovery data?",
    a: "Orbura reads the lifestyle and biometric signals that precede burnout, injury, and plateau, then adapts a recovery plan to how you actually live. It scales from one person to a whole squad's load, and sends clinicians and coaches context in their own language — no second system to translate into.",
  },
  {
    q: "Is this medical advice?",
    a: "No. famile products support care decisions; they don't replace your clinician. What you're seeing here is a demonstration of how the products reason on a simulated signal. Real use is supervised by your care team.",
  },
  {
    q: "What does AI-native mean here?",
    a: "It means the software does the thinking, not just the charting. It decides, practices, and reports — so a human doesn't have to watch a dashboard to know when to act. AI-enabled, by contrast, brings intelligence to an existing workflow without running the loop end to end.",
  },
];

// Keyword matcher for the replay conversational fallback.
export function replayAnswer(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("medical") || q.includes("advice") || q.includes("diagnos"))
    return sampleQA[2].a;
  if (q.includes("orbura") || q.includes("recovery"))
    return sampleQA[1].a;
  if (q.includes("native") || q.includes("ai-native") || q.includes("enabled"))
    return sampleQA[3].a;
  if (q.includes("sukari") || q.includes("surface") || q.includes("decide"))
    return sampleQA[0].a;
  return "I can show how Sukari and Orbura reason on a simulated signal, and how famile thinks about AI-native care. Ask how Sukari decides what to surface, what Orbura does with recovery data, or whether this is medical advice. (Live reasoning needs a key — this is a recorded answer.)";
}

export const provenance: Record<"sukari" | "orbura", ProvenanceEntry[]> = {
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
};
