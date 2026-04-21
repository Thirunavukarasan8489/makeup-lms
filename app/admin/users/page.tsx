import { redirect } from "next/navigation";
import {
  AdminUserManager,
  type AdminUser,
} from "@/components/AdminUserManager";
import { DashboardShell } from "@/components/DashboardShell";
import { getSession } from "@/lib/auth";
import { getUsers } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const users = await getUsers();

  const userItems: AdminUser[] = users.map((item) => {
    const role: AdminUser["role"] =
      item.role === "admin" || item.role === "staff" ? item.role : "user";

    return {
      id: String(item._id),
      name: String(item.name),
      email: String(item.email),
      role,
      phone: String(item.phone ?? ""),
    };
  });

  return (
    <DashboardShell user={user} title="User Management">
      <AdminUserManager initialUsers={userItems} />
    </DashboardShell>
  );
}
