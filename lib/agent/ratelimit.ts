// Fixed-window rate limiting per identifier (client IP). Multi-instance safe
// when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set (Upstash REST
// API via fetch, no SDK). Falls back to an in-memory map for local or
// single-instance use, which is NOT robust across serverless instances — set
// the Upstash env before going live on a multi-instance deploy.

export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // epoch ms
};

const WINDOW_SEC = 60;
const LIMIT = 12; // requests per window per IP

export async function rateLimit(identifier: string): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return upstash(identifier, url, token);
  return memory(identifier);
}

async function upstash(
  id: string,
  url: string,
  token: string,
): Promise<RateLimitResult> {
  const key = `famile:rl:${encodeURIComponent(id)}`;
  const resetAt = Date.now() + WINDOW_SEC * 1000;
  try {
    const incRes = await fetch(`${url}/INCR/${key}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (!incRes.ok) {
      // Fail open: never block because the limiter is down.
      return { ok: true, limit: LIMIT, remaining: LIMIT, resetAt };
    }
    const count = Number((await incRes.json()).result);
    if (count === 1) {
      await fetch(`${url}/EXPIRE/${key}/${WINDOW_SEC}`, {
        headers: { authorization: `Bearer ${token}` },
      });
    }
    return {
      ok: count <= LIMIT,
      limit: LIMIT,
      remaining: Math.max(0, LIMIT - count),
      resetAt,
    };
  } catch {
    return { ok: true, limit: LIMIT, remaining: LIMIT, resetAt };
  }
}

const mem = new Map<string, { count: number; expires: number }>();

function memory(id: string): RateLimitResult {
  const now = Date.now();
  const existing = mem.get(id);
  let count = 1;
  let expires = now + WINDOW_SEC * 1000;
  if (existing && existing.expires > now) {
    count = existing.count + 1;
    expires = existing.expires;
  }
  mem.set(id, { count, expires });
  if (mem.size > 2000) {
    for (const [k, v] of mem) if (v.expires <= now) mem.delete(k);
  }
  return {
    ok: count <= LIMIT,
    limit: LIMIT,
    remaining: Math.max(0, LIMIT - count),
    resetAt: expires,
  };
}
