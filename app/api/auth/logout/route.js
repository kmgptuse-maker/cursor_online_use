export const runtime = "nodejs";

import { clearSessionCookieHeader } from "../../../../lib/auth.js";

export async function POST() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": clearSessionCookieHeader(),
    },
  });
}
