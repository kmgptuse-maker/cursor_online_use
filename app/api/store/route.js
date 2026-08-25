export const runtime = "nodejs";

import { requireSession } from "../../../lib/auth.js";
import { getStore, summaryStats } from "../../../lib/store/local.js";
import { EMPLOYEES } from "../../../lib/constants.js";
import { getAiConfigStatus } from "../../../lib/ai/index.js";

export async function GET() {
  const auth = await requireSession(["employee", "hr_admin"]);
  if (auth.error) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const store = await getStore();
  const stats = await summaryStats();
  const ai = getAiConfigStatus();

  if (auth.session.role === "employee") {
    const record = store.records[auth.session.employee_id] || {
      assessment_status: "Not started",
      scores: {},
      plan: null,
    };
    const employee = EMPLOYEES.find((e) => e.employee_id === auth.session.employee_id);
    return Response.json({
      session: auth.session,
      cycle_name: store.cycle_name,
      employee,
      record,
      ai,
    });
  }

  const rows = EMPLOYEES.map((e) => ({
    ...e,
    record: store.records[e.employee_id] || {
      assessment_status: "Not started",
      scores: {},
      plan: null,
    },
  }));

  return Response.json({
    session: auth.session,
    cycle_name: store.cycle_name,
    stats,
    employees: rows,
    courses: (await import("../../../lib/constants.js")).COURSES,
    ai,
  });
}
