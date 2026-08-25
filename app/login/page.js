import { redirect } from "next/navigation";
import LoginPage from "../../components/LoginPage.js";
import { getSession } from "../../lib/auth.js";
import { EMPLOYEES } from "../../lib/constants.js";

export default async function Login() {
  const session = await getSession();
  if (session?.role === "hr_admin") redirect("/hr/dashboard");
  if (session?.role === "employee") redirect("/");
  return <LoginPage employees={EMPLOYEES} />;
}
