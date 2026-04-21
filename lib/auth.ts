import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { AUTH_COOKIE, verifySession } from "@/lib/session";
import type { UserRole } from "@/lib/types";

export { AUTH_COOKIE, signSession, verifySession } from "@/lib/session";

export async function getSession() {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(AUTH_COOKIE)?.value);
}

export async function getRequestSession(request: NextRequest) {
  return verifySession(request.cookies.get(AUTH_COOKIE)?.value);
}

export function canAccess(role: UserRole | undefined, allowed: UserRole[]) {
  return Boolean(role && allowed.includes(role));
}
