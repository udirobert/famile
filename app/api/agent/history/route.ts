import {
  base44Configured,
  loadHistory,
  FAMILE_SURFACE,
} from "@/lib/agent/memory";
import type { HistoryTurn } from "@/lib/agent/memory";

// GET -> 200 { turns: HistoryTurn[] } | 404 (no session yet) | 503 (Base44 not configured)
//
// Reads the session_key from the famile_mira_session cookie OR the ?session=
// URL parameter. The URL parameter enables the cross-product share moment:
// open famile.xyz/ask?session=<key> in a new tab, the same conversation
// hydrates from Base44 without a cookie. When Base44 is not configured,
// returns 503 so the client falls back to an empty conversation.
export const runtime = "nodejs";

const SESSION_COOKIE = "famile_mira_session";

function readSessionKey(req: Request): string | null {
  // Check the URL parameter first (explicit share link).
  const url = new URL(req.url);
  const sessionParam = url.searchParams.get("session");
  if (sessionParam && sessionParam.length >= 8) return sessionParam;

  // Fall back to the cookie.
  const cookieHeader = req.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === SESSION_COOKIE && v.length > 0) {
      return v.join("=").trim();
    }
  }
  return null;
}

export async function GET(req: Request) {
  if (!base44Configured()) {
    return Response.json(
      { error: "Base44 not configured" },
      { status: 503 },
    );
  }

  const sessionKey = readSessionKey(req);
  if (!sessionKey) {
    // First visit, no cookie yet. Empty conversation is the correct state.
    return Response.json({ turns: [] });
  }

  const result = await loadHistory(sessionKey, FAMILE_SURFACE, 20);
  if (!result) {
    // Session doesn't exist yet, or Base44 read failed. Empty conversation
    // is the safe fallback — the person can still start fresh.
    return Response.json({ turns: [] });
  }

  return Response.json({
    turns: result.turns as HistoryTurn[],
  });
}
