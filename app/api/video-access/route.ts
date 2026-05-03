import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireRole } from "@/lib/api";
import { getCloudinaryVideoUrls } from "@/lib/cloudinary";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";

type CourseVideo = {
  _id?: { toString(): string };
  title?: string;
  description?: string;
  key?: string;
  publicId?: string;
  url?: string;
  contentType?: string;
};

type CourseRecord = {
  _id: { toString(): string };
  title?: string;
  videos?: CourseVideo[];
};

export async function POST(request: NextRequest) {
  const guard = await requireRole(["user"]);
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const courseId = String(body.courseId ?? "").trim();
    const videoId = String(body.videoId ?? "").trim();

    if (!courseId || !videoId || !guard.session?.id) {
      return jsonError("Course and video are required");
    }

    await connectDB();
    const enrollment = await Enrollment.findOne({
      userId: guard.session.id,
      courseId,
    }).select("_id");

    if (!enrollment) {
      return jsonError("Enroll in this course before watching videos", 403);
    }

    const course = (await Course.findById(courseId)
      .select("title videos")
      .lean()) as CourseRecord | null;
    if (!course) return jsonError("Course not found", 404);

    const videos = Array.isArray(course.videos) ? (course.videos as CourseVideo[]) : [];
    const video = videos.find((item) => {
      const id = item._id?.toString();
      return id === videoId || item.publicId === videoId || item.key === videoId;
    });

    if (!video) return jsonError("Video not found", 404);

    const publicId = video.publicId || video.key;
    if (!publicId) return jsonError("Video is missing a Cloudinary public ID", 404);

    const urls = getCloudinaryVideoUrls(publicId);

    return NextResponse.json({
      course: {
        id: String(course._id),
        title: String(course.title),
      },
      video: {
        id: video._id?.toString() ?? publicId,
        title: video.title ?? "Lesson",
        description: video.description ?? "",
        contentType: video.contentType ?? "application/x-mpegURL",
      },
      stream: urls,
      watermark: {
        name: guard.session.name,
        email: guard.session.email,
      },
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not open video", 500);
  }
}
