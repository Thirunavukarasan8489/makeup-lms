import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { jsonError, requireRole } from "@/lib/api";
import Task from "@/models/Task";
import type { TaskStatus, TaskType } from "@/lib/types";

const taskTypes: TaskType[] = ["course", "client_work"];
const statuses: TaskStatus[] = ["pending", "in_progress", "completed"];

function getId(request: NextRequest) {
  return request.nextUrl.pathname.split("/").at(-1);
}

export async function PUT(request: NextRequest) {
  const guard = await requireRole(["admin"]);
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};
    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();

    if (title) updates.title = title;
    if (description) updates.description = description;
    if (taskTypes.includes(body.type)) updates.type = body.type;
    if (statuses.includes(body.status)) updates.status = body.status;
    if (body.assignedTo) updates.assignedTo = body.assignedTo;

    if (Object.keys(updates).length === 0) {
      return jsonError("At least one task field is required");
    }

    await connectDB();
    const task = await Task.findByIdAndUpdate(getId(request), updates, {
      new: true,
      runValidators: true,
    }).populate("assignedTo", "name email");

    if (!task) return jsonError("Task not found", 404);
    return NextResponse.json({ task });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not update task", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const guard = await requireRole(["admin"]);
  if (guard.error) return guard.error;

  await connectDB();
  const task = await Task.findByIdAndDelete(getId(request));
  if (!task) return jsonError("Task not found", 404);
  return NextResponse.json({ task });
}
