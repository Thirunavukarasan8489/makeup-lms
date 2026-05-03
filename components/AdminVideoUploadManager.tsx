"use client";

import axios from "axios";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { toast } from "react-toastify";

type Video = {
  _id?: string;
  title: string;
  description?: string;
  key?: string;
  publicId?: string;
  url: string;
  contentType?: string;
  size?: number;
  uploadedAt?: string;
};

type CourseWithVideos = {
  _id: string;
  title: string;
  videos?: Video[];
};

type UploadState = "idle" | "signing" | "uploading" | "saving";

export function AdminVideoUploadManager({
  initialCourses,
}: {
  initialCourses: CourseWithVideos[];
}) {
  const [courses, setCourses] = useState(initialCourses);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourses[0]?._id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<UploadState>("idle");
  const [deletingId, setDeletingId] = useState("");

  const selectedCourse = useMemo(
    () => courses.find((course) => course._id === selectedCourseId),
    [courses, selectedCourseId],
  );

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setProgress(0);
    if (nextFile && !title) {
      setTitle(nextFile.name.replace(/\.[^/.]+$/, ""));
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !title.trim()) {
      toast.error("Choose a video file and title.");
      return;
    }

    try {
      setProgress(0);
      setState("signing");
      const signResponse = await fetch("/api/upload-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      const signData = await signResponse.json();
      if (!signResponse.ok) throw new Error(signData?.error ?? "Could not prepare upload");

      setState("uploading");
      const uploadData = new FormData();
      uploadData.set("file", file);
      uploadData.set("api_key", signData.apiKey);
      uploadData.set("timestamp", String(signData.timestamp));
      uploadData.set("signature", signData.signature);
      uploadData.set("folder", signData.folder);

      const cloudinaryResponse = await axios.post(signData.uploadUrl, uploadData, {
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        },
      });

      setState("saving");
      const saveResponse = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourseId,
          title,
          description,
          publicId: cloudinaryResponse.data.public_id,
          url: cloudinaryResponse.data.secure_url,
          contentType: file.type,
          size: cloudinaryResponse.data.bytes ?? file.size,
        }),
      });
      const saveData = await saveResponse.json();
      if (!saveResponse.ok) throw new Error(saveData?.error ?? "Upload completed but metadata was not saved");

      setCourses((current) => {
        const savedCourse = {
          _id: String(saveData.course._id),
          title: String(saveData.course.title),
          videos: saveData.course.videos ?? [],
        };
        const existingCourse = current.some((course) => course._id === savedCourse._id);

        if (!existingCourse) {
          return [savedCourse, ...current];
        }

        return current.map((course) =>
          course._id === savedCourse._id
            ? { ...course, videos: [...(course.videos ?? []), saveData.video] }
            : course,
        );
      });
      if (!selectedCourseId && saveData.course?._id) {
        setSelectedCourseId(String(saveData.course._id));
      }
      setTitle("");
      setDescription("");
      setFile(null);
      setProgress(100);
      toast.success("Video uploaded successfully");
      event.currentTarget.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload video");
    } finally {
      setState("idle");
    }
  }

  async function deleteVideo(courseId: string, video: Video) {
    const videoId = video._id ?? video.publicId ?? video.key ?? "";
    setDeletingId(videoId);

    try {
      const response = await fetch("/api/videos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          videoId: video._id,
          publicId: video.publicId ?? video.key,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Could not delete video");

      setCourses((current) =>
        current.map((course) =>
          course._id === courseId
            ? {
                ...course,
                videos: (course.videos ?? []).filter(
                  (item) => (item._id ?? item.key) !== (video._id ?? video.key),
                ),
              }
            : course,
        ),
      );
      toast.success("Video deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete video");
    } finally {
      setDeletingId("");
    }
  }

  const busy = state !== "idle";
  const allVideos = courses.flatMap((course) =>
    (course.videos ?? []).map((video) => ({ ...video, courseId: course._id, courseTitle: course.title })),
  );

  return (
    <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <form onSubmit={submit} className="grid gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-bold">Upload Video</h2>
          <p className="mt-1 text-sm text-stone-600">Store the file in Cloudinary and attach it to a course.</p>
        </div>

        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Course
          <select
            value={selectedCourseId}
            onChange={(event) => setSelectedCourseId(event.target.value)}
            className="h-10 rounded-md border border-stone-300 bg-white px-3 outline-none focus:border-rose-500"
          >
            <option value="">
              {courses.length === 0 ? "Upload now, assign course later" : "Upload without course"}
            </option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Title
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-rose-500"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Video file
          <input
            required
            type="file"
            accept="video/*"
            onChange={onFileChange}
            className="rounded-md border border-dashed border-stone-300 bg-[#fbf7f4] px-3 py-4 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-stone-950 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-rose-300"
          />
        </label>

        <div className="overflow-hidden rounded-md bg-stone-100">
          <div
            className="h-3 rounded-md bg-rose-600 transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm text-stone-600">
          <span>{busy ? state : "Ready"}</span>
          <span className="font-semibold text-stone-950">{progress}%</span>
        </div>

        <button
          disabled={busy}
          className="h-10 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          {busy ? "Uploading..." : "Upload video"}
        </button>
      </form>

      <div className="grid gap-4">
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold">Course Videos</h2>
          <p className="mt-1 text-sm text-stone-600">
            {selectedCourse ? selectedCourse.title : "No course selected"}
          </p>
          <div className="mt-4 grid gap-3">
            {(selectedCourse?.videos ?? []).length === 0 ? (
              <p className="rounded-md border border-dashed border-stone-300 p-4 text-sm text-stone-500">
                No videos uploaded for this course yet.
              </p>
            ) : (
              selectedCourse?.videos?.map((video) => (
                <VideoRow
                  key={video._id ?? video.key}
                  video={video}
                  deleting={deletingId === (video._id ?? video.key)}
                  onDelete={() => deleteVideo(selectedCourse._id, video)}
                />
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold">All Uploaded Videos</h2>
          <div className="mt-4 grid gap-3">
            {allVideos.length === 0 ? (
              <p className="rounded-md border border-dashed border-stone-300 p-4 text-sm text-stone-500">
                Uploaded videos will appear here.
              </p>
            ) : (
              allVideos.map((video) => (
                <div key={`${video.courseId}-${video._id ?? video.key}`} className="rounded-md border border-stone-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-rose-700">{video.courseTitle}</p>
                  <p className="mt-1 font-semibold text-stone-950">{video.title}</p>
                  <p className="mt-1 truncate text-xs text-stone-500">{video.publicId || video.key || video.url}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function VideoRow({
  video,
  deleting,
  onDelete,
}: {
  video: Video;
  deleting: boolean;
  onDelete: () => void;
}) {
  const size = video.size ? `${(video.size / (1024 * 1024)).toFixed(1)} MB` : "Stored video";

  return (
    <article className="rounded-md border border-stone-200 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-semibold text-stone-950">{video.title}</h3>
          {video.description ? <p className="mt-1 text-sm leading-6 text-stone-600">{video.description}</p> : null}
          <p className="mt-2 truncate text-xs text-stone-500">
            {size}
            {video.contentType ? ` / ${video.contentType}` : ""}
          </p>
        </div>
        <button
          type="button"
          disabled={deleting}
          onClick={onDelete}
          className="h-9 rounded-md border border-rose-200 px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
      {video.url ? (
        <video controls className="mt-4 aspect-video w-full rounded-md bg-stone-950">
          <source src={video.url} type={video.contentType} />
        </video>
      ) : null}
    </article>
  );
}
