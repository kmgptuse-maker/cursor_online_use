import { cookies } from "next/headers";

export const SESSION_COOKIE = "skillpath_session";

export async function getSession() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

export function sessionCookieHeader(session) {
  const value = encodeURIComponent(JSON.stringify(session));
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`;
}

export function clearSessionCookieHeader() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export async function requireSession(allowedRoles) {
  const session = await getSession();
  if (!session) {
    return { error: "Not logged in", status: 401, session: null };
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return { error: "Forbidden", status: 403, session };
  }
  return { error: null, status: 200, session };
}
