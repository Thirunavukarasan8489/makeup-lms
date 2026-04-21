import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import {
  StaffTaskManager,
  type StaffTaskItem,
} from "@/components/StaffTaskManager";
import { getSession } from "@/lib/auth";
import { getTasks } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function StaffTasksPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const tasks = await getTasks(user.id);

  const taskItems: StaffTaskItem[] = tasks.map((task) => ({
    id: String(task._id),
    title: String(task.title),
    description: String(task.description),
    type: task.type === "client_work" ? "client_work" : "course",
    status:
      task.status === "in_progress" || task.status === "completed"
        ? task.status
        : "pending",
  }));

  return (
    <DashboardShell user={user} title="My Tasks">
      <StaffTaskManager initialTasks={taskItems} />
    </DashboardShell>
  );
}
