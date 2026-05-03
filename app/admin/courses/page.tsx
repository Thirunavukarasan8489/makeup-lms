import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { EndpointForm, TextArea, TextInput } from "@/components/Forms";
import { getSession } from "@/lib/auth";
import { getCourses } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const courses = await getCourses();

  return (
    <DashboardShell user={user} title="Course Management">
      <section className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <EndpointForm endpoint="/api/courses" button="Create course">
          <h2 className="text-xl font-bold">New Course</h2>
          <TextInput name="title" label="Title" required />
          <TextArea name="description" label="Description" required />
          <TextInput name="assignedStaff" label="Assigned staff ID" />
        </EndpointForm>
        <div className="grid gap-3">
          {courses.map((course) => (
            <article key={String(course._id)} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold">{String(course.title)}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">{String(course.description)}</p>
              <p className="mt-3 text-sm font-medium text-stone-500">
                Videos: {Array.isArray(course.videos) ? course.videos.length : 0}
              </p>
              {Array.isArray(course.videos) && course.videos.length > 0 ? (
                <div className="mt-4 grid gap-2">
                  {course.videos.map((video) => (
                    <div key={String(video._id ?? video.url)} className="rounded-md bg-[#fbf7f4] px-3 py-2">
                      <p className="text-sm font-semibold text-stone-950">{String(video.title)}</p>
                      {video.description ? (
                        <p className="mt-1 text-xs leading-5 text-stone-600">{String(video.description)}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
