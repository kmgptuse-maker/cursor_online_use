export function parsePlanJson(raw) {
  let text = String(raw || "").trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed.gaps)) parsed.gaps = [];
  if (!Array.isArray(parsed.goals)) parsed.goals = [];
  if (!Array.isArray(parsed.recommended_course_ids)) {
    parsed.recommended_course_ids = [];
  }
  if (!parsed.timeline_days) parsed.timeline_days = 90;
  if (!parsed.rationale) parsed.rationale = "";
  return parsed;
}

export function toStoredPlan(parsed, meta = {}) {
  return {
    gaps: parsed.gaps,
    goals: parsed.goals,
    timeline_days: parsed.timeline_days || 90,
    rationale: parsed.rationale,
    recommended_courses: (parsed.recommended_course_ids || []).map((id) => ({
      course_id: id,
      progress: "Not started",
    })),
    status: "Pending HR Review",
    approved_at: null,
    approved_by: null,
    ai_provider: meta.provider || null,
    ai_model: meta.model || null,
  };
}
