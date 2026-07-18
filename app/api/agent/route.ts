import { getEngine } from "@/lib/agent/runtime";

// POST { query: string } -> text/plain stream of reasoning chunks.
// Sets X-Famile-Live so the client can label live vs recorded honestly.
export const runtime = "nodejs";

export async function POST(req: Request) {
  let query: unknown;
  try {
    ({ query } = await req.json());
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  if (typeof query !== "string" || !query.trim()) {
    return new Response("Missing query", { status: 400 });
  }

  const engine = getEngine();
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of engine.answerStream(query)) {
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
    },
  });
}
