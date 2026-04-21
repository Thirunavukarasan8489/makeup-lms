import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { jsonError, requireRole } from "@/lib/api";
import Enrollment from "@/models/Enrollment";

export async function POST(request: NextRequest) {
  const guard = await requireRole(["admin", "user"]);
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const courseId = String(body.courseId ?? "");
    const userId = guard.session?.role === "admin" && body.userId ? body.userId : guard.session?.id;

    if (!courseId || !userId) return jsonError("Course and user are required");

    await connectDB();
    const enrollment = await Enrollment.findOneAndUpdate(
      { userId, courseId },
      { userId, courseId, progress: body.progress ?? 0 },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not enroll", 500);
  }
}
