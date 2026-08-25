import { redirect } from "next/navigation";
import AssessmentPage from "../../components/AssessmentPage.js";
import { getSession } from "../../lib/auth.js";
import { getStore } from "../../lib/store/local.js";
import { getEmployee } from "../../lib/constants.js";
import { getAiConfigStatus } from "../../lib/ai/index.js";

export default async function Assessment() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "hr_admin") redirect("/hr/dashboard");

  const store = await getStore();
  const employee = getEmployee(session.employee_id);
  const record = store.records[session.employee_id] || {
    assessment_status: "Not started",
    scores: {},
    plan: null,
  };

  return (
    <AssessmentPage
      initial={{
        session,
        employee,
        record,
        ai: getAiConfigStatus(),
      }}
    />
  );
}
