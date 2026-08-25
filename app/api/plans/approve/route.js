export const runtime = "nodejs";

import { requireSession } from "../../../../lib/auth.js";
import { getRecord, updateRecord } from "../../../../lib/store/local.js";

export async function POST(request) {
  const auth = await requireSession(["hr_admin"]);
  if (auth.error) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const { employee_id, action, goals } = await request.json();
  if (!employee_id || !action) {
    return Response.json({ error: "Missing employee_id or action." }, { status: 400 });
  }

  const record = await getRecord(employee_id);
  if (!record.plan) {
    return Response.json({ error: "No plan to review." }, { status: 400 });
  }

  if (action === "approve") {
    const updatedGoals = Array.isArray(goals) && goals.length ? goals : record.plan.goals;
    await updateRecord(employee_id, {
      plan: {
        ...record.plan,
        goals: updatedGoals,
        status: "Approved",
        approved_at: new Date().toISOString().slice(0, 10),
        approved_by: auth.session.name,
      },
    });
    return Response.json({ ok: true, status: "Approved" });
  }

  if (action === "reject") {
    await updateRecord(employee_id, {
      plan: { ...record.plan, status: "Rejected" },
    });
    return Response.json({ ok: true, status: "Rejected" });
  }

  if (action === "edit_goals") {
    await updateRecord(employee_id, {
      plan: { ...record.plan, goals: goals || record.plan.goals },
    });
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Unknown action." }, { status: 400 });
}
