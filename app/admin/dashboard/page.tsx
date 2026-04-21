import { redirect } from "next/navigation";
import { DashboardShell, StatCard } from "@/components/DashboardShell";
import { getSession } from "@/lib/auth";
import { getAdminCounts } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const counts = await getAdminCounts();

  return (
    <DashboardShell user={user} title="Admin Dashboard">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value={counts.users} detail="Registered learners" />
        <StatCard label="Staff" value={counts.staff} detail="Team members" />
        <StatCard label="Courses" value={counts.courses} detail="Published course records" />
        <StatCard label="Tasks" value={counts.tasks} detail="Assigned operations" />
      </section>
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Operations Overview</h2>
        <p className="mt-2 text-stone-600">
          Manage users, staff, courses, task assignments, and incoming feedback
          from the navigation above.
        </p>
      </section>
    </DashboardShell>
  );
}
