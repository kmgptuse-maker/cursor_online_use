import { redirect } from "next/navigation";
import HrExport from "../../../components/HrExport.js";
import { getSession } from "../../../lib/auth.js";
import { summaryStats } from "../../../lib/store/local.js";
import { getAiConfigStatus } from "../../../lib/ai/index.js";

export default async function ExportPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "hr_admin") redirect("/");
  const stats = await summaryStats();

  return (
    <HrExport
      initial={{ session, stats, ai: getAiConfigStatus() }}
    />
  );
}
