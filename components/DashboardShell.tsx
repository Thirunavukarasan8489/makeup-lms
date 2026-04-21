import { ReactNode } from "react";
import { DashboardDrawer } from "@/components/DashboardDrawer";
import type { SessionUser } from "@/lib/types";

const nav = {
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: "⌂" },
    { label: "Users", href: "/admin/users", icon: "U" },
    { label: "Staff", href: "/admin/staff", icon: "S" },
    { label: "Courses", href: "/admin/courses", icon: "C" },
    { label: "Tasks", href: "/admin/tasks", icon: "T" },
  ],
  staff: [
    { label: "Dashboard", href: "/staff/dashboard", icon: "⌂" },
    { label: "Tasks", href: "/staff/tasks", icon: "T" },
  ],
  user: [
    { label: "Dashboard", href: "/user/dashboard", icon: "⌂" },
    { label: "Courses", href: "/user/courses", icon: "C" },
    { label: "Certificate", href: "/user/certificate", icon: "A" },
    { label: "Enquiry", href: "/user/enquiry", icon: "?" },
  ],
};

export function DashboardShell({
  user,
  title,
  children,
}: {
  user: SessionUser;
  title: string;
  children: ReactNode;
}) {
  return (
    <DashboardDrawer user={user} title={title} nav={nav[user.role]}>
      {children}
    </DashboardDrawer>
  );
}

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-stone-950">{value}</p>
      <p className="mt-2 text-sm text-stone-600">{detail}</p>
    </article>
  );
}
