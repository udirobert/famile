import { getBenchData } from "@/lib/bench";

export const runtime = "nodejs";

// Public, cacheable read of what the bench projects published upstream.
export async function GET() {
  const data = await getBenchData();
  return Response.json(data, {
    headers: { "cache-control": "public, max-age=900, stale-while-revalidate=86400" },
  });
}
