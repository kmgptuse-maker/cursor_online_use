import { COMPETENCIES, COURSES, ROLE_REQUIREMENTS } from "../constants.js";

export function computeGaps(scores, jobRole) {
  const reqs = ROLE_REQUIREMENTS[jobRole] || {};
  const gaps = [];
  for (const [cid, req] of Object.entries(reqs)) {
    const cur = parseInt(scores[cid] || 0, 10);
    if (cur < req) {
      const c = COMPETENCIES.find((x) => x.id === cid);
      gaps.push({
        competency_id: cid,
        competency_name: c.name,
        category: c.category,
        current_level: cur,
        required_level: req,
        gap: req - cur,
        priority: req - cur >= 2 ? "high" : "medium",
      });
    }
  }
  gaps.sort((a, b) => b.gap - a.gap || a.competency_name.localeCompare(b.competency_name));
  return gaps.slice(0, 5);
}

export function recommendCourseIds(gaps) {
  const rec = [];
  const seen = new Set();
  for (const g of gaps) {
    for (const c of COURSES) {
      if (seen.has(c.course_id)) continue;
      if ((c.skills_covered || []).includes(g.competency_id) || c.category === g.category) {
        rec.push(c.course_id);
        seen.add(c.course_id);
        if (rec.length >= 3) return rec;
      }
    }
  }
  for (const c of COURSES) {
    if (!seen.has(c.course_id)) {
      rec.push(c.course_id);
      if (rec.length >= 3) break;
    }
  }
  return rec;
}

export function buildGoals(gaps) {
  const goals = gaps.slice(0, 3).map(
    (g) =>
      `Improve ${g.competency_name.toLowerCase()} from level ${g.current_level} toward required level ${g.required_level} through targeted learning and practice.`,
  );
  if (!goals.length) {
    goals.push("Maintain current skill levels and explore one stretch goal aligned with your role.");
  }
  return goals;
}

export function buildRationale(employee, gaps) {
  const focus =
    gaps.length > 0
      ? "the largest competency gaps relative to role requirements"
      : "continued professional development";
  return `Based on ${employee.full_name}'s self-assessment as ${employee.job_role} in ${employee.department}, this plan focuses on ${focus}. HR should review before publishing.`;
}

export function generateRuleBasedPlan(employee, scores) {
  const gaps = computeGaps(scores, employee.job_role);
  const courseIds = recommendCourseIds(gaps);
  return {
    gaps,
    goals: buildGoals(gaps),
    timeline_days: 90,
    rationale: buildRationale(employee, gaps),
    recommended_course_ids: courseIds,
    recommended_courses: courseIds.map((id) => ({ course_id: id, progress: "Not started" })),
  };
}
