import { getEngine } from "@/lib/agent/runtime";
import { rateLimit } from "@/lib/agent/ratelimit";

// POST { query: string } -> text/plain stream of reasoning chunks.
// Sets X-Famile-Live so the client can label live vs recorded honestly.
export const runtime = "nodejs";

const MAX_QUERY_CHARS = 500;
const MAX_BODY_BYTES = 10_000;

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return new Response("Request too large", { status: 413 });
  }

  let query: unknown;
  try {
    ({ query } = await req.json());
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
