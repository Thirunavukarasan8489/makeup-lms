"use client";

import { useState } from "react";
import { toast } from "react-toastify";

export function EnrollButton({
  courseId,
  enrolled,
}: {
  courseId: string;
  enrolled: boolean;
}) {
  const [done, setDone] = useState(enrolled);

  async function enroll() {
    const response = await fetch("/api/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });

    if (response.ok) {
      setDone(true);
      toast.success("Enrolled successfully");
    } else {
      const data = await response.json().catch(() => null);
      toast.error(data?.error ?? "Could not enroll.");
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={enroll}
        disabled={done}
        className="rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {done ? "Enrolled" : "Enroll"}
      </button>
    </div>
  );
}
