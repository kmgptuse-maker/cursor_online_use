import { redirect } from "next/navigation";
import HrEmployees from "../../../components/HrEmployees.js";
import { getSession } from "../../../lib/auth.js";
import { getStore } from "../../../lib/store/local.js";
import { EMPLOYEES } from "../../../lib/constants.js";
import { getAiConfigStatus } from "../../../lib/ai/index.js";

export default async function EmployeesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "hr_admin") redirect("/");

  const store = await getStore();
  const employees = EMPLOYEES.map((e) => ({
    ...e,
    record: store.records[e.employee_id] || {
      assessment_status: "Not started",
      scores: {},
      plan: null,
    },
  }));

  return (
    <HrEmployees
      initial={{ session, employees, ai: getAiConfigStatus() }}
    />
  );
}
