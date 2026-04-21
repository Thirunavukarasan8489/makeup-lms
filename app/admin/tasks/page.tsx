import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { EndpointForm, TextArea, TextInput } from "@/components/Forms";
import { TaskStatusForm } from "@/components/TaskStatusForm";
import { getSession } from "@/lib/auth";
import { getTasks } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminTasksPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const tasks = await getTasks();

  return (
    <DashboardShell user={user} title="Task Management">
      <section className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <EndpointForm endpoint="/api/tasks" button="Assign task">
          <h2 className="text-xl font-bold">Assign Staff Task</h2>
          <TextInput name="title" label="Title" required />
          <TextArea name="description" label="Description" required />
          <TextInput name="assignedTo" label="Assigned staff ID" required />
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Type
            <select name="type" className="h-10 rounded-md border border-stone-300 px-3">
              <option value="course">Teaching course</option>
              <option value="client_work">Client makeup work</option>
            </select>
          </label>
        </EndpointForm>
        <div className="grid gap-3">
          {tasks.map((task) => (
            <article key={String(task._id)} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-bold">{String(task.title)}</h2>
                <span className="text-sm font-semibold uppercase text-rose-700">{String(task.status)}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-stone-600">{String(task.description)}</p>
              <TaskStatusForm taskId={String(task._id)} currentStatus={String(task.status)} />
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
