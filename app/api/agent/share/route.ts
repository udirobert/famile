// GET -> 200 { session_key: string } | 200 { session_key: null }
//
// Returns the current session key so the client can build a shareable URL.
// The session key lives in an httpOnly cookie (not readable by client JS),
// so this endpoint exposes it as JSON. The person is already authenticated
// by possessing the cookie; this just lets them share the conversation
// across tabs or browsers via a ?session=<key> URL parameter.
//
// This is the cross-product browser moment: open famile.xyz/ask, ask Mira
// something, click share, open the link in another tab, the same
// conversation is there. Same Mira, same memory, different window.
export const runtime = "nodejs";

const SESSION_COOKIE = "famile_mira_session";

export async function GET(req: Request) {
  // Check the cookie first.
  const cookieHeader = req.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === SESSION_COOKIE && v.length > 0) {
      return Response.json({ session_key: v.join("=").trim() });
    }
  }

  // Also check the URL query parameter (for when the share link is opened
  // in a new browser that doesn't have the cookie yet).
  const url = new URL(req.url);
  const sessionParam = url.searchParams.get("session");
  if (sessionParam && sessionParam.length >= 8) {
    return Response.json({ session_key: sessionParam });
  }

  return Response.json({ session_key: null });
}
