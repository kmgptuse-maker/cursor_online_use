import { COMPETENCIES, COURSES, ROLE_REQUIREMENTS } from "../constants.js";

const SYSTEM_PROMPT = `You are an L&D advisor for Demo Corp. You create practical, encouraging employee development plans based on skill assessment data.

Rules:
- Use only the competencies and role requirements provided
- Identify the largest skill gaps (required level minus self-rating)
- Write 3-5 specific, actionable development goals in plain English
- Suggest a realistic 90-day timeline unless data suggests otherwise
- Be constructive; never label employees negatively
- Output valid JSON only, no markdown fences
- Language: English`;

export function buildUserPrompt(employee, scores) {
  const reqs = ROLE_REQUIREMENTS[employee.job_role] || {};
  const scoreLines = COMPETENCIES.map((c) => {
    const score = scores[c.id] ?? "not rated";
    return `- ${c.name} (${c.id}): ${score}`;
  }).join("\n");
  const reqLines = COMPETENCIES.map((c) => {
    const req = reqs[c.id] ?? "n/a";
    return `- ${c.name} (${c.id}): ${req}`;
  }).join("\n");
  const courseLines = COURSES.map(
    (c) => `- ${c.course_id}: ${c.title} | ${c.category} | ${c.format} | next: ${c.next_session_date}`,
  ).join("\n");

  return `Create a personalized learning path for this employee.

## Employee
- Name: ${employee.full_name}
- Department: ${employee.department}
- Job role: ${employee.job_role}
- Years of service: ${employee.years_of_service}

## Self-Assessment Scores (1=Basic, 5=Expert)
${scoreLines}

## Role Requirements (minimum level per competency)
${reqLines}

## Available Training Library
${courseLines}

Return JSON in this exact shape:
{
  "gaps": [{"competency_id":"COM-01","competency_name":"Written Communication","current_level":2,"required_level":4,"gap":2,"priority":"high"}],
  "goals": ["Goal one", "Goal two"],
  "timeline_days": 90,
  "recommended_course_ids": ["TRN001","TRN007"],
  "rationale": "Brief paragraph for HR review."
}`;
}

export { SYSTEM_PROMPT };
