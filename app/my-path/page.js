import { redirect } from "next/navigation";
import MyPathPage from "../../components/MyPathPage.js";
import { getSession } from "../../lib/auth.js";
import { getStore } from "../../lib/store/local.js";
import { getAiConfigStatus } from "../../lib/ai/index.js";

export default async function MyPath() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "hr_admin") redirect("/hr/dashboard");

  const store = await getStore();
  const record = store.records[session.employee_id] || {
    assessment_status: "Not started",
    scores: {},
    plan: null,
  };

  return (
    <MyPathPage
      initial={{
        session,
        record,
        ai: getAiConfigStatus(),
      }}
    />
  );
}
