import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api";
import Enrollment from "@/models/Enrollment";

export async function GET() {
  const guard = await requireRole(["admin", "user"]);
  if (guard.error) return guard.error;

  await connectDB();
  const filter = guard.session?.role === "user" ? { userId: guard.session.id } : {};
  const enrollments = await Enrollment.find(filter)
    .populate("userId", "name email")
    .populate("courseId", "title description videos")
    .sort({ updatedAt: -1 });

  return NextResponse.json({ enrollments });
}
