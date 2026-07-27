// Mira weekly digest automation.
//
// Fires every Monday at 09:00 UTC. For each session active in the last 7
// days, compiles a digest of posture transitions and writes it as an agent
// turn. The digest is operational (posture counts, dominant posture,
// notable reactions), not a chat summary — it never includes PHI or
// conversational content.
//
// From docs/MIRA.md (Always lane): "compile a weekly digest."

import { createClientFromRequest } from "npm:@base44/sdk";

const WEEK_DAYS = 7;

type Session = {
  id: string;
  session_key: string;
  surface: string;
  last_posture: string;
  last_turn_at?: string;
};

type PostureEvent = {
  posture: string;
  previous_posture: string;
  valence: number;
  reaction: string;
  created_date?: string;
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const cutoff = new Date(Date.now() - WEEK_DAYS * 24 * 60 * 60 * 1000).toISOString();

  let digests = 0;
  let skipped = 0;
  let errored = 0;

  try {
    // All sessions — we'll filter by activity in JS.
    const sessions = (await base44.asServiceRole.entities.MiraSession.list()) as Session[];

    for (const session of sessions) {
      try {
        // Skip sessions with no activity in the window.
        if (!session.last_turn_at || session.last_turn_at < cutoff) {
          skipped++;
          continue;
        }

        // Load this week's posture events.
        const events = (await base44.asServiceRole.entities.PostureEvent.filter({
          session_id: session.id,
        })) as PostureEvent[];
        const weekEvents = events.filter(
          (e) => (e.created_date ?? "") >= cutoff,
        );

        if (weekEvents.length === 0) {
          skipped++;
          continue;
        }

        // Compile the digest. Operational only — no chat content.
        const postureCounts: Record<string, number> = {};
        let reactions = 0;
        let avgValence = 0;
        for (const e of weekEvents) {
          postureCounts[e.posture] = (postureCounts[e.posture] ?? 0) + 1;
          if (e.reaction) reactions++;
          avgValence += e.valence;
        }
        avgValence = weekEvents.length > 0 ? avgValence / weekEvents.length : 0;

        const dominant = Object.entries(postureCounts).sort(
          (a, b) => b[1] - a[1],
        )[0]?.[0] ?? "steady";

        const digestText = `Week of ${new Date().toISOString().slice(0, 10)}: ${weekEvents.length} transitions on ${session.surface}. Dominant posture: ${dominant}. ${reactions} notable reaction${reactions === 1 ? "" : "s"}. Settled: ${(avgValence * -100).toFixed(0)}%.`;

        // Write the digest as an agent turn.
        await base44.asServiceRole.entities.MiraTurn.create({
          session_id: session.id,
          session_key: session.session_key,
          surface: session.surface,
          role: "agent",
          content: digestText,
          posture: "completed",
          live: false,
          redacted: false,
        });

        await base44.asServiceRole.entities.MiraSession.update(session.id, {
          last_posture: "completed",
          last_turn_at: new Date().toISOString(),
        });

        digests++;
      } catch {
        errored++;
      }
    }
  } catch (e) {
    return Response.json(
      { error: "Digest sweep failed", detail: String(e) },
      { status: 500 },
    );
  }

  return Response.json({
    ok: true,
    mode: "weekly_digest",
    digests,
    skipped,
    errored,
  });
});
