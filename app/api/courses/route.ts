import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { jsonError, requireRole } from "@/lib/api";
import Course from "@/models/Course";

export async function GET() {
  const guard = await requireRole(["admin", "staff", "user"]);
  if (guard.error) return guard.error;

  await connectDB();
  const courses = await Course.find()
    .populate("assignedStaff", "name email")
    .sort({ createdAt: -1 });
  return NextResponse.json({ courses });
}

export async function POST(request: NextRequest) {
  const guard = await requireRole(["admin"]);
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();

    if (!title || !description) {
      return jsonError("Course title and description are required");
    }

    await connectDB();
    const course = await Course.create({
      title,
      description,
      videos: Array.isArray(body.videos) ? body.videos : [],
      assignedStaff: body.assignedStaff || undefined,
      createdBy: guard.session?.id,
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not create course", 500);
  }
}
