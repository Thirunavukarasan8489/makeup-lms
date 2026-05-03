import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { EnrollButton } from "@/components/EnrollButton";
import { StudentVideoPlayer } from "@/components/StudentVideoPlayer";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";

export const dynamic = "force-dynamic";

type CourseVideo = {
  _id?: { toString(): string };
  title?: string;
  description?: string;
  publicId?: string;
  key?: string;
};

type CourseRecord = {
  _id: { toString(): string };
  title?: string;
  description?: string;
  videos?: CourseVideo[];
};

type EnrollmentRecord = {
  progress?: number;
};

export default async function UserCourseWatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login");

  const { id } = await params;
  await connectDB();
  const [course, enrollment] = await Promise.all([
    Course.findById(id).select("title description videos").lean() as Promise<CourseRecord | null>,
    Enrollment.findOne({ userId: user.id, courseId: id }).lean() as Promise<EnrollmentRecord | null>,
  ]);

  if (!course) redirect("/user/courses");

  const videos = Array.isArray(course.videos) ? (course.videos as CourseVideo[]) : [];
  const lessons = videos
    .filter((video) => video._id && (video.publicId || video.key))
    .map((video) => ({
      id: String(video._id?.toString()),
      title: String(video.title ?? "Lesson"),
      description: String(video.description ?? ""),
    }));

  return (
    <DashboardShell user={user} title={String(course.title)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/user/courses" className="text-sm font-semibold text-rose-700 hover:text-rose-800">
            Back to courses
          </Link>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
            {String(course.description)}
          </p>
        </div>
        {!enrollment ? <EnrollButton courseId={String(course._id)} enrolled={false} /> : null}
      </div>

      {enrollment ? (
        <StudentVideoPlayer
          courseId={String(course._id)}
          lessons={lessons}
          initialProgress={Number(enrollment.progress ?? 0)}
        />
      ) : (
        <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-stone-950">Enroll to watch</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            This course player is protected. Enroll first to unlock the lessons.
          </p>
        </section>
      )}
    </DashboardShell>
  );
}
