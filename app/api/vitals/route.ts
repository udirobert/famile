import { NextResponse } from "next/server";

/**
 * Receives Core Web Vitals beacons from components/analytics/web-vitals.tsx.
 * Today: logs to the deployment's log drain. When an analytics store exists,
 * forward there instead.
 */
export async function POST(request: Request) {
  try {
    const metric = await request.json();
    console.log(
      "[vitals]",
      JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        navigationType: metric.navigationType,
      }),
    );
  } catch {
    // Malformed beacon — acknowledge quietly; vitals must never error loudly.
  }
  return new NextResponse(null, { status: 204 });
}
