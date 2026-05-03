import { ReactNode } from "react";
import Link from "next/link";
import { DashboardDrawer } from "@/components/DashboardDrawer";
import type { SessionUser } from "@/lib/types";

const nav = {
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
    { label: "Users", href: "/admin/users", icon: "users" },
    { label: "Staff", href: "/admin/staff", icon: "staff" },
    { label: "Courses", href: "/admin/courses", icon: "courses" },
    { label: "Upload", href: "/admin/upload", icon: "uploadvideo" },
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
  icon = "dashboard",
  tone = "rose",
}: {
  label: string;
  value: string | number;
  detail: string;
  icon?: DashboardIconName;
  tone?: "rose" | "teal" | "amber" | "stone";
}) {
  const tones = {
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    teal: "bg-teal-50 text-teal-700 ring-teal-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    stone: "bg-stone-100 text-stone-700 ring-stone-200",
  };

  return (
    <article className="dashboard-card group rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-stone-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-stone-950">{value}</p>
        </div>
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-md ring-1 transition duration-300 group-hover:scale-105 ${tones[tone]}`}
        >
          <DashboardIcon name={icon} />
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-600">{detail}</p>
    </article>
  );
}

export function DashboardPanel({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="dashboard-card rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="text-xl font-bold text-stone-950">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function QuickActionCard({
  href,
  title,
  detail,
  icon,
  tone = "rose",
}: {
  href: string;
  title: string;
  detail: string;
  icon: DashboardIconName;
  tone?: "rose" | "teal" | "amber" | "stone";
}) {
  const tones = {
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    teal: "bg-teal-50 text-teal-700 ring-teal-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    stone: "bg-stone-100 text-stone-700 ring-stone-200",
  };

  return (
    <Link
      href={href}
      className="dashboard-card group rounded-lg border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-rose-200 hover:shadow-md"
    >
      <span
        className={`grid h-10 w-10 place-items-center rounded-md ring-1 transition group-hover:scale-105 ${tones[tone]}`}
      >
        <DashboardIcon name={icon} />
      </span>
      <h3 className="mt-4 text-base font-bold text-stone-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{detail}</p>
    </Link>
  );
}

type DashboardIconName =
  | "dashboard"
  | "users"
  | "staff"
  | "courses"
  | "uploadvideo"
  | "tasks"
  | "certificate"
  | "enquiry"
  | "spark"
  | "check";

function DashboardIcon({ name }: { name: DashboardIconName }) {
  const className = "h-5 w-5 fill-none stroke-current stroke-2";

  switch (name) {
    case "users":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
          />
          <circle cx="9" cy="7" r="4" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M22 21v-2a4 4 0 0 0-3-3.87"
          />
        </svg>
      );
    case "staff":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 20V6a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v14"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 20h12M12 10v4M10 12h4"
          />
        </svg>
      );
    case "courses":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"
          />
        </svg>
      );
    case "uploadvideo":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 9l5-5 5 5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 16.5A4.5 4.5 0 0 1 15.5 21h-7A4.5 4.5 0 0 1 4 16.5" />
        </svg>
      );
    case "tasks":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 11l2 2 4-4"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
          />
        </svg>
      );
    case "certificate":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7l-5-5Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 2v6h6M9 15l2 2 4-5"
          />
        </svg>
      );
    case "enquiry":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
          />
        </svg>
      );
    case "spark":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"
          />
        </svg>
      );
    case "check":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 6 9 17l-5-5"
          />
        </svg>
      );
    case "dashboard":
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13h8V3H3v10ZM13 21h8V11h-8v10ZM13 9h8V3h-8v6ZM3 21h8v-6H3v6Z"
          />
        </svg>
      );
  }
}
