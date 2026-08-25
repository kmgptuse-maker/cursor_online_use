export const runtime = "nodejs";

import { requireSession } from "../../../../lib/auth.js";
import { getEmployee } from "../../../../lib/constants.js";
import { generateLearningPath } from "../../../../lib/ai/index.js";
import { getRecord, setPlan, updateRecord } from "../../../../lib/store/local.js";

export async function POST(request) {
  const auth = await requireSession(["employee", "hr_admin"]);
  if (auth.error) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const employeeId = body.employee_id || auth.session.employee_id;

  if (auth.session.role === "employee" && employeeId !== auth.session.employee_id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const employee = getEmployee(employeeId);
  if (!employee) {
    return Response.json({ error: "Employee not found." }, { status: 404 });
  }

  const record = await getRecord(employeeId);
  if (record.assessment_status !== "Submitted") {
    return Response.json({ error: "Assessment must be submitted first." }, { status: 400 });
  }

  const { plan, usedFallback, message } = await generateLearningPath(employee, record.scores);
  await setPlan(employeeId, plan);

  return Response.json({
    ok: true,
    plan,
    usedFallback,
    message,
  });
}

export async function GET() {
  const { getAiConfigStatus } = await import("../../../../lib/ai/index.js");
  return Response.json(getAiConfigStatus());
}
