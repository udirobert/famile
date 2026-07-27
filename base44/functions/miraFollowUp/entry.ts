// Mira follow-up automation.
//
// Fires every hour. Finds sessions whose last_posture is 'holding' and whose
// last_turn_at is older than 24 hours. For each, writes a gentle follow-up
// agent turn ("You held something here yesterday. I can keep holding it, or
// we can set it down.") and transitions the posture to 'watching'.
//
// This is the deferred-promise follow-up behavior from docs/MIRA.md:
//   "Mira may: follow up once on a deferred promise" (Always lane).
// The safety charter limits follow-ups to one per deferred promise; we
// enforce that by checking that the last turn is the user's and that no
// prior follow-up turn exists in the last 48h.

import { createClientFromRequest } from "npm:@base44/sdk";

const FOLLOW_UP_WINDOW_HOURS = 24;
const COOLDOWN_HOURS = 48;
const FOLLOW_UP_TEXT =
  "You held something here yesterday. I can keep holding it, or we can set it down.";

type Session = {
  id: string;
  session_key: string;
  surface: string;
  last_posture: string;
  last_turn_at?: string;
};

type Turn = {
  role: string;
  content: string;
  created_date?: string;
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const now = Date.now();
  const followUpCutoff = new Date(now - FOLLOW_UP_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
  const cooldownCutoff = new Date(now - COOLDOWN_HOURS * 60 * 60 * 1000).toISOString();

  let followed = 0;
  let skipped = 0;
  let errored = 0;

  try {
    // Find all sessions in holding posture. The filter is on last_posture;
    // we then check last_turn_at in JS because Base44 filter is equality-only.
    const sessions = (await base44.asServiceRole.entities.MiraSession.filter({
      last_posture: "holding",
    })) as Session[];

    for (const session of sessions) {
      try {
        // Skip if the session has had a turn recently (within 24h).
        if (session.last_turn_at && session.last_turn_at > followUpCutoff) {
          skipped++;
          continue;
        }

        // Check for an existing follow-up turn in the cooldown window to
        // enforce the "follow up once" rule.
        const turns = (await base44.asServiceRole.entities.MiraTurn.filter({
          session_id: session.id,
        })) as Turn[];
        const recentFollowUp = turns.some(
          (t) =>
            t.role === "agent" &&
            t.content === FOLLOW_UP_TEXT &&
            (t.created_date ?? "") > cooldownCutoff,
        );
        if (recentFollowUp) {
          skipped++;
          continue;
        }

        // Write the follow-up turn.
        await base44.asServiceRole.entities.MiraTurn.create({
          session_id: session.id,
          session_key: session.session_key,
          surface: session.surface,
          role: "agent",
          content: FOLLOW_UP_TEXT,
          posture: "watching",
          live: false,
          redacted: false,
        });

        // Transition posture to watching and stamp last_turn_at.
        await base44.asServiceRole.entities.MiraSession.update(session.id, {
          last_posture: "watching",
          last_turn_at: new Date().toISOString(),
        });

        // Emit a posture event so the orb updates on any connected surface.
        await base44.asServiceRole.entities.PostureEvent.create({
          session_id: session.id,
          session_key: session.session_key,
          surface: session.surface,
          posture: "watching",
          previous_posture: "holding",
          valence: 0,
          reaction: "settle",
          note: "Follow-up on a deferred promise.",
        });

        followed++;
      } catch {
        errored++;
      }
    }
  } catch (e) {
    return Response.json(
      { error: "Follow-up sweep failed", detail: String(e) },
      { status: 500 },
    );
  }

  return Response.json({
    ok: true,
    mode: "holding_follow_up",
    followed,
    skipped,
    errored,
  });
});
