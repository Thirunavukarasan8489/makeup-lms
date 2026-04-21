import { redirect } from "next/navigation";
import {
  AdminTaskManager,
  type AdminTask,
  type StaffOption,
} from "@/components/AdminTaskManager";
import { DashboardShell } from "@/components/DashboardShell";
import { getSession } from "@/lib/auth";
import { getTasks, getUsers } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminTasksPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const [tasks, staff] = await Promise.all([getTasks(), getUsers("staff")]);

  const staffOptions: StaffOption[] = staff.map((member) => ({
    id: String(member._id),
    name: String(member.name),
    email: String(member.email),
  }));

  const taskItems: AdminTask[] = tasks.map((task) => {
    const assigned =
      typeof task.assignedTo === "object" && task.assignedTo
        ? {
            id: String(task.assignedTo._id),
            name: String(task.assignedTo.name),
            email: String(task.assignedTo.email),
          }
        : null;

    const type: AdminTask["type"] =
      task.type === "client_work" ? "client_work" : "course";
    const status: AdminTask["status"] =
      task.status === "in_progress" || task.status === "completed"
        ? task.status
        : "pending";

    return {
      id: String(task._id),
      title: String(task.title),
      description: String(task.description),
      type,
      status,
      assignedTo: assigned,
    };
  });

  return (
    <DashboardShell user={user} title="Task Management">
      <AdminTaskManager initialTasks={taskItems} staff={staffOptions} />
    </DashboardShell>
  );
}
