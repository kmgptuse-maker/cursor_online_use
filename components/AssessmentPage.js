"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell, { PlanSummary, StatusBadge } from "./AppShell.js";
import { COMPETENCIES, SCALE_LABELS } from "../lib/constants.js";

export default function AssessmentPage({ initial }) {
  const { session, employee, record, ai } = initial;
  const router = useRouter();
  const [scores, setScores] = useState(record.scores || {});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [plan, setPlan] = useState(record.plan);
  const readonly = record.assessment_status === "Submitted";

  function setScore(id, val) {
    setScores((s) => ({ ...s, [id]: Number(val) }));
  }

  async function saveDraft() {
    setLoading(true);
    await fetch("/api/assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", scores }),
    });
    setLoading(false);
    setMessage("Draft saved.");
  }

  async function submit() {
    for (const c of COMPETENCIES) {
      if (!scores[c.id]) {
        setMessage("Please answer all 10 questions before submitting.");
        return;
      }
    }
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submit", scores }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error || "Submit failed.");
      return;
    }
    setPlan(data.plan);
    setMessage(
      data.usedFallback
        ? `Submitted. ${data.message || "Rule-based plan generated."}`
        : "Submitted. AI learning path generated and sent to HR for review.",
    );
    router.refresh();
  }

  return (
    <AppShell session={session} ai={ai}>
      <div className="panel">
        <h2>Skills Self-Assessment - {employee.full_name}</h2>
        <p className="intro">
          Rate yourself on each competency from 1 (Basic) to 5 (Expert).
          {readonly ? " Your assessment has been submitted." : " You can save a draft and return later."}
        </p>
        {COMPETENCIES.map((c) => (
          <div className="competency-row" key={c.id}>
            <div className="q">{c.name}</div>
            <div className="desc">{c.description}</div>
            <div className="scale">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n}>
                  <input
                    type="radio"
                    name={c.id}
                    value={n}
                    checked={scores[c.id] === n}
                    disabled={readonly}
                    onChange={() => setScore(c.id, n)}
                  />
                  {n} {SCALE_LABELS[n]}
                </label>
              ))}
            </div>
          </div>
        ))}
        {!readonly && (
          <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button type="button" className="btn" onClick={saveDraft} disabled={loading}>
              Save draft
            </button>
            <button type="button" className="btn btn-primary" onClick={submit} disabled={loading}>
              {loading ? "Submitting..." : "Submit assessment"}
            </button>
          </div>
        )}
        {message && <div className="alert alert-info" style={{ marginTop: "1rem" }}>{message}</div>}
        {readonly && (
          <p style={{ marginTop: "1rem" }}>
            Status: <StatusBadge status={record.assessment_status} />
          </p>
        )}
      </div>
      {plan && (
        <div className="panel">
          <h2>Learning Path Preview</h2>
          <PlanSummary plan={plan} />
        </div>
      )}
    </AppShell>
  );
}
