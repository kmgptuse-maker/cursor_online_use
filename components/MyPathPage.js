"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell, { PlanSummary } from "./AppShell.js";

export default function MyPathPage({ initial }) {
  const { session, record, ai } = initial;
  const router = useRouter();
  const plan = record.plan;

  async function updateProgress(courseId, progress) {
    await fetch("/api/assessments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course_id: courseId, progress }),
    });
    router.refresh();
  }

  if (record.assessment_status !== "Submitted") {
    return (
      <AppShell session={session} ai={ai}>
        <div className="panel">
          <h2>My Learning Path</h2>
          <p className="intro">Complete your self-assessment first.</p>
          <Link href="/assessment" className="btn btn-primary">
            Go to Assessment
          </Link>
        </div>
      </AppShell>
    );
  }

  if (!plan) {
    return (
      <AppShell session={session} ai={ai}>
        <div className="panel">
          <h2>My Learning Path</h2>
          <p className="intro">Your plan is being prepared.</p>
        </div>
      </AppShell>
    );
  }

  if (plan.status !== "Approved") {
    return (
      <AppShell session={session} ai={ai}>
        <div className="panel">
          <h2>My Learning Path</h2>
          <p className="intro">
            Thank you. Your learning path is being prepared. HR will notify you when your plan is approved.
          </p>
          <p>
            Status: <strong>{plan.status}</strong>
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell session={session} ai={ai}>
      <div className="panel">
        <h2>My Learning Path</h2>
        <p className="intro">
          Approved by {plan.approved_by} on {plan.approved_at}
        </p>
        <PlanSummary plan={plan} showProgress onProgressChange={updateProgress} />
      </div>
    </AppShell>
  );
}
