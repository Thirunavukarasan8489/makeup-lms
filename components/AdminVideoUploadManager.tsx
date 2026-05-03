"use client";

import axios from "axios";
import { ChangeEvent, FormEvent, ReactNode, useState } from "react";
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
type EditDraft = {
  title: string;
  description: string;
};

function getVideoIdentity(video: Video) {
  return video._id ?? video.publicId ?? video.key ?? video.url;
}

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
  const [editingId, setEditingId] = useState("");
  const [savingEditId, setSavingEditId] = useState("");
  const [editDraft, setEditDraft] = useState<EditDraft>({
    title: "",
    description: "",
  });

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
    const videoId = getVideoIdentity(video);
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
                  (item) => getVideoIdentity(item) !== getVideoIdentity(video),
                ),
              }
            : course,
        ),
      );
      if (data?.storageDeleteWarning) {
        toast.warning("Video removed from LMS. Cloudinary cleanup needs checking.");
      } else {
        toast.success("Video deleted");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete video");
    } finally {
      setDeletingId("");
    }
  }

  function startEdit(video: Video) {
    setEditingId(getVideoIdentity(video));
    setEditDraft({
      title: video.title,
      description: video.description ?? "",
    });
  }

  function cancelEdit() {
    setEditingId("");
    setEditDraft({ title: "", description: "" });
  }

  async function saveVideoEdit(courseId: string, video: Video) {
    const videoIdentity = getVideoIdentity(video);
    if (!editDraft.title.trim()) {
      toast.error("Video title is required.");
      return;
    }

    setSavingEditId(videoIdentity);

    try {
      const response = await fetch("/api/videos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          videoId: video._id,
          publicId: video.publicId ?? video.key,
          title: editDraft.title,
          description: editDraft.description,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Could not update video");

      setCourses((current) =>
        current.map((course) =>
          course._id === courseId
            ? {
                ...course,
                videos: (course.videos ?? []).map((item) =>
                  getVideoIdentity(item) === videoIdentity
                    ? { ...item, title: data.video.title, description: data.video.description }
                    : item,
                ),
              }
            : course,
        ),
      );
      toast.success("Video updated");
      cancelEdit();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update video");
    } finally {
      setSavingEditId("");
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

      <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">All Uploaded Videos</h2>
        <div className="mt-4 grid gap-3">
          {allVideos.length === 0 ? (
            <p className="rounded-md border border-dashed border-stone-300 p-4 text-sm text-stone-500">
              Uploaded videos will appear here.
            </p>
          ) : (
            allVideos.map((video) => {
              const identity = getVideoIdentity(video);
              const editing = editingId === identity;

              return (
                <VideoRow
                  key={`${video.courseId}-${identity}`}
                  video={video}
                  editing={editing}
                  deleting={deletingId === identity}
                  saving={savingEditId === identity}
                  draft={editDraft}
                  onDraftChange={setEditDraft}
                  onEdit={() => startEdit(video)}
                  onCancel={cancelEdit}
                  onSave={() => saveVideoEdit(video.courseId, video)}
                  onDelete={() => deleteVideo(video.courseId, video)}
                />
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

function VideoRow({
  video,
  editing,
  deleting,
  saving,
  draft,
  onDraftChange,
  onEdit,
  onCancel,
  onSave,
  onDelete,
}: {
  video: Video & { courseTitle?: string };
  editing: boolean;
  deleting: boolean;
  saving: boolean;
  draft: EditDraft;
  onDraftChange: (draft: EditDraft) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const size = video.size ? `${(video.size / (1024 * 1024)).toFixed(1)} MB` : "Stored video";

  return (
    <article className="rounded-md border border-stone-200 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-rose-700">
            {video.courseTitle ?? "Course"}
          </p>
          {editing ? (
            <div className="mt-3 grid gap-3">
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Title
                <input
                  value={draft.title}
                  onChange={(event) =>
                    onDraftChange({ ...draft, title: event.target.value })
                  }
                  className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Description
                <textarea
                  value={draft.description}
                  onChange={(event) =>
                    onDraftChange({ ...draft, description: event.target.value })
                  }
                  rows={3}
                  className="rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-rose-500"
                />
              </label>
            </div>
          ) : (
            <>
              <h3 className="mt-1 font-semibold text-stone-950">{video.title}</h3>
              {video.description ? (
                <p className="mt-1 text-sm leading-6 text-stone-600">{video.description}</p>
              ) : null}
              <p className="mt-2 truncate text-xs text-stone-500">
                {video.publicId || video.key || "Cloudinary video"} / {size}
                {video.contentType ? ` / ${video.contentType}` : ""}
              </p>
            </>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {editing ? (
            <>
              <IconButton
                label="Save video"
                disabled={saving}
                onClick={onSave}
                tone="dark"
              >
                <SaveIcon />
              </IconButton>
              <IconButton
                label="Cancel edit"
                disabled={saving}
                onClick={onCancel}
              >
                <CloseIcon />
              </IconButton>
            </>
          ) : (
            <>
              <IconButton label="Edit video" onClick={onEdit}>
                <EditIcon />
              </IconButton>
              <IconButton
                label="Delete video"
                disabled={deleting}
                onClick={onDelete}
                tone="danger"
              >
                {deleting ? <SpinnerIcon /> : <DeleteIcon />}
              </IconButton>
            </>
          )}
        </div>
      </div>
      <div className="mt-4 rounded-md border border-dashed border-stone-300 bg-[#fbf7f4] p-4 text-sm leading-6 text-stone-600">
        Preview is hidden on the admin screen to avoid exposing a direct downloadable
        video URL. Enrolled students watch this lesson through the protected player.
      </div>
    </article>
  );
}

function IconButton({
  label,
  children,
  onClick,
  disabled = false,
  tone = "default",
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "danger" | "dark";
}) {
  const tones = {
    default: "border-stone-200 text-stone-700 hover:bg-stone-50",
    danger: "border-rose-200 text-rose-700 hover:bg-rose-50",
    dark: "border-stone-950 bg-stone-950 text-white hover:bg-rose-700",
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid h-9 w-9 place-items-center rounded-md border transition disabled:cursor-not-allowed disabled:opacity-60 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

function EditIcon() {
  return (
    <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V4h8v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14H6L5 6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v5M14 11v5" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  );
}
