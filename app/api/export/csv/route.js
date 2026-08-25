export const runtime = "nodejs";

import { requireSession } from "../../../../lib/auth.js";
import { getStore } from "../../../../lib/store/local.js";
import { EMPLOYEES, getCourse } from "../../../../lib/constants.js";

export async function GET() {
  const auth = await requireSession(["hr_admin"]);
  if (auth.error) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const store = await getStore();
  const headers = [
    "employee_id",
    "full_name",
    "department",
    "job_role",
    "assessment_status",
    "plan_status",
    "top_gaps",
    "goals",
    "recommended_courses",
    "ai_provider",
  ];

  const rows = [headers.join(",")];
  for (const e of EMPLOYEES) {
    const r = store.records[e.employee_id] || {};
    const gaps = (r.plan?.gaps || [])
      .map((g) => `${g.competency_name}(${g.gap})`)
      .join("; ");
    const goals = (r.plan?.goals || []).join(" | ");
    const courses = (r.plan?.recommended_courses || [])
      .map((rc) => {
        const c = getCourse(rc.course_id);
        return c ? `${c.title}[${rc.progress}]` : rc.course_id;
      })
      .join("; ");
    const cols = [
      e.employee_id,
      e.full_name,
      e.department,
      e.job_role,
      r.assessment_status || "",
      r.plan?.status || "",
      gaps,
      goals,
      courses,
      r.plan?.ai_provider || "",
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
    rows.push(cols.join(","));
  }

  const csv = rows.join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="skillpath_development_plans.csv"',
    },
  });
}
