import framework from "./competency-framework.json";
import trainingLibrary from "./training-library.json";
import employees from "./employees.json";

export const COMPETENCIES = framework.competencies;
export const ROLE_REQUIREMENTS = framework.role_requirements;
export const COURSES = trainingLibrary.courses;
export const EMPLOYEES = employees;
export const SCALE_LABELS = {
  1: "Basic",
  2: "Developing",
  3: "Proficient",
  4: "Advanced",
  5: "Expert",
};
export const CYCLE_NAME = "Q2 2026 Assessment Cycle";

export function getEmployee(id) {
  return EMPLOYEES.find((e) => e.employee_id === id);
}

export function getCourse(id) {
  return COURSES.find((c) => c.course_id === id);
}

export function statusClass(status) {
  const map = {
    "Not started": "notstarted",
    Draft: "draft",
    Submitted: "submitted",
    "Not generated": "notstarted",
    "Pending HR Review": "pending",
    Approved: "approved",
    Rejected: "rejected",
    "In progress": "progress",
    Completed: "approved",
  };
  return `status status-${map[status] || "notstarted"}`;
}
