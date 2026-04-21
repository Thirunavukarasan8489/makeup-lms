import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { EnrollButton } from "@/components/EnrollButton";
import { getSession } from "@/lib/auth";
import { getCourses, getEnrollments } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function UserCoursesPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const [courses, enrollments] = await Promise.all([
    getCourses(),
    getEnrollments(user.id),
  ]);
  const enrolledCourseIds = new Set(
    enrollments.map((enrollment) => String(enrollment.courseId?._id ?? enrollment.courseId)),
  );

  return (
    <DashboardShell user={user} title="Courses">
      <section className="grid gap-3 md:grid-cols-2">
        {courses.map((course) => (
          <article key={String(course._id)} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">{String(course.title)}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">{String(course.description)}</p>
            <p className="mt-3 text-sm font-medium text-stone-500">
              Lessons: {Array.isArray(course.videos) ? course.videos.length : 0}
            </p>
            <EnrollButton
              courseId={String(course._id)}
              enrolled={enrolledCourseIds.has(String(course._id))}
            />
          </article>
        ))}
        {courses.length === 0 ? (
          <p className="rounded-lg border border-stone-200 bg-white p-5 text-stone-600 shadow-sm">
            No courses available yet.
          </p>
        ) : null}
      </section>
    </DashboardShell>
  );
}
