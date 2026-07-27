// Mira history function — read a session's turns for client hydration.
//
// Contract: GET ?session_key=<key>&surface=<surface>&limit=<n>
//        or POST { session_key, surface, limit }
//   -> 200 { session_id, surface, turns: [{ role, content, created_date, redacted }] }
//   -> 400 on bad input, 404 if no session
//
// Used by famile/web on /ask mount to restore a conversation after refresh,
// and by sibling surfaces (orbura, ardum, sukari) to read shared Mira state
// when the person crosses products. This is the cross-product read contract.
//
// Reads use asServiceRole because famile.xyz is anonymous. The session_key is
// the capability: whoever holds it can read this session's turns. When real
// auth lands, the RLS rules on MiraTurn enforce this natively without a
// service role.

import { createClientFromRequest } from "npm:@base44/sdk";

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;

Deno.serve(async (req: Request) => {
  // Accept both GET (query params) and POST (JSON body). The SDK's
  // functions.invoke() sends POST; direct HTTP calls use GET.
  let session_key: string | null = null;
  let surface: string | null = null;
  let limitRaw: string | null = null;

  if (req.method === "POST") {
    try {
      const body = await req.json();
      session_key = body.session_key ?? null;
      surface = body.surface ?? null;
      limitRaw = body.limit != null ? String(body.limit) : null;
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
  } else if (req.method === "GET") {
    const url = new URL(req.url);
    session_key = url.searchParams.get("session_key");
    surface = url.searchParams.get("surface");
    limitRaw = url.searchParams.get("limit");
  } else {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (
    !session_key ||
    session_key.length < 8 ||
    session_key.length > 128
  ) {
    return Response.json({ error: "Invalid session_key" }, { status: 400 });
  }
  const validSurfaces = ["famile", "sukari", "orbura", "ardum"];
  if (!surface || !validSurfaces.includes(surface)) {
    return Response.json({ error: "Invalid surface" }, { status: 400 });
  }
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(limitRaw) || DEFAULT_LIMIT),
  );

  const base44 = createClientFromRequest(req);

  // Resolve the session. 404 if no session exists yet — the client should
  // mint a new session_key in that case (the AskExperience does this on
  // first mount).
  let session: { id: string } | null = null;
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

  // Load the most recent turns, oldest first.
  try {
    const turns = await base44.asServiceRole.entities.MiraTurn.filter({
      session_id: session.id,
    });
    const sorted = (turns ?? [])
      .slice()
      .sort(
        (a: { created_date?: string }, b: { created_date?: string }) =>
          (a.created_date ?? "").localeCompare(b.created_date ?? ""),
      );
    const slice = sorted.slice(-limit);
    return Response.json({
      session_id: session.id,
      surface,
      turns: slice.map(
        (t: {
          role: string;
          content: string;
          created_date?: string;
          redacted?: boolean;
        }) => ({
          role: t.role === "user" ? "user" : "agent",
          content: t.content,
          created_date: t.created_date,
          redacted: Boolean(t.redacted),
        }),
      ),
    });
  } catch (e) {
    return Response.json(
      { error: "Failed to load turns", detail: String(e) },
      { status: 500 },
    );
  }
});
