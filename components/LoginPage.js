"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage({ employees }) {
  const router = useRouter();
  const [role, setRole] = useState("employee");
  const [employeeId, setEmployeeId] = useState(employees[0]?.employee_id || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, employee_id: employeeId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Login failed.");
      return;
    }
    router.push(role === "hr_admin" ? "/hr/dashboard" : "/");
    router.refresh();
  }

  return (
    <div className="login-box panel">
      <h2>SkillPath L&amp;D Login</h2>
      <p className="intro">Demo login for workshop. HR admin or employee view.</p>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="role">Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: "100%", marginTop: "0.35rem" }}
          >
            <option value="employee">Employee</option>
            <option value="hr_admin">HR Admin</option>
          </select>
        </div>
        {role === "employee" && (
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="emp">Employee</label>
            <select
              id="emp"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              style={{ width: "100%", marginTop: "0.35rem" }}
            >
              {employees.map((e) => (
                <option key={e.employee_id} value={e.employee_id}>
                  {e.full_name} ({e.department})
                </option>
              ))}
            </select>
          </div>
        )}
        {error && <div className="alert alert-warn">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="intro" style={{ marginTop: "1rem", fontSize: "0.8rem" }}>
        Add DEEPSEEK_API_KEY or OPENAI_API_KEY to .env.local for real AI learning paths.
      </p>
    </div>
  );
}
