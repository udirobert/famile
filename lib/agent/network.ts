"use client";

// Base44 Mira network client — realtime posture feed for the orb and the
// "What shifted" feed on the dashboard.
//
// This module reads live posture events from Base44 and exposes them to
// React components. It deliberately does NOT expose sessions, alerts, or
// care-team data to the client: per docs/PRODUCTS.md, "care teams see only
// what shifted" — alerts go to the care-team Slack channel, not to the
// public dashboard. The public surface sees posture transitions only.
//
// When NEXT_PUBLIC_BASE44_APP_ID is unset (local dev, or Base44 is down),
// both hooks return empty/false so the dashboard falls back to its existing
// replay data and the orb uses local state. No surface ever goes dark.

import { useEffect, useState } from "react";
import { base44Configured } from "./memory";

export type Posture =
  | "steady" | "offering" | "holding" | "watching" | "completed"
  | "inquiry" | "gathering" | "resolving" | "adapting" | "arriving";

export type Surface = "famile" | "sukari" | "orbura" | "ardum";

export type PostureEventRow = {
  id: string;
  session_id: string;
  surface: Surface;
  posture: Posture;
  previous_posture: Posture;
  valence: number;
  reaction: string;
  note: string;
  created_date?: string;
};

type NetworkSnapshot = {
  recent_events: PostureEventRow[];
};

function functionUrl(name: "miraNetwork"): string {
  const appId = process.env.NEXT_PUBLIC_BASE44_APP_ID;
  if (!appId) throw new Error("NEXT_PUBLIC_BASE44_APP_ID not set");
  return `https://${appId}.base44.app/functions/${name}`;
}

/**
 * Realtime posture event feed. Polls the Base44 network snapshot every 5s
 * (the external-client realtime pattern; no websocket). Returns events
 * newest-first. When Base44 is not configured, returns an empty array and
 * connected=false so callers fall back to replay data.
 */
export function useNetworkRealtime(maxEvents = 20): {
  events: PostureEventRow[];
  connected: boolean;
} {
  const configured = base44Configured();
  const [events, setEvents] = useState<PostureEventRow[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!configured) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      if (cancelled) return;
      try {
        const res = await fetch(functionUrl("miraNetwork"), { method: "GET" });
        if (res.ok) {
          const data = (await res.json()) as NetworkSnapshot;
          if (!cancelled) {
            setEvents(
              (data.recent_events ?? []).slice(0, maxEvents),
            );
            setConnected(true);
          }
        } else {
          if (!cancelled) setConnected(false);
        }
      } catch {
        if (!cancelled) setConnected(false);
      } finally {
        if (!cancelled) {
          timer = setTimeout(poll, 5000);
        }
      }
    };
    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [configured, maxEvents]);

  return { events, connected };
}

/**
 * Track the latest posture across all surfaces. Used by the orb to sync
 * posture visually when a change happens on any product. The orb is
 * decorative to screen readers; modulation alone is the signal, never
 * rely on motion to distinguish postures.
 */
export function useLatestPosture(): {
  posture: Posture | null;
  connected: boolean;
} {
  const { events, connected } = useNetworkRealtime(1);
  const latest = events[0];
  return {
    posture: latest?.posture ?? null,
    connected,
  };
}
