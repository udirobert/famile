import { getEngine } from "@/lib/agent/runtime";
import { rateLimit } from "@/lib/agent/ratelimit";
import {
  base44Configured,
  mintSessionKey,
  streamAnswer,
  FAMILE_SURFACE,
} from "@/lib/agent/memory";

// POST { query: string } -> text/plain stream of reasoning chunks.
// Sets X-Famile-Live so the client can label live vs recorded honestly.
//
// Two paths:
//   1. Base44 shared memory store (when BASE44_APP_ID is set). The query is
//      proxied to the miraAnswer function, which persists both turns, loads
//      prior context, and streams Mira's reply. The session_key is held in
//      an httpOnly cookie so the same conversation survives refresh.
//   2. Local engine fallback (when BASE44_APP_ID is unset or Base44 is
//      unreachable). Falls back to the existing LiveEngine/ReplayEngine so
//      the Ask surface never goes dark because the memory store is down.
export const runtime = "nodejs";

const MAX_QUERY_CHARS = 500;
const MAX_BODY_BYTES = 10_000;
const SESSION_COOKIE = "famile_mira_session";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function readSessionKey(req: Request): string {
  // Check for a session key in the request body first (for shared links).
  // The body is read once in POST; we parse it here and re-stringify for
  // the downstream consumer. Actually, the body is consumed by the POST
  // handler, so we read the cookie only here. The session parameter from
  // the URL is passed through the body by the client (see MiraConversation).
  const cookieHeader = req.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === SESSION_COOKIE && v.length > 0) {
      return v.join("=").trim();
    }
  }
  // Check the Referer URL for a ?session= parameter (shared link open in
  // a new browser without the cookie).
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      const sessionParam = url.searchParams.get("session");
      if (sessionParam && sessionParam.length >= 8) return sessionParam;
    } catch {
      // Invalid referer, ignore.
    }
  }
  return mintSessionKey();
}

export async function POST(req: Request) {
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return new Response("Request too large", { status: 413 });
  }

  let query: unknown;
  let bodySession: unknown;
  try {
    const body = await req.json();
    ({ query, session: bodySession } = body);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  if (typeof query !== "string" || !query.trim()) {
    return new Response("Missing query", { status: 400 });
  }
  // Cap input to bound token cost and injection payload size.
  const q = query.trim().slice(0, MAX_QUERY_CHARS);

  const ip = clientIp(req);
  const rl = await rateLimit(ip);
  if (!rl.ok) {
    const retryAfter = Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000));
    return new Response("Too many requests. Slow down.", {
      status: 429,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Retry-After": String(retryAfter),
        "RateLimit-Limit": String(rl.limit),
        "RateLimit-Remaining": "0",
        "RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
      },
    });
  }

  // Path 1: Base44 shared memory store.
  if (base44Configured()) {
    // Session key priority: body field (explicit, from shared link) >
    // cookie (returning visitor) > Referer URL param > mint new.
    let sessionKey: string | null = null;
    if (typeof bodySession === "string" && bodySession.length >= 8) {
      sessionKey = bodySession;
    }
    if (!sessionKey) sessionKey = readSessionKey(req);
    const result = await streamAnswer({
      sessionKey,
      surface: FAMILE_SURFACE,
      query: q,
    });
    if (result.ok && result.response) {
      // Forward the streaming response, then set the session cookie. We
      // can't set headers on a streamed response after it starts, so we
      // clone the body and re-wrap with our cookie header.
      const upstream = result.response;
      const body = upstream.body;
      const headers = new Headers(upstream.headers);
      headers.set(
        "RateLimit-Limit",
        String(rl.limit),
      );
      headers.set(
        "RateLimit-Remaining",
        String(rl.remaining),
      );
      headers.set(
        "RateLimit-Reset",
        String(Math.ceil(rl.resetAt / 1000)),
      );
      headers.set(
        "Set-Cookie",
        `${SESSION_COOKIE}=${sessionKey}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_COOKIE_MAX_AGE}`,
      );
      return new Response(body, { status: upstream.status, headers });
    }
    // Base44 failed — fall through to the local engine so the surface
    // degrades gracefully instead of going dark.
  }

  // Path 2: local engine (existing behavior, preserved as fallback).
  const engine = getEngine();
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of engine.answerStream(q)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch {
        controller.enqueue(encoder.encode("[stream error]"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Famile-Live": String(engine.live),
      "RateLimit-Limit": String(rl.limit),
      "RateLimit-Remaining": String(rl.remaining),
      "RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
    },
  });
}
