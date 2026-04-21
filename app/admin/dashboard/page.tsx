import { redirect } from "next/navigation";
import {
  DashboardPanel,
  DashboardShell,
  QuickActionCard,
  StatCard,
} from "@/components/DashboardShell";
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
        <StatCard
          label="Students"
          value={counts.users}
          detail="Registered learners"
          icon="users"
          tone="rose"
        />
        <StatCard
          label="Staff"
          value={counts.staff}
          detail="Team members"
          icon="staff"
          tone="teal"
        />
        <StatCard
          label="Courses"
          value={counts.courses}
          detail="Published course records"
          icon="courses"
          tone="amber"
        />
        <StatCard
          label="Tasks"
          value={counts.tasks}
          detail="Assigned operations"
          icon="tasks"
          tone="stone"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <DashboardPanel title="Operations Overview">
          <div className="soft-grid rounded-lg border border-stone-200 bg-[#fbf7f4] p-5">
            <p className="max-w-2xl text-sm leading-6 text-stone-700">
              Keep the makeup academy moving from one command center. Create
              learners, organize staff, publish courses, and assign client or
              teaching work with live task status.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-stone-950">People</p>
                <p className="mt-1 text-xs leading-5 text-stone-600">
                  Manage students, staff, and admin access.
                </p>
              </div>
              <div className="rounded-md bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-stone-950">Learning</p>
                <p className="mt-1 text-xs leading-5 text-stone-600">
                  Build course records for training workflows.
                </p>
              </div>
              <div className="rounded-md bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-stone-950">Work</p>
                <p className="mt-1 text-xs leading-5 text-stone-600">
                  Assign tasks and track completion quickly.
                </p>
              </div>
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel title="Today Focus">
          <div className="space-y-3">
            <div className="rounded-md border border-stone-200 p-4">
              <p className="text-sm font-semibold text-stone-950">
                Open enquiries
              </p>
              <p className="mt-1 text-2xl font-bold text-rose-700">
                {counts.enquiries}
              </p>
            </div>
            <div className="rounded-md border border-stone-200 p-4">
              <p className="text-sm font-semibold text-stone-950">
                Active operations
              </p>
              <p className="mt-1 text-2xl font-bold text-teal-700">
                {counts.tasks}
              </p>
            </div>
          </div>
        </DashboardPanel>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <QuickActionCard
          href="/admin/users"
          title="Add or edit users"
          detail="Create students, staff, and admin accounts."
          icon="users"
          tone="rose"
        />
        <QuickActionCard
          href="/admin/staff"
          title="Review staff"
          detail="See staff accounts and team coverage."
          icon="staff"
          tone="teal"
        />
        <QuickActionCard
          href="/admin/courses"
          title="Manage courses"
          detail="Prepare course content for learners."
          icon="courses"
          tone="amber"
        />
        <QuickActionCard
          href="/admin/tasks"
          title="Assign work"
          detail="Create and update staff task assignments."
          icon="tasks"
          tone="stone"
        />
      </section>
    </DashboardShell>
  );
}
