import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { jsonError, requireRole } from "@/lib/api";
import { deleteCloudinaryVideo } from "@/lib/cloudinary";
import Course from "@/models/Course";

type CourseVideo = {
  _id?: { toString(): string };
  key?: string;
  publicId?: string;
  title?: string;
  description?: string;
};

export async function GET() {
  const guard = await requireRole(["admin"]);
  if (guard.error) return guard.error;

  await connectDB();
  const courses = await Course.find({ "videos.0": { $exists: true } })
    .select("title videos")
    .sort({ updatedAt: -1 })
    .lean();

  return NextResponse.json({ courses });
}

export async function POST(request: NextRequest) {
  const guard = await requireRole(["admin"]);
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const courseId = String(body.courseId ?? "").trim();
    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const publicId = String(body.publicId ?? body.key ?? "").trim();
    const contentType = String(body.contentType ?? "").trim();
    const size = Number(body.size ?? 0);
    const url = String(body.url ?? "").trim();

    if (!title || !publicId || !url) {
      return jsonError("Video title, Cloudinary public ID, and URL are required");
    }

    await connectDB();
    const videoMetadata = {
      title,
      description,
      key: publicId,
      publicId,
      url,
      contentType,
      size: Number.isFinite(size) ? size : 0,
      uploadedAt: new Date(),
    };
    const course = courseId
      ? await Course.findByIdAndUpdate(
          courseId,
          { $push: { videos: videoMetadata } },
          { new: true, runValidators: true },
        )
      : await Course.findOneAndUpdate(
          { title: "Unassigned Videos" },
          {
            $setOnInsert: {
              title: "Unassigned Videos",
              description: "Videos uploaded before assigning them to a course.",
              createdBy: guard.session?.id,
            },
            $push: { videos: videoMetadata },
          },
          {
            new: true,
            runValidators: true,
            upsert: true,
          },
        );

    if (!course) {
      return jsonError("Course not found", 404);
    }

    const video = course.videos.at(-1);
    return NextResponse.json(
      {
        video,
        course: {
          _id: course._id,
          title: course.title,
          videos: course.videos,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not save video", 500);
  }
}

export async function PUT(request: NextRequest) {
  const guard = await requireRole(["admin"]);
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const courseId = String(body.courseId ?? "").trim();
    const videoId = String(body.videoId ?? "").trim();
    const publicId = String(body.publicId ?? body.key ?? "").trim();
    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();

    if (!courseId || (!videoId && !publicId)) {
      return jsonError("Course and video identifier are required");
    }

    if (!title) {
      return jsonError("Video title is required");
    }

    await connectDB();
    const course = await Course.findById(courseId);
    if (!course) return jsonError("Course not found", 404);

    const video = course.videos.find((item: CourseVideo) => {
      return (
        (videoId && item._id?.toString() === videoId) ||
        (publicId && (item.publicId === publicId || item.key === publicId))
      );
    });

    if (!video) return jsonError("Video not found", 404);

    video.title = title;
    video.description = description;
    await course.save();

    return NextResponse.json({ video, course });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not update video", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const guard = await requireRole(["admin"]);
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const courseId = String(body.courseId ?? "").trim();
    const videoId = String(body.videoId ?? "").trim();
    const publicId = String(body.publicId ?? body.key ?? "").trim();

    if (!courseId || (!videoId && !publicId)) {
      return jsonError("Course and video identifier are required");
    }

    await connectDB();
    const course = await Course.findById(courseId);
    if (!course) return jsonError("Course not found", 404);

    const video = course.videos.find((item: CourseVideo) => {
      return (
        (videoId && item._id?.toString() === videoId) ||
        (publicId && (item.publicId === publicId || item.key === publicId))
      );
    });

    if (!video) return jsonError("Video not found", 404);

    const cloudinaryPublicId = video.publicId || video.key;
    let storageDeleteWarning = "";
    if (cloudinaryPublicId) {
      try {
        await deleteCloudinaryVideo(cloudinaryPublicId);
      } catch (error) {
        storageDeleteWarning =
          error instanceof Error
            ? error.message
            : "Cloudinary delete did not complete";
      }
    }

    course.set(
      "videos",
      course.videos.filter(
        (item: CourseVideo) =>
          (videoId && item._id?.toString() !== videoId) ||
          (!videoId && item.publicId !== publicId && item.key !== publicId),
      ),
    );
    await course.save();

    return NextResponse.json({ video, course, storageDeleteWarning });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not delete video", 500);
  }
}
