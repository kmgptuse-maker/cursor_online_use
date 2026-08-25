import { redirect } from "next/navigation";
import EmployeeHome from "../components/EmployeeHome.js";
import { getSession } from "../lib/auth.js";
import { getStore } from "../lib/store/local.js";
import { getEmployee } from "../lib/constants.js";
import { getAiConfigStatus } from "../lib/ai/index.js";

export default async function HomePage() {
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
    <EmployeeHome
      initial={{
        session,
        employee,
        record,
        cycle_name: store.cycle_name,
        ai: getAiConfigStatus(),
      }}
    />
  );
}
