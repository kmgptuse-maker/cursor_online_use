import { redirect } from "next/navigation";
import AppShell from "../../../components/AppShell.js";
import { getSession } from "../../../lib/auth.js";
import { COURSES } from "../../../lib/constants.js";
import { getAiConfigStatus } from "../../../lib/ai/index.js";

export default async function TrainingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "hr_admin") redirect("/");
  const ai = getAiConfigStatus();

  return (
    <AppShell session={session} ai={ai}>
      <div className="panel">
        <h2>Training Library</h2>
        <p className="intro">{COURSES.length} courses available for AI matching.</p>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Format</th>
                <th>Duration</th>
                <th>Next Session</th>
              </tr>
            </thead>
            <tbody>
              {COURSES.map((c) => (
                <tr key={c.course_id}>
                  <td>{c.course_id}</td>
                  <td>{c.title}</td>
                  <td>{c.category}</td>
                  <td>{c.format}</td>
                  <td>{c.duration_hours}h</td>
                  <td>{c.next_session_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
