import { redirect } from "next/navigation";
import HrDashboard from "../../../components/HrDashboard.js";
import { getSession } from "../../../lib/auth.js";
import { getStore, summaryStats } from "../../../lib/store/local.js";
import { EMPLOYEES } from "../../../lib/constants.js";
import { getAiConfigStatus } from "../../../lib/ai/index.js";

async function hrBootstrap() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "hr_admin") redirect("/");
  const store = await getStore();
  const stats = await summaryStats();
  const employees = EMPLOYEES.map((e) => ({
    ...e,
    record: store.records[e.employee_id] || {
      assessment_status: "Not started",
      scores: {},
      plan: null,
    },
  }));
  return { session, stats, employees, cycle_name: store.cycle_name, ai: getAiConfigStatus() };
}

export default async function DashboardPage() {
  const initial = await hrBootstrap();
  return <HrDashboard initial={initial} />;
}
