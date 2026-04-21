"use client";

import { FormEvent, useState } from "react";
import { toast } from "react-toastify";

export type StaffOption = {
  id: string;
  name: string;
  email: string;
};

export type AdminTask = {
  id: string;
  title: string;
  description: string;
  type: "course" | "client_work";
  status: "pending" | "in_progress" | "completed";
  assignedTo: StaffOption | null;
};

type TaskPayload = {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  type?: AdminTask["type"];
  status?: AdminTask["status"];
  assignedTo?: {
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
  };
};

function normalizeTask(task: TaskPayload, staff: StaffOption[]): AdminTask {
  const assignedId = String(task.assignedTo?._id ?? task.assignedTo?.id ?? "");
  const assignedStaff =
    staff.find((member) => member.id === assignedId) ??
    (assignedId
      ? {
          id: assignedId,
          name: String(task.assignedTo?.name ?? "Staff member"),
          email: String(task.assignedTo?.email ?? ""),
        }
      : null);

  return {
    id: String(task._id ?? task.id ?? ""),
    title: String(task.title ?? ""),
    description: String(task.description ?? ""),
    type: task.type === "client_work" ? "client_work" : "course",
    status:
      task.status === "in_progress" || task.status === "completed"
        ? task.status
        : "pending",
    assignedTo: assignedStaff,
  };
}

function typeLabel(type: AdminTask["type"]) {
  return type === "client_work" ? "Client makeup work" : "Teaching course";
}

function statusLabel(status: AdminTask["status"]) {
  return status.replace("_", " ");
}

export function AdminTaskManager({
  initialTasks,
  staff,
}: {
  initialTasks: AdminTask[];
  staff: StaffOption[];
}) {
  const [activeTab, setActiveTab] = useState<"assign" | "list">("assign");
  const [tasks, setTasks] = useState(initialTasks);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function assignTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const payload = Object.fromEntries(new FormData(formElement));

    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      toast.error(data?.error ?? "Could not assign task");
      return;
    }

    toast.success("Task assigned successfully");
    formElement.reset();
    setTasks((current) => [normalizeTask(data.task, staff), ...current]);
    setActiveTab("list");
  }

  async function updateTask(event: FormEvent<HTMLFormElement>, taskId: string) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      toast.error(data?.error ?? "Could not update task");
      return;
    }

    toast.success("Task updated successfully");
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? normalizeTask(data.task, staff) : task,
      ),
    );
    setEditingId(null);
  }

  async function deleteTask(taskId: string) {
    const confirmed = window.confirm("Delete this task permanently?");
    if (!confirmed) return;

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      toast.error(data?.error ?? "Could not delete task");
      return;
    }

    toast.success("Task deleted");
    setTasks((current) => current.filter((task) => task.id !== taskId));
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap gap-2 rounded-lg border border-stone-200 bg-white p-2 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("assign")}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            activeTab === "assign"
              ? "bg-stone-950 text-white"
              : "text-stone-700 hover:bg-stone-100"
          }`}
        >
          Assign New Task
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("list")}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            activeTab === "list"
              ? "bg-stone-950 text-white"
              : "text-stone-700 hover:bg-stone-100"
          }`}
        >
          All Assigned Tasks
        </button>
      </div>

      {activeTab === "assign" ? (
        <form
          onSubmit={assignTask}
          className="grid max-w-xl gap-3 rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-xl font-bold">Assign Staff Task</h2>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Title
            <input
              name="title"
              required
              className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Description
            <textarea
              name="description"
              required
              rows={4}
              className="rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-rose-500"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Assign to staff
            <select
              name="assignedTo"
              required
              defaultValue=""
              className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
            >
              <option value="" disabled>
                Select staff member
              </option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Type
            <select
              name="type"
              className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
            >
              <option value="course">Teaching course</option>
              <option value="client_work">Client makeup work</option>
            </select>
          </label>
          <button className="h-10 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white hover:bg-rose-700">
            Assign task
          </button>
        </form>
      ) : (
        <div className="grid gap-3">
          {tasks.map((task) => (
            <article
              key={task.id}
              className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
            >
              {editingId === task.id ? (
                <form onSubmit={(event) => updateTask(event, task.id)} className="grid gap-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-bold">Edit Task</h2>
                    <span className="text-sm font-semibold uppercase text-rose-700">
                      {statusLabel(task.status)}
                    </span>
                  </div>
                  <label className="grid gap-2 text-sm font-medium text-stone-700">
                    Title
                    <input
                      name="title"
                      defaultValue={task.title}
                      required
                      className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-stone-700">
                    Description
                    <textarea
                      name="description"
                      defaultValue={task.description}
                      required
                      rows={4}
                      className="rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-rose-500"
                    />
                  </label>
                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="grid gap-2 text-sm font-medium text-stone-700">
                      Staff
                      <select
                        name="assignedTo"
                        defaultValue={task.assignedTo?.id ?? ""}
                        required
                        className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
                      >
                        {staff.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-stone-700">
                      Type
                      <select
                        name="type"
                        defaultValue={task.type}
                        className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
                      >
                        <option value="course">Teaching course</option>
                        <option value="client_work">Client makeup work</option>
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-stone-700">
                      Status
                      <select
                        name="status"
                        defaultValue={task.status}
                        className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="h-10 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white hover:bg-rose-700">
                      Save changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="h-10 rounded-md border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-700 hover:border-rose-300 hover:text-rose-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-bold">{task.title}</h2>
                    <span className="text-sm font-semibold uppercase text-rose-700">
                      {statusLabel(task.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {task.description}
                  </p>
                  <div className="mt-3 grid gap-1 text-sm font-medium text-stone-500">
                    <p>
                      Assigned to:{" "}
                      {task.assignedTo
                        ? `${task.assignedTo.name} (${task.assignedTo.email})`
                        : "Staff member"}
                    </p>
                    <p>Type: {typeLabel(task.type)}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(task.id)}
                      className="h-10 rounded-md border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-700 hover:border-rose-300 hover:text-rose-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className="h-10 rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
          {tasks.length === 0 ? (
            <p className="rounded-lg border border-stone-200 bg-white p-5 text-stone-600 shadow-sm">
              No tasks assigned yet.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
