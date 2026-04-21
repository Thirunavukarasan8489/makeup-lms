import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifySession } from "@/lib/session";
import type { UserRole } from "@/lib/types";

const protectedRoutes: { prefix: string; roles: UserRole[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/staff", roles: ["staff"] },
  { prefix: "/user", roles: ["user"] },
];

export async function proxy(request: NextRequest) {
  const match = protectedRoutes.find((route) =>
    request.nextUrl.pathname.startsWith(route.prefix),
  );

  if (!match) {
    return NextResponse.next();
  }

  const session = await verifySession(request.cookies.get(AUTH_COOKIE)?.value);

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!match.roles.includes(session.role)) {
    return NextResponse.redirect(new URL(`/${session.role}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/user/:path*"],
};
