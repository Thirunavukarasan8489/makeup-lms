import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireRole(roles: UserRole[]) {
  const session = await getSession();

  if (!session) {
    return { error: jsonError("Authentication required", 401), session: null };
  }

  if (!roles.includes(session.role)) {
    return { error: jsonError("You do not have permission", 403), session };
  }

  return { error: null, session };
}
