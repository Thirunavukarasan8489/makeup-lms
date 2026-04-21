import { SignJWT, jwtVerify } from "jose";
import type { SessionUser, UserRole } from "@/lib/types";

export const AUTH_COOKIE = "makeup_lms_session";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "development-secret-change-me",
);

export async function signSession(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(token?: string): Promise<SessionUser | null> {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: String(payload.id),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}
