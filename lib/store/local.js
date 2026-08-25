import fs from "fs";
import path from "path";
import { computeGaps, recommendCourseIds, buildGoals, buildRationale } from "../ai/rule-based-plan.js";
import { CYCLE_NAME, EMPLOYEES, getEmployee } from "../constants.js";

const STORE_PATH = path.join(process.cwd(), ".data", "store.json");
const SAMPLE_PATH = path.join(process.cwd(), "..", "data", "sample_assessments.json");

function defaultRecord() {
  return { assessment_status: "Not started", scores: {}, plan: null };
}

function buildPlanFromScores(employeeId, scores, status = "Pending HR Review", approved = false) {
  const emp = getEmployee(employeeId);
  if (!emp) return null;
  const gaps = computeGaps(scores, emp.job_role);
  const courseIds = recommendCourseIds(gaps);
  const goals = buildGoals(gaps);
  return {
    gaps,
    goals,
    timeline_days: 90,
    rationale: buildRationale(emp, gaps),
    recommended_courses: courseIds.map((id, i) => ({
      course_id: id,
      progress: approved && i === 0 ? "Completed" : approved && i === 1 ? "In progress" : "Not started",
    })),
    status: approved ? "Approved" : status,
    approved_at: approved ? "2026-06-15" : null,
    approved_by: approved ? "Mary Chen (HR)" : null,
    ai_provider: "seed",
    ai_model: null,
  };
}

function seedRecords() {
  const records = {};
  for (const emp of EMPLOYEES) {
    records[emp.employee_id] = defaultRecord();
  }
  let sampleAssessments = { assessments: [] };
  if (fs.existsSync(SAMPLE_PATH)) {
    sampleAssessments = JSON.parse(fs.readFileSync(SAMPLE_PATH, "utf8"));
  }
  sampleAssessments.assessments.forEach((a, i) => {
    const scores = Object.fromEntries(
      Object.entries(a.scores).map(([k, v]) => [k, Number(v)]),
    );
    if (a.status === "Submitted") {
      const approved = i < 2;
      records[a.employee_id] = {
        assessment_status: "Submitted",
        scores,
        plan: buildPlanFromScores(
          a.employee_id,
          scores,
          approved ? "Approved" : "Pending HR Review",
          approved,
        ),
      };
    } else {
      records[a.employee_id] = {
        assessment_status: "Draft",
        scores,
        plan: null,
      };
    }
  });
  return records;
}

function readStoreSync() {
  if (!fs.existsSync(STORE_PATH)) {
    const initial = { cycle_name: CYCLE_NAME, records: seedRecords() };
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
}

function writeStoreSync(store) {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

export async function getStore() {
  return readStoreSync();
}

export async function getRecord(employeeId) {
  const store = readStoreSync();
  if (!store.records[employeeId]) {
    store.records[employeeId] = defaultRecord();
    writeStoreSync(store);
  }
  return store.records[employeeId];
}

export async function updateRecord(employeeId, patch) {
  const store = readStoreSync();
  const current = store.records[employeeId] || defaultRecord();
  store.records[employeeId] = { ...current, ...patch };
  writeStoreSync(store);
  return store.records[employeeId];
}

export async function setPlan(employeeId, plan) {
  return updateRecord(employeeId, { plan });
}

export async function summaryStats() {
  const store = readStoreSync();
  let assessed = 0;
  let pending = 0;
  let approved = 0;
  for (const emp of EMPLOYEES) {
    const r = store.records[emp.employee_id] || defaultRecord();
    if (r.assessment_status === "Submitted") assessed += 1;
    if (r.plan?.status === "Pending HR Review") pending += 1;
    if (r.plan?.status === "Approved") approved += 1;
  }
  return { total: EMPLOYEES.length, assessed, pending, approved };
}

export async function resetStore() {
  const initial = { cycle_name: CYCLE_NAME, records: seedRecords() };
  writeStoreSync(initial);
  return initial;
}
