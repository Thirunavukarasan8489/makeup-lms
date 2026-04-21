import { redirect } from "next/navigation";
import {
  DashboardPanel,
  DashboardShell,
  QuickActionCard,
  StatCard,
} from "@/components/DashboardShell";
import { getSession } from "@/lib/auth";
import { getEnrollments, getEnquiries } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function UserDashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const [enrollments, enquiries] = await Promise.all([
    getEnrollments(user.id),
    getEnquiries(user.id),
  ]);
  const completed = enrollments.filter((enrollment) => enrollment.isCompleted).length;

  return (
    <DashboardShell user={user} title="Student Dashboard">
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Courses"
          value={enrollments.length}
          detail="Enrolled programs"
          icon="courses"
          tone="rose"
        />
        <StatCard
          label="Completed"
          value={completed}
          detail="Finished courses"
          icon="check"
          tone="teal"
        />
        <StatCard
          label="Enquiries"
          value={enquiries.length}
          detail="Feedback and issues"
          icon="enquiry"
          tone="amber"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <DashboardPanel title="Learning Progress">
          <div className="soft-grid rounded-lg border border-stone-200 bg-[#fbf7f4] p-5">
            <p className="max-w-2xl text-sm leading-6 text-stone-700">
              Continue your makeup learning path, track course completion, and
              collect certificates as your skills grow.
            </p>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-rose-600 transition-all duration-700"
                style={{
                  width:
                    enrollments.length > 0
                      ? `${Math.round((completed / enrollments.length) * 100)}%`
                      : "0%",
                }}
              />
            </div>
            <p className="mt-3 text-xs font-semibold uppercase text-stone-500">
              {enrollments.length > 0
                ? `${completed} of ${enrollments.length} courses completed`
                : "Enroll in a course to start tracking progress"}
            </p>
          </div>
        </DashboardPanel>

        <DashboardPanel title="Next Step">
          <div className="rounded-lg border border-stone-200 p-5">
            <p className="text-sm font-semibold text-stone-950">
              Build your portfolio-ready skills
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Explore courses, complete lessons, then download certificates from
              your certificate area when courses are complete.
            </p>
          </div>
        </DashboardPanel>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <QuickActionCard
          href="/user/courses"
          title="Browse courses"
          detail="Enroll in makeup lessons and continue learning."
          icon="courses"
          tone="rose"
        />
        <QuickActionCard
          href="/user/certificate"
          title="View certificates"
          detail="Access completion certificates when available."
          icon="certificate"
          tone="teal"
        />
        <QuickActionCard
          href="/user/enquiry"
          title="Send feedback"
          detail="Ask a question or share an issue with the team."
          icon="enquiry"
          tone="amber"
        />
      </section>
    </DashboardShell>
  );
}
