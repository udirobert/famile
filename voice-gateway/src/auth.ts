import { createHmac, timingSafeEqual } from "node:crypto";

export function validTicket(ticket: string | undefined, secret: string): boolean {
  if (!ticket) return false;
  const parts = ticket.split(".");
  if (parts.length !== 3) return false;
  const [expiresAt, nonce, signature] = parts;
  const payload = `${expiresAt}.${nonce}`;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  if (signature.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  return Number(expiresAt) > Math.floor(Date.now() / 1000);
}
