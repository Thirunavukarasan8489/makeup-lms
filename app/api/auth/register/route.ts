import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, signSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { jsonError } from "@/lib/api";
import { isJsonRequest, readRequestBody } from "@/lib/request";
import User from "@/models/User";
import type { UserRole } from "@/lib/types";

const roles: UserRole[] = ["admin", "staff", "user"];

export async function POST(request: NextRequest) {
  try {
    const wantsJson = isJsonRequest(request);
    const body = await readRequestBody(request);
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const role = roles.includes(body.role) ? body.role : "user";

    if (!name || !email || password.length < 6) {
      if (!wantsJson) {
        return NextResponse.redirect(new URL("/register?error=invalid", request.url), 303);
      }
      return jsonError("Name, email, and a 6+ character password are required");
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      if (!wantsJson) {
        return NextResponse.redirect(new URL("/register?error=exists", request.url), 303);
      }
      return jsonError("An account with this email already exists", 409);
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role,
      phone: body.phone ?? "",
      profileImage: body.profileImage ?? "",
    });

    const sessionUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const token = await signSession(sessionUser);
    const redirectTo = `/${sessionUser.role}/dashboard`;

    const response = wantsJson
      ? NextResponse.json({ user: sessionUser, redirectTo }, { status: 201 })
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
    return jsonError(error instanceof Error ? error.message : "Registration failed", 500);
  }
}
