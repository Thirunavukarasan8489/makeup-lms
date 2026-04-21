"use client";

import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import type { UserRole } from "@/lib/types";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
};

type UserPayload = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: UserRole;
  phone?: string;
};

function normalizeUser(user: UserPayload): AdminUser {
  const role: UserRole =
    user.role === "admin" || user.role === "staff" ? user.role : "user";

  return {
    id: String(user._id ?? user.id ?? ""),
    name: String(user.name ?? ""),
    email: String(user.email ?? ""),
    role,
    phone: String(user.phone ?? ""),
  };
}

export function AdminUserManager({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [activeTab, setActiveTab] = useState<"add" | "list">("add");
  const [users, setUsers] = useState(initialUsers);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function addUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const payload = Object.fromEntries(new FormData(formElement));

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      toast.error(data?.error ?? "Could not add user");
      return;
    }

    toast.success("User added successfully");
    formElement.reset();
    setUsers((current) => [normalizeUser(data.user), ...current]);
    setActiveTab("list");
  }

  async function updateUser(event: FormEvent<HTMLFormElement>, userId: string) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));

    const response = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      toast.error(data?.error ?? "Could not update user");
      return;
    }

    toast.success("User updated successfully");
    setUsers((current) =>
      current.map((item) =>
        item.id === userId ? normalizeUser(data.user) : item,
      ),
    );
    setEditingId(null);
  }

  async function deleteUser(userId: string) {
    const confirmed = window.confirm("Delete this user permanently?");
    if (!confirmed) return;

    const response = await fetch(`/api/users/${userId}`, {
      method: "DELETE",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      toast.error(data?.error ?? "Could not delete user");
      return;
    }

    toast.success("User deleted");
    setUsers((current) => current.filter((item) => item.id !== userId));
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap gap-2 rounded-lg border border-stone-200 bg-white p-2 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("add")}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            activeTab === "add"
              ? "bg-stone-950 text-white"
              : "text-stone-700 hover:bg-stone-100"
          }`}
        >
          Add User
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("list")}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            activeTab === "list"
              ? "bg-stone-950 text-white"
              : "text-stone-700 hover:bg-stone-100"
          }`}
        >
          All Users
        </button>
      </div>

      {activeTab === "add" ? (
        <form
          onSubmit={addUser}
          className="grid max-w-xl gap-3 rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-xl font-bold">Add User or Staff</h2>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Name
            <input
              name="name"
              required
              className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Email
            <input
              name="email"
              type="email"
              required
              className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Password
            <input
              name="password"
              type="password"
              minLength={6}
              required
              className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Role
            <select
              name="role"
              className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
            >
              <option value="user">Student</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Phone
            <input
              name="phone"
              className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
            />
          </label>
          <button className="h-10 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white hover:bg-rose-700">
            Add user
          </button>
        </form>
      ) : (
        <div className="grid gap-3">
          {users.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
            >
              {editingId === item.id ? (
                <form onSubmit={(event) => updateUser(event, item.id)} className="grid gap-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-bold">Edit User</h2>
                    <span className="text-sm font-semibold uppercase text-rose-700">
                      {item.role}
                    </span>
                  </div>
                  <label className="grid gap-2 text-sm font-medium text-stone-700">
                    Name
                    <input
                      name="name"
                      defaultValue={item.name}
                      required
                      className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-stone-700">
                    Email
                    <input
                      name="email"
                      type="email"
                      defaultValue={item.email}
                      required
                      className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
                    />
                  </label>
                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="grid gap-2 text-sm font-medium text-stone-700">
                      Role
                      <select
                        name="role"
                        defaultValue={item.role}
                        className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
                      >
                        <option value="user">Student</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-stone-700 md:col-span-2">
                      Phone
                      <input
                        name="phone"
                        defaultValue={item.phone}
                        className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
                      />
                    </label>
                  </div>
                  <label className="grid gap-2 text-sm font-medium text-stone-700">
                    New password
                    <input
                      name="password"
                      type="password"
                      minLength={6}
                      placeholder="Leave blank to keep existing password"
                      className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button className="h-10 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white hover:bg-rose-700">
                      Save changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="h-10 rounded-md border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-700 hover:border-rose-300 hover:text-rose-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-bold">{item.name}</h2>
                      <p className="mt-1 text-sm text-stone-600">{item.email}</p>
                      <p className="mt-1 text-sm text-stone-500">
                        {item.phone || "No phone added"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold uppercase text-rose-700">
                        {item.role}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingId(item.id)}
                        title="Edit user"
                        aria-label={`Edit ${item.name}`}
                        className="grid h-9 w-9 place-items-center rounded-md border border-stone-300 bg-white text-stone-700 transition hover:border-rose-300 hover:text-rose-700"
                      >
                        <svg
                          className="h-4 w-4 fill-none stroke-current stroke-2"
                          viewBox="0 0 24 24"
                          aria-hidden
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteUser(item.id)}
                        title="Delete user"
                        aria-label={`Delete ${item.name}`}
                        className="grid h-9 w-9 place-items-center rounded-md bg-red-600 text-white transition hover:bg-red-700"
                      >
                        <svg
                          className="h-4 w-4 fill-none stroke-current stroke-2"
                          viewBox="0 0 24 24"
                          aria-hidden
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V4h8v2" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l1 14h10l1-14" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v5M14 11v5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </article>
          ))}
          {users.length === 0 ? (
            <p className="rounded-lg border border-stone-200 bg-white p-5 text-stone-600 shadow-sm">
              No users found yet.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
