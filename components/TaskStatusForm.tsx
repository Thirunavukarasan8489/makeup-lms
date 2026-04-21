"use client";

import { FormEvent } from "react";
import { toast } from "react-toastify";

export function TaskStatusForm({
  taskId,
  currentStatus,
}: {
  taskId: string;
  currentStatus: string;
}) {
  async function updateStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/tasks/${taskId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: form.get("status") }),
    });

    if (response.ok) {
      toast.success("Status updated");
      return;
    }

    const data = await response.json().catch(() => null);
    toast.error(data?.error ?? "Could not update status.");
  }

  return (
    <form onSubmit={updateStatus} className="mt-4 flex flex-wrap gap-2">
      <select
        name="status"
        defaultValue={currentStatus}
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
  );
}
