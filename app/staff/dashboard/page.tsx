import { redirect } from "next/navigation";
import { DashboardShell, StatCard } from "@/components/DashboardShell";
import { TaskStatusForm } from "@/components/TaskStatusForm";
import { getSession } from "@/lib/auth";
import { getTasks } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function StaffDashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const tasks = await getTasks(user.id);
  const completed = tasks.filter((task) => task.status === "completed").length;

  return (
    <DashboardShell user={user} title="Staff Dashboard">
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Assigned Tasks" value={tasks.length} detail="Total work assigned" />
        <StatCard label="Completed" value={completed} detail="Finished tasks" />
        <StatCard label="Open" value={tasks.length - completed} detail="Pending or active" />
      </section>
      <section className="grid gap-3">
        {tasks.slice(0, 4).map((task) => (
          <article key={String(task._id)} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">{String(task.title)}</h2>
            <p className="mt-2 text-sm text-stone-600">{String(task.description)}</p>
            <TaskStatusForm taskId={String(task._id)} currentStatus={String(task.status)} />
          </article>
        ))}
      </section>
    </DashboardShell>
  );
}
