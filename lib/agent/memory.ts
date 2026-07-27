// Base44 shared Mira memory store — client wrapper.
//
// This module is the single seam between famile/web and the Base44 backend
// in /base44. It exposes two operations:
//
//   - streamAnswer(args): call the miraAnswer function via direct fetch to
//     the Base44 API endpoint (streaming text/plain response).
//   - loadHistory(args): call the miraHistory function via the SDK's
//     functions.invoke() (JSON response).
//
// When BASE44_APP_ID is unset (local dev, or Base44 is down), both functions
// signal failure so the caller can fall back to the existing in-process
// LiveEngine/ReplayEngine. This preserves famile/web's existing degradation
// posture: the Ask surface never goes dark because the memory store is down.
//
// The session_key is an opaque random string minted client-side and stored in
// an httpOnly cookie (see app/api/agent/route.ts). It is the capability
// boundary: whoever holds it can read and append to this session. Real auth
// is a post-competition concern; the RLS rules in MiraSession.json and
// MiraTurn.json are written to enforce it natively once it lands.

import { createClient } from "@base44/sdk";

export type Surface = "famile" | "sukari" | "orbura" | "ardum";

export type HistoryTurn = {
  role: "user" | "agent";
  content: string;
  created_date?: string;
  redacted?: boolean;
};

export type HistoryResult = {
  session_id: string;
  surface: Surface;
  turns: HistoryTurn[];
};

export type StreamAnswerArgs = {
  sessionKey: string;
  surface: Surface;
  query: string;
  signal?: AbortSignal;
};

export type StreamAnswerResult = {
  ok: boolean;
  response?: Response;
  error?: string;
};

const SURFACE: Surface = "famile";
const BASE44_SERVER = "https://base44.app";

export function base44Configured(): boolean {
  return Boolean(process.env.BASE44_APP_ID);
}

let _client: ReturnType<typeof createClient> | null = null;

function getClient(): ReturnType<typeof createClient> {
  if (!_client) {
    _client = createClient({
      appId: process.env.BASE44_APP_ID!,
    });
  }
  return _client;
}

/**
 * Build the Base44 function API URL.
 * Format: https://base44.app/api/apps/<appId>/functions/<name>
 */
function functionApiUrl(name: string): string {
  const appId = process.env.BASE44_APP_ID!;
  return `${BASE44_SERVER}/api/apps/${appId}/functions/${name}`;
}

/**
 * Proxy a Mira query to the Base44 miraAnswer function.
 * Uses direct fetch to the Base44 API for streaming response support.
 * Returns the streaming Response on success, or { ok: false } on failure
 * so the caller can fall back to the local engine.
 */
export async function streamAnswer(
  args: StreamAnswerArgs,
): Promise<StreamAnswerResult> {
  if (!base44Configured()) {
    return { ok: false, error: "BASE44_APP_ID not set" };
  }
  try {
    const appId = process.env.BASE44_APP_ID!;
    const res = await fetch(functionApiUrl("miraAnswer"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": appId,
      },
      body: JSON.stringify({
        session_key: args.sessionKey,
        surface: args.surface,
        query: args.query,
      }),
      signal: args.signal,
    });
    if (!res.ok) {
      return { ok: false, error: `Base44 ${res.status}` };
    }
    return { ok: true, response: res };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

/**
 * Load prior turns for a session. Uses SDK functions.invoke() for JSON response.
 * Returns null when the session doesn't exist yet (first visit) or on error.
 */
export async function loadHistory(
  sessionKey: string,
  surface: Surface = SURFACE,
  limit = 20,
): Promise<HistoryResult | null> {
  if (!base44Configured()) return null;
  try {
    const client = getClient();
    const result = await client.functions.invoke("miraHistory", {
      session_key: sessionKey,
      surface,
      limit,
    });
    // SDK invoke() returns an axios response; extract .data
    const data = (result as { data?: HistoryResult })?.data ?? result;
    return data as HistoryResult;
  } catch {
    return null;
  }
}

/**
 * Mint a fresh session key. 32 bytes of entropy, base64url-encoded.
 * Used by the route handler when no session cookie is present.
 */
export function mintSessionKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

function base64Url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export { SURFACE as FAMILE_SURFACE };
