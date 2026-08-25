export const runtime = "nodejs";

import { sessionCookieHeader } from "../../../../lib/auth.js";
import { EMPLOYEES } from "../../../../lib/constants.js";

export async function POST(request) {
  const { role, employee_id } = await request.json();

  if (!role || !["employee", "hr_admin"].includes(role)) {
    return Response.json({ error: "Invalid role." }, { status: 400 });
  }

  if (role === "employee") {
    const emp = EMPLOYEES.find((e) => e.employee_id === employee_id);
    if (!emp) {
      return Response.json({ error: "Employee not found." }, { status: 404 });
    }
    const session = {
      role: "employee",
      employee_id: emp.employee_id,
      name: emp.full_name,
    };
    return new Response(JSON.stringify({ ok: true, session }), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": sessionCookieHeader(session),
      },
    });
  }

  const session = { role: "hr_admin", employee_id: null, name: "Mary Chen (HR)" };
  return new Response(JSON.stringify({ ok: true, session }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": sessionCookieHeader(session),
    },
  });
}
