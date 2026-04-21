import { ReactNode } from "react";
import { DashboardDrawer } from "@/components/DashboardDrawer";
import type { SessionUser } from "@/lib/types";

const nav = {
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
    { label: "Users", href: "/admin/users", icon: "users" },
    { label: "Staff", href: "/admin/staff", icon: "staff" },
    { label: "Courses", href: "/admin/courses", icon: "courses" },
    { label: "Tasks", href: "/admin/tasks", icon: "tasks" },
  ],
  staff: [
    { label: "Dashboard", href: "/staff/dashboard", icon: "dashboard" },
    { label: "Tasks", href: "/staff/tasks", icon: "tasks" },
  ],
  user: [
    { label: "Dashboard", href: "/user/dashboard", icon: "dashboard" },
    { label: "Courses", href: "/user/courses", icon: "courses" },
    { label: "Certificate", href: "/user/certificate", icon: "certificate" },
    { label: "Enquiry", href: "/user/enquiry", icon: "enquiry" },
  ],
} as const;

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
    <DashboardDrawer user={user} title={title} nav={[...nav[user.role]]}>
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
