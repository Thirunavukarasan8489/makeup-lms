import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { getSession } from "@/lib/auth";
import { getUsers } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const staff = await getUsers("staff");

  return (
    <DashboardShell user={user} title="Staff Management">
      <section className="grid gap-3 md:grid-cols-2">
        {staff.map((member) => (
          <article key={String(member._id)} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">{String(member.name)}</h2>
            <p className="mt-1 text-sm text-stone-600">{String(member.email)}</p>
            <p className="mt-3 text-sm font-semibold text-rose-700">Role: Staff</p>
          </article>
        ))}
        {staff.length === 0 ? (
          <p className="rounded-lg border border-stone-200 bg-white p-5 text-stone-600 shadow-sm">
            No staff members found yet.
          </p>
        ) : null}
      </section>
    </DashboardShell>
  );
}
