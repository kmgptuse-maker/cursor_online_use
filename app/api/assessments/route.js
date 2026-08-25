export const runtime = "nodejs";

import { requireSession } from "../../../lib/auth.js";
import { generateLearningPath } from "../../../lib/ai/index.js";
import { getRecord, updateRecord, setPlan } from "../../../lib/store/local.js";
import { getEmployee } from "../../../lib/constants.js";

export async function POST(request) {
  const auth = await requireSession(["employee", "hr_admin"]);
  if (auth.error) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => ({}));
  const action = body.action || "save";

  let employeeId = auth.session.employee_id;
  if (auth.session.role === "hr_admin" && body.employee_id) {
    employeeId = body.employee_id;
  }

  if (!employeeId) {
    return Response.json({ error: "Employee id required." }, { status: 400 });
  }

  if (auth.session.role === "employee" && employeeId !== auth.session.employee_id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const record = await getRecord(employeeId);

  if (action === "save") {
    if (record.assessment_status === "Submitted") {
      return Response.json({ error: "Assessment already submitted." }, { status: 400 });
    }
    await updateRecord(employeeId, {
      assessment_status: "Draft",
      scores: body.scores || {},
    });
    return Response.json({ ok: true, status: "Draft" });
  }

  if (action === "submit") {
    if (record.assessment_status === "Submitted") {
      return Response.json({ error: "Assessment already submitted." }, { status: 400 });
    }
    const scores = body.scores || {};
    await updateRecord(employeeId, { assessment_status: "Submitted", scores });

    const employee = getEmployee(employeeId);
    const { plan, usedFallback, message } = await generateLearningPath(employee, scores);
    await setPlan(employeeId, plan);

    return Response.json({
      ok: true,
      status: "Submitted",
      plan,
      usedFallback,
      message,
    });
  }

  return Response.json({ error: "Unknown action." }, { status: 400 });
}

export async function PUT(request) {
  const auth = await requireSession(["employee", "hr_admin"]);
  if (auth.error) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { employee_id, course_id, progress } = body;
  const employeeId =
    auth.session.role === "employee" ? auth.session.employee_id : employee_id;

  if (!employeeId || !course_id || !progress) {
    return Response.json({ error: "Missing fields." }, { status: 400 });
  }

  const record = await getRecord(employeeId);
  if (!record.plan || record.plan.status !== "Approved") {
    return Response.json({ error: "No approved plan." }, { status: 400 });
  }

  const courses = record.plan.recommended_courses.map((c) =>
    c.course_id === course_id ? { ...c, progress } : c,
  );
  await updateRecord(employeeId, { plan: { ...record.plan, recommended_courses: courses } });
  return Response.json({ ok: true });
}
