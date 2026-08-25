export const runtime = "nodejs";

import { resetStore } from "../../../../lib/store/local.js";
import { requireSession } from "../../../../lib/auth.js";

export async function POST() {
  const auth = await requireSession(["hr_admin"]);
  if (auth.error) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }
  await resetStore();
  return Response.json({ ok: true });
}
