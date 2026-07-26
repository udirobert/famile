// Base44 shared Mira memory store — client wrapper.
//
// This module is the single seam between famile/web and the Base44 backend
// in /base44. It exposes two operations:
//
//   - streamAnswer(args): proxy to the miraAnswer function, returning a
//     streaming Response (text/plain) plus session/redaction headers.
//   - loadHistory(args): fetch prior turns for client hydration on mount.
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

export function base44Configured(): boolean {
  return Boolean(process.env.BASE44_APP_ID);
}

function functionUrl(name: "miraAnswer" | "miraHistory"): string {
  const appId = process.env.BASE44_APP_ID;
  if (!appId) throw new Error("BASE44_APP_ID not set");
  // Base44 external function endpoint shape. Confirmed in
  // https://docs.base44.com/developers/backend/resources/backend-functions/overview
  return `https://${appId}.base44.app/functions/${name}`;
}

/**
 * Proxy a Mira query to the Base44 miraAnswer function.
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
    const res = await fetch(functionUrl("miraAnswer"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Base44 external calls have no authenticated user; the function uses
        // asServiceRole and session_key scoping.
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
 * Load prior turns for a session. Used on /ask mount to restore a
 * conversation after refresh. Returns null when the session doesn't exist
 * yet (first visit) so the caller can skip hydration.
 */
export async function loadHistory(
  sessionKey: string,
  surface: Surface = SURFACE,
  limit = 20,
): Promise<HistoryResult | null> {
  if (!base44Configured()) return null;
  try {
    const url = new URL(functionUrl("miraHistory"));
    url.searchParams.set("session_key", sessionKey);
    url.searchParams.set("surface", surface);
    url.searchParams.set("limit", String(limit));
    const res = await fetch(url.toString(), { method: "GET" });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const data = (await res.json()) as HistoryResult;
    return data;
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
