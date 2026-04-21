import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { jsonError, requireRole } from "@/lib/api";
import Course from "@/models/Course";

function getId(request: NextRequest) {
  return request.nextUrl.pathname.split("/").at(-1);
}

export async function GET(request: NextRequest) {
  const guard = await requireRole(["admin", "staff", "user"]);
  if (guard.error) return guard.error;

  await connectDB();
  const course = await Course.findById(getId(request)).populate(
    "assignedStaff",
    "name email",
  );
  if (!course) return jsonError("Course not found", 404);
  return NextResponse.json({ course });
}
