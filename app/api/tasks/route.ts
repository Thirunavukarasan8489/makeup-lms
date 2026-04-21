import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { jsonError, requireRole } from "@/lib/api";
import Task from "@/models/Task";
import type { TaskType } from "@/lib/types";

const taskTypes: TaskType[] = ["course", "client_work"];

export async function GET() {
  const guard = await requireRole(["admin", "staff"]);
  if (guard.error) return guard.error;

  await connectDB();
  const filter = guard.session?.role === "staff" ? { assignedTo: guard.session.id } : {};
  const tasks = await Task.find(filter)
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 });

  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  const guard = await requireRole(["admin"]);
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const type = taskTypes.includes(body.type) ? body.type : "course";

    if (!title || !description || !body.assignedTo) {
      return jsonError("Title, description, and assigned staff are required");
    }

    await connectDB();
    const task = await Task.create({
      title,
      description,
      type,
      assignedTo: body.assignedTo,
      status: body.status ?? "pending",
      createdBy: guard.session?.id,
    });
    const populatedTask = await Task.findById(task._id).populate(
      "assignedTo",
      "name email",
    );

    return NextResponse.json({ task: populatedTask }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not create task", 500);
  }
}
