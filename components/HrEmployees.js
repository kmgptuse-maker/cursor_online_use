"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import AppShell, { PlanSummary, StatusBadge } from "./AppShell.js";

export default function HrEmployees({ initial }) {
  const { session, employees, ai } = initial;
  const router = useRouter();
  const [dept, setDept] = useState("");
  const [review, setReview] = useState(null);
  const [goalsText, setGoalsText] = useState("");
  const [busy, setBusy] = useState(false);

  const depts = useMemo(
    () => [...new Set(employees.map((e) => e.department))].sort(),
    [employees],
  );

  const filtered = employees.filter((e) => !dept || e.department === dept);

  function openReview(emp) {
    setReview(emp);
    setGoalsText((emp.record.plan?.goals || []).join("\n"));
  }

  async function approve() {
    if (!review) return;
    setBusy(true);
    const goals = goalsText.split("\n").filter(Boolean);
    await fetch("/api/plans/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id: review.employee_id, action: "approve", goals }),
    });
    setBusy(false);
    setReview(null);
    router.refresh();
  }

  async function reject() {
    if (!review) return;
    setBusy(true);
    await fetch("/api/plans/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id: review.employee_id, action: "reject" }),
    });
    setBusy(false);
    setReview(null);
    router.refresh();
  }

  return (
    <AppShell session={session} ai={ai}>
      <div className="panel">
        <h2>All Employees</h2>
        <div className="toolbar">
          <select value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="">All Departments</option>
            {depts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Assessment</th>
                <th>Plan</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.employee_id}>
                  <td>{e.full_name}</td>
                  <td>{e.department}</td>
                  <td><StatusBadge status={e.record.assessment_status} /></td>
                  <td><StatusBadge status={e.record.plan?.status || "-"} /></td>
                  <td>
                    {e.record.plan?.status === "Pending HR Review" ? (
                      <button type="button" className="btn btn-sm btn-primary" onClick={() => openReview(e)}>
                        Review
                      </button>
                    ) : e.record.plan ? (
                      <button type="button" className="btn btn-sm" onClick={() => openReview(e)}>
                        View
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {review && (
        <div className="modal-overlay" onClick={() => setReview(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Review Plan - {review.full_name}</h2>
            <p>{review.department} | {review.job_role}</p>
            {review.record.plan ? (
              <>
                <PlanSummary plan={review.record.plan} />
                {review.record.plan.status === "Pending HR Review" && (
                  <>
                    <h3>Edit Goals (before approval)</h3>
                    <textarea value={goalsText} onChange={(e) => setGoalsText(e.target.value)} />
                    <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <button type="button" className="btn btn-danger" onClick={reject} disabled={busy}>
                        Reject
                      </button>
                      <button type="button" className="btn btn-success" onClick={approve} disabled={busy}>
                        Approve plan
                      </button>
                      <button type="button" className="btn" onClick={() => setReview(null)}>
                        Close
                      </button>
                    </div>
                  </>
                )}
                {review.record.plan.status !== "Pending HR Review" && (
                  <button type="button" className="btn" style={{ marginTop: "1rem" }} onClick={() => setReview(null)}>
                    Close
                  </button>
                )}
              </>
            ) : (
              <p>No plan generated yet.</p>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
