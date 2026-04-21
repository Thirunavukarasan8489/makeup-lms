import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { jsonError, requireRole } from "@/lib/api";
import Task from "@/models/Task";
import type { TaskStatus } from "@/lib/types";

const statuses: TaskStatus[] = ["pending", "in_progress", "completed"];

function getId(request: NextRequest) {
  const parts = request.nextUrl.pathname.split("/");
  return parts.at(-2);
}

export async function PUT(request: NextRequest) {
  const guard = await requireRole(["admin", "staff"]);
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const status = statuses.includes(body.status) ? body.status : undefined;
    if (!status) return jsonError("A valid task status is required");

    await connectDB();
    const filter =
      guard.session?.role === "staff"
        ? { _id: getId(request), assignedTo: guard.session.id }
        : { _id: getId(request) };
    const task = await Task.findOneAndUpdate(
      filter,
      { status },
      { new: true, runValidators: true },
    );

    if (!task) return jsonError("Task not found", 404);
    return NextResponse.json({ task });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not update task", 500);
  }
}
