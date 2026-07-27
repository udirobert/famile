// Mira network state function — reads the live network for the dashboard.
//
// Contract: GET -> 200 { sessions, recent_events, active_alerts, surfaces }
//
// Returns a snapshot of the Mira network: active sessions grouped by surface,
// the 20 most recent posture events (for the realtime feed), and any pending
// care-team alerts. The dashboard polls this on mount and then subscribes to
// PostureEvent via the SDK's realtime subscribe() for live updates.
//
// This is the visible surface of the Base44 backend: it turns a marketing
// site into a real agentic control plane. Judges see Mira working across
// products in realtime.

import { createClientFromRequest } from "npm:@base44/sdk";

const MAX_EVENTS = 20;
const MAX_ALERTS = 10;

type Session = {
  id: string;
  surface: string;
  last_posture: string;
  valence: number;
  turn_count: number;
  last_turn_at?: string;
};

type PostureEvent = {
  id: string;
  session_id: string;
  surface: string;
  posture: string;
  previous_posture: string;
  valence: number;
  reaction: string;
  note: string;
  created_date?: string;
};

type Alert = {
  id: string;
  session_id: string;
  surface: string;
  severity: string;
  reason: string;
  delivery_status: string;
  delivery_channel: string;
  created_date?: string;
};

Deno.serve(async (req) => {
  if (req.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const base44 = createClientFromRequest(req);

  try {
    const [sessions, events, alerts] = await Promise.all([
      base44.asServiceRole.entities.MiraSession.list("-last_turn_at", 50) as Promise<Session[]>,
      base44.asServiceRole.entities.PostureEvent.list("-created_date", MAX_EVENTS) as Promise<PostureEvent[]>,
      base44.asServiceRole.entities.CareTeamAlert.list("-created_date", MAX_ALERTS) as Promise<Alert[]>,
    ]);

    // Group sessions by surface.
    const surfaces: Record<string, number> = {
      famile: 0, sukari: 0, orbura: 0, ardum: 0,
    };
    for (const s of sessions) {
      surfaces[s.surface] = (surfaces[s.surface] ?? 0) + 1;
    }

    const activeAlerts = alerts.filter(
      (a) => a.delivery_status === "pending" || a.delivery_status === "sent",
    );

    return Response.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        surface: s.surface,
        last_posture: s.last_posture,
        valence: s.valence,
        turn_count: s.turn_count,
        last_turn_at: s.last_turn_at,
      })),
      recent_events: events.map((e) => ({
        id: e.id,
        session_id: e.session_id,
        surface: e.surface,
        posture: e.posture,
        previous_posture: e.previous_posture,
        valence: e.valence,
        reaction: e.reaction,
        note: e.note,
        created_date: e.created_date,
      })),
      active_alerts: activeAlerts.map((a) => ({
        id: a.id,
        session_id: a.session_id,
        surface: a.surface,
        severity: a.severity,
        reason: a.reason,
        delivery_status: a.delivery_status,
        delivery_channel: a.delivery_channel,
        created_date: a.created_date,
      })),
      surfaces,
      totals: {
        sessions: sessions.length,
        events: events.length,
        alerts: activeAlerts.length,
      },
    });
  } catch (e) {
    return Response.json(
      { error: "Network read failed", detail: String(e) },
      { status: 500 },
    );
  }
});
