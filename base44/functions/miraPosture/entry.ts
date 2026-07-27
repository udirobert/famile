// Mira posture transition function.
//
// Contract: POST { session_key, surface, posture, valence?, reaction?, note? }
//   -> 200 { event_id, session_id, posture, previous_posture }
//   -> 400 on bad input, 500 on persistence failure
//
// Writes a PostureEvent and updates the parent MiraSession's last_posture.
// The PostureEvent write triggers the realtime subscription on the dashboard
// and on every connected orb across the Famile network — so a posture change
// on famile.xyz ripples to the orb on orbura.famile.xyz in realtime.
//
// This is the cross-product identity made visible: same Mira, different
// material, one posture stream.

import { createClientFromRequest } from "npm:@base44/sdk";

const VALID_POSTURES = [
  "steady", "offering", "holding", "watching", "completed",
  "inquiry", "gathering", "resolving", "adapting", "arriving",
];
const VALID_REACTIONS = ["settle", "bloom", "pinch", "relief", ""];

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: {
    session_key?: unknown;
    surface?: unknown;
    posture?: unknown;
    valence?: unknown;
    reaction?: unknown;
    note?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { session_key, surface, posture, valence, reaction, note } = body;
  if (
    typeof session_key !== "string" ||
    session_key.length < 8 ||
    session_key.length > 128
  ) {
    return Response.json({ error: "Invalid session_key" }, { status: 400 });
  }
  const validSurfaces = ["famile", "sukari", "orbura", "ardum"];
  if (!validSurfaces.includes(surface as string)) {
    return Response.json({ error: "Invalid surface" }, { status: 400 });
  }
  if (typeof posture !== "string" || !VALID_POSTURES.includes(posture)) {
    return Response.json({ error: "Invalid posture" }, { status: 400 });
  }
  if (reaction !== undefined && !VALID_REACTIONS.includes(reaction as string)) {
    return Response.json({ error: "Invalid reaction" }, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  // Resolve the session.
  let session: { id: string; last_posture?: string } | null = null;
  try {
    const found = await base44.asServiceRole.entities.MiraSession.filter({
      session_key,
      surface,
    });
    if (found && found.length > 0) {
      session = found[0];
    }
  } catch (e) {
    return Response.json(
      { error: "Session lookup failed", detail: String(e) },
      { status: 500 },
    );
  }
  if (!session) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  const previous_posture = session.last_posture ?? "steady";
  const v = typeof valence === "number" ? Math.max(-1, Math.min(1, valence)) : 0;

  // Write the PostureEvent. This triggers the realtime subscription on
  // every connected client (dashboard + sibling orbs).
  let event: { id: string };
  try {
    event = await base44.asServiceRole.entities.PostureEvent.create({
      session_id: session.id,
      session_key,
      surface,
      posture,
      previous_posture,
      valence: v,
      reaction: typeof reaction === "string" ? reaction : "",
      note: typeof note === "string" ? note.slice(0, 280) : "",
    });
  } catch (e) {
    return Response.json(
      { error: "Failed to persist posture event", detail: String(e) },
      { status: 500 },
    );
  }

  // Update the session's current posture.
  try {
    await base44.asServiceRole.entities.MiraSession.update(session.id, {
      last_posture: posture,
      valence: v,
      last_turn_at: new Date().toISOString(),
    });
  } catch {
    // Non-fatal: the event is persisted; the session update is best-effort.
  }

  return Response.json({
    event_id: event.id,
    session_id: session.id,
    posture,
    previous_posture,
    valence: v,
  });
});
