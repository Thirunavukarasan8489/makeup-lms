"use client";

import Hls from "hls.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

type VideoLesson = {
  id: string;
  title: string;
  description?: string;
};

type AccessResponse = {
  video: {
    title: string;
    description?: string;
  };
  stream: {
    hlsUrl: string;
    fallbackUrl: string;
  };
  watermark: {
    name: string;
    email: string;
  };
};

const watermarkPositions = [
  "left-4 top-4",
  "right-4 top-4",
  "left-4 bottom-4",
  "right-4 bottom-4",
  "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
];

function formatWatermarkTime() {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

export function StudentVideoPlayer({
  courseId,
  lessons,
  initialProgress,
}: {
  courseId: string;
  lessons: VideoLesson[];
  initialProgress: number;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const progressSavedRef = useRef(false);
  const [activeLessonId, setActiveLessonId] = useState(lessons[0]?.id ?? "");
  const [access, setAccess] = useState<AccessResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [watermarkIndex, setWatermarkIndex] = useState(0);
  const [clock, setClock] = useState(formatWatermarkTime);

  const activeLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === activeLessonId),
    [activeLessonId, lessons],
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWatermarkIndex((index) => (index + 1) % watermarkPositions.length);
      setClock(formatWatermarkTime());
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    function blockKeys(event: KeyboardEvent) {
      if (
        event.key === "F12" ||
        (event.ctrlKey && event.shiftKey && ["I", "J", "C"].includes(event.key.toUpperCase())) ||
        (event.ctrlKey && event.key.toUpperCase() === "U")
      ) {
        event.preventDefault();
      }
    }

    document.addEventListener("keydown", blockKeys);
    return () => document.removeEventListener("keydown", blockKeys);
  }, []);

  useEffect(() => {
    if (!activeLessonId) return;
    let cancelled = false;
    progressSavedRef.current = false;

    async function loadVideo() {
      setLoading(true);
      setAccess(null);

      try {
        const response = await fetch("/api/video-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId, videoId: activeLessonId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error ?? "Could not load lesson");
        if (cancelled) return;

        setAccess(data);
        const video = videoRef.current;
        if (!video) return;

        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }

        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
          });
          hls.loadSource(data.stream.hlsUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, () => {
            if (video.src !== data.stream.fallbackUrl) {
              video.src = data.stream.fallbackUrl;
            }
          });
          hlsRef.current = hls;
        } else {
          video.src = video.canPlayType("application/vnd.apple.mpegurl")
            ? data.stream.hlsUrl
            : data.stream.fallbackUrl;
        }

        video.load();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not load lesson");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadVideo();

    return () => {
      cancelled = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeLessonId, courseId]);

  async function saveProgress(completed: boolean) {
    if (!activeLessonId || progressSavedRef.current) return;
    if (!completed && !videoRef.current) return;
    progressSavedRef.current = completed;

    await fetch("/api/video-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, videoId: activeLessonId, completed }),
    }).catch(() => null);
  }

  if (lessons.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-stone-300 bg-white p-6 text-sm text-stone-600 shadow-sm">
        No video lessons are available for this course yet.
      </div>
    );
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div
          className="relative overflow-hidden rounded-lg bg-stone-950"
          onContextMenu={(event) => event.preventDefault()}
        >
          <video
            ref={videoRef}
            controls
            controlsList="nodownload noplaybackrate noremoteplayback"
            disablePictureInPicture
            playsInline
            className="aspect-video w-full bg-stone-950"
            onTimeUpdate={(event) => {
              const video = event.currentTarget;
              if (video.duration && video.currentTime / video.duration > 0.5) {
                saveProgress(false);
              }
            }}
            onEnded={() => saveProgress(true)}
          />
          {access ? (
            <div
              className={`pointer-events-none absolute rounded-md bg-stone-950/45 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/20 transition-all duration-500 ${watermarkPositions[watermarkIndex]}`}
            >
              {access.watermark.email} | {clock}
            </div>
          ) : null}
          {loading ? (
            <div className="absolute inset-0 grid place-items-center bg-stone-950/70 text-sm font-semibold text-white">
              Loading lesson...
            </div>
          ) : null}
        </div>

        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-rose-700">
            Secure lesson
          </p>
          <h2 className="mt-1 text-xl font-bold text-stone-950">
            {access?.video.title ?? activeLesson?.title ?? "Lesson"}
          </h2>
          {access?.video.description || activeLesson?.description ? (
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {access?.video.description ?? activeLesson?.description}
            </p>
          ) : null}
          <p className="mt-3 text-sm font-medium text-stone-500">
            Course progress: {initialProgress}%
          </p>
        </div>
      </div>

      <aside className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-bold text-stone-950">Lessons</h3>
        <div className="mt-4 grid gap-2">
          {lessons.map((lesson, index) => {
            const active = lesson.id === activeLessonId;

            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => setActiveLessonId(lesson.id)}
                className={`rounded-md border p-3 text-left transition ${
                  active
                    ? "border-rose-200 bg-rose-50 text-rose-800"
                    : "border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wide">
                  Lesson {index + 1}
                </span>
                <span className="mt-1 block text-sm font-semibold">{lesson.title}</span>
              </button>
            );
          })}
        </div>
      </aside>
    </section>
  );
}
