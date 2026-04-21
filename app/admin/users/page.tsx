import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { EndpointForm, TextInput } from "@/components/Forms";
import { getSession } from "@/lib/auth";
import { getUsers } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const users = await getUsers();

  return (
    <DashboardShell user={user} title="User Management">
      <section className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <EndpointForm endpoint="/api/users" button="Add user">
          <h2 className="text-xl font-bold">Add User or Staff</h2>
          <TextInput name="name" label="Name" required />
          <TextInput name="email" label="Email" type="email" required />
          <TextInput name="password" label="Password" type="password" required />
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Role
            <select name="role" className="h-10 rounded-md border border-stone-300 px-3">
              <option value="user">Student</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <TextInput name="phone" label="Phone" />
        </EndpointForm>
        <div className="grid gap-3">
          {users.map((item) => (
            <article key={String(item._id)} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-bold">{String(item.name)}</h2>
                <span className="text-sm font-semibold uppercase text-rose-700">{String(item.role)}</span>
              </div>
              <p className="mt-1 text-sm text-stone-600">{String(item.email)}</p>
              <p className="mt-1 text-sm text-stone-500">{String(item.phone ?? "No phone added")}</p>
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
