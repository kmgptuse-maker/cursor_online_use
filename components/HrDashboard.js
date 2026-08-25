"use client";

import { useMemo, useState } from "react";
import AppShell, { StatusBadge } from "./AppShell.js";

export default function HrDashboard({ initial }) {
  const { session, stats, employees, cycle_name, ai } = initial;
  const [dept, setDept] = useState("");
  const [status, setStatus] = useState("");

  const depts = useMemo(
    () => [...new Set(employees.map((e) => e.department))].sort(),
    [employees],
  );

  const filtered = employees.filter((e) => {
    if (dept && e.department !== dept) return false;
    const ps = e.record.plan?.status;
    if (status === "pending" && ps !== "Pending HR Review") return false;
    if (status === "approved" && ps !== "Approved") return false;
    if (status === "notassessed" && e.record.assessment_status === "Submitted") return false;
    return true;
  });

  return (
    <AppShell session={session} ai={ai}>
      {!ai?.configured && (
        <div className="alert alert-warn">
          AI not configured. Add DEEPSEEK_API_KEY to .env.local and restart npm run dev for real AI plans.
        </div>
      )}
      <div className="cards">
        <div className="card"><div className="num">{stats.total}</div><div className="lbl">Employees</div></div>
        <div className="card"><div className="num">{stats.assessed}</div><div className="lbl">Assessed</div></div>
        <div className="card"><div className="num">{stats.pending}</div><div className="lbl">Plans Pending</div></div>
        <div className="card"><div className="num">{stats.approved}</div><div className="lbl">Approved</div></div>
      </div>
      <div className="panel">
        <h2>{cycle_name}</h2>
        <p className="intro">HR-only approval. Review AI-generated plans before employees can see them.</p>
        <div className="toolbar">
          <select value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="">All Departments</option>
            {depts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="pending">Pending HR Review</option>
            <option value="approved">Approved</option>
            <option value="notassessed">Not assessed</option>
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
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 20).map((e) => (
                <tr key={e.employee_id}>
                  <td>{e.full_name}</td>
                  <td>{e.department}</td>
                  <td><StatusBadge status={e.record.assessment_status} /></td>
                  <td><StatusBadge status={e.record.plan?.status || "-"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
