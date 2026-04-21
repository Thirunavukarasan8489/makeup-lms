import { redirect } from "next/navigation";
import { DashboardShell, StatCard } from "@/components/DashboardShell";
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
        <StatCard label="Courses" value={enrollments.length} detail="Enrolled programs" />
        <StatCard label="Completed" value={completed} detail="Finished courses" />
        <StatCard label="Enquiries" value={enquiries.length} detail="Feedback and issues" />
      </section>
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Learning Progress</h2>
        <p className="mt-2 text-stone-600">
          Continue watching lessons, complete your courses, then download your
          certificate from the certificate page.
        </p>
      </section>
    </DashboardShell>
  );
}
