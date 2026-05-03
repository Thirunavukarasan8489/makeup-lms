import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireRole } from "@/lib/api";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";

type CourseVideo = {
  _id?: { toString(): string };
  key?: string;
  publicId?: string;
};

type CourseRecord = {
  videos?: CourseVideo[];
};

export async function POST(request: NextRequest) {
  const guard = await requireRole(["user"]);
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const courseId = String(body.courseId ?? "").trim();
    const videoId = String(body.videoId ?? "").trim();
    const completed = Boolean(body.completed);

    if (!courseId || !videoId || !guard.session?.id) {
      return jsonError("Course and video are required");
    }

    await connectDB();
    const [course, enrollment] = await Promise.all([
      Course.findById(courseId).select("videos").lean() as Promise<CourseRecord | null>,
      Enrollment.findOne({ userId: guard.session.id, courseId }),
    ]);

    if (!course || !enrollment) {
      return jsonError("Enrollment not found", 404);
    }

    const videos = Array.isArray(course.videos) ? course.videos : [];
    const videoExists = videos.some((video) => {
      const id = video._id?.toString();
      return id === videoId || video.publicId === videoId || video.key === videoId;
    });

    if (!videoExists) return jsonError("Video not found", 404);

    const lessonCount = Math.max(videos.length, 1);
    const currentProgress = Number(enrollment.progress ?? 0);
    const lessonProgress = completed ? Math.ceil(100 / lessonCount) : Math.ceil(50 / lessonCount);
    const nextProgress = Math.min(100, Math.max(currentProgress, lessonProgress));

    enrollment.progress = nextProgress;
    enrollment.isCompleted = nextProgress >= 100;
    await enrollment.save();

    return NextResponse.json({
      enrollment: {
        progress: enrollment.progress,
        isCompleted: enrollment.isCompleted,
      },
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not update progress", 500);
  }
}
