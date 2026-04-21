"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import type { UserRole } from "@/lib/types";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const payload: Record<string, FormDataEntryValue> = Object.fromEntries(form);

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    setLoading(false);

    if (!response.ok) {
      toast.error(data.error ?? "Something went wrong");
      return;
    }

    toast.success(mode === "login" ? "Login successful" : "Account created");
    const role = data.user.role as UserRole;
    const redirectTo = String(data.redirectTo ?? `/${role}/dashboard`);
    router.refresh();
    window.location.assign(redirectTo);
  }

  return (
    <form
      method="post"
      action={`/api/auth/${mode}`}
      onSubmit={handleSubmit}
      className="grid gap-4"
    >
      {mode === "register" ? (
        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Full name
          <input
            name="name"
            required
            className="h-11 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
          />
        </label>
      ) : null}
      <label className="grid gap-2 text-sm font-medium text-stone-700">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-11 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-stone-700">
        Password
        <input
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={6}
          required
          className="h-11 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
        />
      </label>
      {mode === "register" ? (
        <>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Phone
            <input
              name="phone"
              className="h-11 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Role
            <select
              name="role"
              defaultValue="user"
              className="h-11 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
            >
              <option value="user">Student</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        </>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="h-11 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
      </button>
    </form>
  );
}
