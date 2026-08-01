import { createHmac, randomBytes } from "node:crypto";

export const runtime = "nodejs";

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export async function GET() {
  const url =
    process.env.VOICE_GATEWAY_URL?.trim() ||
    process.env.NEXT_PUBLIC_VOICE_WS_URL?.trim();
  if (!url) {
    return Response.json({ error: "Voice gateway is not configured." }, { status: 503 });
  }

  const secret = process.env.VOICE_GATEWAY_SECRET?.trim();
  const expiresAt = Math.floor(Date.now() / 1000) + 60;
  const payload = `${expiresAt}.${randomBytes(12).toString("base64url")}`;
  const ticket = secret ? `${payload}.${sign(payload, secret)}` : undefined;

  return Response.json(
    { ws_url: url, ticket },
    { headers: { "Cache-Control": "no-store" } },
  );
}
