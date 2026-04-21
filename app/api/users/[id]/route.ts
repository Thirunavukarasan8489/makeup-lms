import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { jsonError, requireRole } from "@/lib/api";
import User from "@/models/User";
import type { UserRole } from "@/lib/types";

const roles: UserRole[] = ["admin", "staff", "user"];

function getId(request: NextRequest) {
  return request.nextUrl.pathname.split("/").at(-1);
}

export async function PUT(request: NextRequest) {
  const guard = await requireRole(["admin"]);
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const id = getId(request);
    const updates: Record<string, unknown> = {};

    for (const field of ["name", "email", "phone", "profileImage"] as const) {
      if (body[field] !== undefined) updates[field] = String(body[field]).trim();
    }

    if (roles.includes(body.role)) updates.role = body.role;
    if (body.password) updates.password = await bcrypt.hash(String(body.password), 12);

    await connectDB();
    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return jsonError("User not found", 404);
    return NextResponse.json({ user });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not update user", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const guard = await requireRole(["admin"]);
  if (guard.error) return guard.error;

  await connectDB();
  const user = await User.findByIdAndDelete(getId(request)).select("-password");
  if (!user) return jsonError("User not found", 404);
  return NextResponse.json({ user });
}
