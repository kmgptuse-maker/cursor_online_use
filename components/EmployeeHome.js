"use client";

import Link from "next/link";
import AppShell, { StatusBadge } from "./AppShell.js";

export default function EmployeeHome({ initial }) {
  const { employee, record, cycle_name, ai, session } = initial;

  return (
    <AppShell session={session} ai={ai}>
      <div className="panel" style={{ maxWidth: 520, margin: "1rem auto", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.5rem", color: "var(--navy)", marginBottom: "0.5rem" }}>
          Welcome, {employee.full_name.split(" ")[0]}
        </h1>
        <p className="intro">
          {cycle_name} | {employee.department} | {employee.job_role}
        </p>
        <p className="intro">
          Rate yourself honestly on each skill. Your answers help us build a learning plan tailored to your role.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/assessment" className="btn btn-primary">
            {record.assessment_status === "Submitted" ? "View Assessment" : "Start Assessment"}
          </Link>
          <Link href="/my-path" className="btn">
            My Learning Path
          </Link>
        </div>
        <div style={{ marginTop: "1.5rem", textAlign: "left" }}>
          <p>
            <strong>Assessment:</strong> <StatusBadge status={record.assessment_status} />
          </p>
          <p style={{ marginTop: "0.35rem" }}>
            <strong>Plan:</strong>{" "}
            <StatusBadge status={record.plan?.status || "Not generated"} />
          </p>
        </div>
        {!ai?.configured && (
          <div className="alert alert-warn" style={{ marginTop: "1rem", textAlign: "left" }}>
            AI key not configured - submit will use rule-based fallback until you add DEEPSEEK_API_KEY to
            .env.local
          </div>
        )}
      </div>
    </AppShell>
  );
}
