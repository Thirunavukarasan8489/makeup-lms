import { redirect } from "next/navigation";
import { AdminVideoUploadManager } from "@/components/AdminVideoUploadManager";
import { DashboardShell } from "@/components/DashboardShell";
import { getSession } from "@/lib/auth";
import { getCourses } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminUploadPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const courses = await getCourses();
  const uploadCourses = courses.map((course) => ({
    _id: String(course._id),
    title: String(course.title),
    videos: Array.isArray(course.videos)
      ? course.videos.map((video) => ({
          _id: String(video._id ?? ""),
          title: String(video.title ?? ""),
          description: String(video.description ?? ""),
          key: String(video.key ?? ""),
          publicId: String(video.publicId ?? video.key ?? ""),
          url: String(video.url ?? ""),
          contentType: String(video.contentType ?? ""),
          size: Number(video.size ?? 0),
          uploadedAt: video.uploadedAt ? String(video.uploadedAt) : "",
        }))
      : [],
  }));

  return (
    <DashboardShell user={user} title="Video Upload">
      <AdminVideoUploadManager initialCourses={uploadCourses} />
    </DashboardShell>
  );
}
