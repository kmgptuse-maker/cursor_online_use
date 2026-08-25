"use client";

import { useRouter } from "next/navigation";
import AppShell from "./AppShell.js";

export default function HrExport({ initial }) {
  const { session, stats, ai } = initial;
  const router = useRouter();

  async function resetDemo() {
    if (!confirm("Reset all demo data to initial seed state?")) return;
    await fetch("/api/store/reset", { method: "POST" });
    router.refresh();
  }

  return (
    <AppShell session={session} ai={ai}>
      <div className="panel">
        <h2>Export Reports</h2>
        <p className="intro">Download development plan data for HR records.</p>
        <p style={{ marginBottom: "1rem" }}>
          Ready to export: <strong>{stats.approved}</strong> approved plans |{" "}
          <strong>{stats.assessed}</strong> assessments submitted
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <a href="/api/export/csv" className="btn btn-primary">
            Export all plans (CSV)
          </a>
          <button type="button" className="btn btn-danger" onClick={resetDemo}>
            Reset demo data
          </button>
        </div>
      </div>
      <div className="panel">
        <h2>AI configuration</h2>
        <p className="intro">
          Provider: <strong>{ai.configured ? ai.provider : "none (fallback)"}</strong>
        </p>
        <ol className="intro" style={{ paddingLeft: "1.25rem" }}>
          <li>Copy .env.example to .env.local</li>
          <li>Add DEEPSEEK_API_KEY=sk-... or OPENAI_API_KEY</li>
          <li>Set AI_PROVIDER=deepseek or openai</li>
          <li>Restart npm run dev</li>
          <li>Submit a new assessment to trigger real AI</li>
        </ol>
      </div>
    </AppShell>
  );
}
