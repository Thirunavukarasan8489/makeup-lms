"use client";

import { FormEvent, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { DashboardPanel, StatCard } from "@/components/DashboardShell";
import type { TaskStatus, TaskType } from "@/lib/types";

export type StaffTaskItem = {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
};

function statusLabel(status: TaskStatus) {
  return status.replace("_", " ");
}

function typeLabel(type: TaskType) {
  return type === "client_work" ? "Client makeup work" : "Teaching course";
}

export function StaffTaskManager({
  initialTasks,
  showStats = false,
  limit,
}: {
  initialTasks: StaffTaskItem[];
  showStats?: boolean;
  limit?: number;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const visibleTasks = typeof limit === "number" ? tasks.slice(0, limit) : tasks;
  const completed = useMemo(
    () => tasks.filter((task) => task.status === "completed").length,
    [tasks],
  );

  async function updateStatus(event: FormEvent<HTMLFormElement>, taskId: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextStatus = form.get("status") as TaskStatus;

    const response = await fetch(`/api/tasks/${taskId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      toast.error(data?.error ?? "Could not update status.");
      return;
    }

    toast.success("Status updated");
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, status: nextStatus } : task,
      ),
    );
  }

  return (
    <section className="grid gap-5">
      {showStats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Assigned Tasks"
              value={tasks.length}
              detail="Total work assigned"
              icon="tasks"
              tone="rose"
            />
            <StatCard
              label="Completed"
              value={completed}
              detail="Finished tasks"
              icon="check"
              tone="teal"
            />
            <StatCard
              label="Open"
              value={tasks.length - completed}
              detail="Pending or active"
              icon="spark"
              tone="amber"
            />
          </div>
          <DashboardPanel title="Work Queue">
            <div className="soft-grid rounded-lg border border-stone-200 bg-[#fbf7f4] p-5">
              <p className="text-sm leading-6 text-stone-700">
                Update each assignment as it moves through your workflow. Your
                task totals and cards refresh immediately after you save a new
                status.
              </p>
            </div>
          </DashboardPanel>
        </>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {visibleTasks.map((task) => (
          <article
            key={task.id}
            className="dashboard-card rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold">{task.title}</h2>
              <span className="text-sm font-semibold uppercase text-rose-700">
                {statusLabel(task.status)}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {task.description}
            </p>
            <p className="mt-3 text-sm text-stone-500">
              Type: {typeLabel(task.type)}
            </p>
            <form
              onSubmit={(event) => updateStatus(event, task.id)}
              className="mt-4 flex flex-wrap gap-2"
            >
              <select
                name="status"
                value={task.status}
                onChange={(event) => {
                  const nextStatus = event.target.value as TaskStatus;
                  setTasks((current) =>
                    current.map((item) =>
                      item.id === task.id ? { ...item, status: nextStatus } : item,
                    ),
                  );
                }}
                className="h-10 rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-rose-500"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <button className="h-10 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white hover:bg-rose-700">
                Update
              </button>
            </form>
          </article>
        ))}
        {visibleTasks.length === 0 ? (
          <p className="rounded-lg border border-stone-200 bg-white p-5 text-stone-600 shadow-sm">
            No tasks assigned yet.
          </p>
        ) : null}
      </div>
    </section>
  );
}
