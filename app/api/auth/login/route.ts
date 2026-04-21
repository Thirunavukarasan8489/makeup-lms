import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, signSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { jsonError } from "@/lib/api";
import { isJsonRequest, readRequestBody } from "@/lib/request";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const wantsJson = isJsonRequest(request);
    const body = await readRequestBody(request);
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      if (!wantsJson) {
        return NextResponse.redirect(new URL("/login?error=missing", request.url), 303);
      }
      return jsonError("Email and password are required");
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      if (!wantsJson) {
        return NextResponse.redirect(new URL("/login?error=invalid", request.url), 303);
      }
      return jsonError("Invalid email or password", 401);
    }

    const sessionUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const token = await signSession(sessionUser);
    const redirectTo = `/${sessionUser.role}/dashboard`;

    const response = wantsJson
      ? NextResponse.json({ user: sessionUser, redirectTo })
      : NextResponse.redirect(
          new URL(redirectTo, request.url),
          303,
        );
    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Login failed", 500);
  }
}
