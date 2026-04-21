import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { TaskStatusForm } from "@/components/TaskStatusForm";
import { getSession } from "@/lib/auth";
import { getTasks } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function StaffTasksPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const tasks = await getTasks(user.id);

  return (
    <DashboardShell user={user} title="My Tasks">
      <section className="grid gap-3 md:grid-cols-2">
        {tasks.map((task) => (
          <article key={String(task._id)} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold">{String(task.title)}</h2>
              <span className="text-sm font-semibold uppercase text-rose-700">{String(task.status)}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-600">{String(task.description)}</p>
            <p className="mt-3 text-sm text-stone-500">Type: {String(task.type)}</p>
            <TaskStatusForm taskId={String(task._id)} currentStatus={String(task.status)} />
          </article>
        ))}
        {tasks.length === 0 ? (
          <p className="rounded-lg border border-stone-200 bg-white p-5 text-stone-600 shadow-sm">
            No tasks assigned yet.
          </p>
        ) : null}
      </section>
    </DashboardShell>
  );
}
