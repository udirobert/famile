// Mira exception escalation function.
//
// Triggered by a PostureEvent automation when valence >= 0.6 (disrupted) or
// posture is 'resolving'. Creates a CareTeamAlert and, when severity warrants,
// posts to the care-team Slack channel via the shared Slack connector.
//
// This is the exception-oriented care-team signal from docs/PRODUCTS.md:
//   "Care teams see only what shifted, not the noise that doesn't."
//
// The alert carries operational context only (posture, valence, surface) —
// never chat content or PHI. The Slack message is the same: operational
// signal, not a transcript.

import { createClientFromRequest } from "npm:@base44/sdk";

const DISRUPTION_VALENCE_THRESHOLD = 0.6;

type PostureEvent = {
  id: string;
  session_id: string;
  session_key: string;
  surface: string;
  posture: string;
  previous_posture: string;
  valence: number;
  reaction: string;
  note: string;
};

type ExistingAlert = {
  session_id: string;
  delivery_status: string;
  created_date?: string;
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // The automation payload for entity events includes the created record.
  let body: { args?: { mode?: string }; data?: Partial<PostureEvent> };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Entity automation payloads include the created record in `data`.
  // When triggered manually (no automation), we read args.mode for testing.
  const event = body.data;
  if (!event || !event.session_id) {
    return Response.json({ ok: true, skipped: "no event data" });
  }

  // Only escalate on disruption or resolving posture.
  const isDisrupted = (event.valence ?? 0) >= DISRUPTION_VALENCE_THRESHOLD;
  const isResolving = event.posture === "resolving";
  if (!isDisrupted && !isResolving) {
    return Response.json({ ok: true, skipped: "not an exception" });
  }

  // Deduplicate: skip if there's a pending alert for this session in the
  // last 6 hours.
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  try {
    const existing = (await base44.asServiceRole.entities.CareTeamAlert.filter({
      session_id: event.session_id,
    })) as ExistingAlert[];
    const hasPending = existing.some(
      (a) =>
        a.delivery_status === "pending" &&
        (a.created_date ?? "") > sixHoursAgo,
    );
    if (hasPending) {
      return Response.json({ ok: true, skipped: "pending alert exists" });
    }
  } catch {
    // Non-fatal: proceed to create the alert.
  }

  // Determine severity.
  const severity = isResolving && isDisrupted ? "escalate" : isResolving ? "follow_up" : "watch";

  const reason = isResolving
    ? `Mira absorbed a setback on ${event.surface}. Posture: resolving, valence ${(event.valence ?? 0).toFixed(2)}.${event.note ? ` Note: ${event.note}` : ""}`
    : `Disruption signal on ${event.surface}. Valence ${(event.valence ?? 0).toFixed(2)}, posture ${event.posture}.`;

  // Create the alert.
  let alert: { id: string };
  try {
    alert = await base44.asServiceRole.entities.CareTeamAlert.create({
      session_id: event.session_id,
      session_key: event.session_key ?? "",
      surface: event.surface ?? "famile",
      severity,
      reason,
      delivery_status: "pending",
      delivery_channel: "dashboard_only",
    });
  } catch (e) {
    return Response.json(
      { error: "Failed to create alert", detail: String(e) },
      { status: 500 },
    );
  }

  // For 'escalate' severity, post to the care-team Slack channel via the
  // shared Slack connector. The connector must be configured in the Base44
  // dashboard (Integrations > Connectors > Slack). If not configured, the
  // alert stays dashboard_only.
  if (severity === "escalate") {
    try {
      // Shared connector: retrieve an OAuth access token, then call the
      // Slack Web API directly. See:
      // https://docs.base44.com/developers/backend/resources/connectors/shared-connectors
      const { accessToken } = await base44.asServiceRole.connectors.getConnection("slackbot");
      const message = `:rotating_light: *Famile care-team alert*\nSeverity: ${severity}\nSurface: ${event.surface}\n${reason}\nAlert ID: ${alert.id}\nAcknowledge in the Famile dashboard.`;
      const channel = process.env.CARE_TEAM_SLACK_CHANNEL ?? "#famile-care";

      const slackRes = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channel, text: message }),
      });
      const slackData = await slackRes.json();

      if (slackData.ok) {
        await base44.asServiceRole.entities.CareTeamAlert.update(alert.id, {
          delivery_status: "sent",
          delivery_channel: "slack",
        });
      } else {
        await base44.asServiceRole.entities.CareTeamAlert.update(alert.id, {
          delivery_status: "failed",
          delivery_channel: "dashboard_only",
        });
      }
    } catch {
      // Slack delivery failed — keep the alert as dashboard_only so the
      // care team still sees it.
      await base44.asServiceRole.entities.CareTeamAlert.update(alert.id, {
        delivery_status: "failed",
        delivery_channel: "dashboard_only",
      });
    }
  } else {
    // Non-escalate alerts are dashboard-only by design.
    await base44.asServiceRole.entities.CareTeamAlert.update(alert.id, {
      delivery_status: "sent",
      delivery_channel: "dashboard_only",
    });
  }

  return Response.json({
    ok: true,
    alert_id: alert.id,
    severity,
    delivered: severity === "escalate" ? "slack" : "dashboard_only",
  });
});
