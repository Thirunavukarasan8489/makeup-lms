import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { jsonError, requireRole } from "@/lib/api";
import User from "@/models/User";
import type { UserRole } from "@/lib/types";

const roles: UserRole[] = ["admin", "staff", "user"];

export async function GET() {
  const guard = await requireRole(["admin"]);
  if (guard.error) return guard.error;

  await connectDB();
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const guard = await requireRole(["admin"]);
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const role = roles.includes(body.role) ? body.role : "user";

    if (!name || !email || password.length < 6) {
      return jsonError("Name, email, and a 6+ character password are required");
    }

    await connectDB();
    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role,
      phone: body.phone ?? "",
      profileImage: body.profileImage ?? "",
    });

    const created = await User.findById(user._id).select("-password");
    return NextResponse.json({ user: created }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not create user", 500);
  }
}
