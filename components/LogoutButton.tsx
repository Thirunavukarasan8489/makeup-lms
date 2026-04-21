"use client";

import { useState } from "react";
import { toast } from "react-toastify";

export function LogoutButton({ collapsed }: { collapsed: boolean }) {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });

    if (!response.ok) {
      toast.error("Could not logout");
      setLoading(false);
      return;
    }

    toast.success("Logged out");
    window.location.assign("/login");
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      title="Logout"
      className={`mt-3 flex h-11 w-full items-center gap-3 rounded-md border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-700 transition hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60 ${
        collapsed ? "lg:justify-center" : "lg:justify-start"
      }`}
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-stone-100 text-base">
        <svg
          className="h-4 w-4 fill-none stroke-current stroke-2"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 17l5-5-5-5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 3v18" />
        </svg>
      </span>
      <span
        className={`truncate transition-[opacity,width] duration-200 ${
          collapsed ? "lg:w-0 lg:opacity-0" : "lg:w-40 lg:opacity-100"
        }`}
      >
        {loading ? "Logging out..." : "Logout"}
      </span>
    </button>
  );
}
