"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import type { SessionUser } from "@/lib/types";

type IconName =
  | "dashboard"
  | "users"
  | "staff"
  | "courses"
  | "tasks"
  | "certificate"
  | "enquiry";

type NavItem = {
  label: string;
  href: string;
  icon: IconName;
};

const iconBase =
  "h-4 w-4 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]";

function DrawerIcon({ name }: { name: IconName }) {
  switch (name) {
    case "dashboard":
      return (
        <svg className={iconBase} viewBox="0 0 24 24" aria-hidden>
          <path d="M3 13h8V3H3v10Z" />
          <path d="M13 21h8V11h-8v10Z" />
          <path d="M13 9h8V3h-8v6Z" />
          <path d="M3 21h8v-6H3v6Z" />
        </svg>
      );
    case "users":
      return (
        <svg className={iconBase} viewBox="0 0 24 24" aria-hidden>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "staff":
      return (
        <svg className={iconBase} viewBox="0 0 24 24" aria-hidden>
          <path d="M16 20V6a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v14" />
          <path d="M6 20h12" />
          <path d="M12 10v4" />
          <path d="M10 12h4" />
          <path d="M4 20V10a2 2 0 0 1 2-2h2" />
          <path d="M20 20V10a2 2 0 0 0-2-2h-2" />
        </svg>
      );
    case "courses":
      return (
        <svg className={iconBase} viewBox="0 0 24 24" aria-hidden>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
          <path d="M8 6h8" />
          <path d="M8 10h6" />
        </svg>
      );
    case "tasks":
      return (
        <svg className={iconBase} viewBox="0 0 24 24" aria-hidden>
          <path d="M9 11l2 2 4-4" />
          <path d="M9 17h6" />
          <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        </svg>
      );
    case "certificate":
      return (
        <svg className={iconBase} viewBox="0 0 24 24" aria-hidden>
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7l-5-5Z" />
          <path d="M14 2v6h6" />
          <path d="M9 15l2 2 4-5" />
        </svg>
      );
    case "enquiry":
      return (
        <svg className={iconBase} viewBox="0 0 24 24" aria-hidden>
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
          <path d="M9 9h6" />
          <path d="M9 13h4" />
        </svg>
      );
  }
}

function MenuIcon() {
  return (
    <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={open ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
      />
    </svg>
  );
}

export function DashboardDrawer({
  user,
  title,
  nav,
  children,
}: {
  user: SessionUser;
  title: string;
  nav: NavItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const sidebarWidth = desktopOpen ? "lg:pl-72" : "lg:pl-24";

  return (
    <main className="min-h-screen bg-[#fbf7f4] text-stone-950">
      <button
        type="button"
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 grid h-11 w-11 place-items-center rounded-md border border-stone-200 bg-white text-xl font-bold shadow-sm transition hover:border-rose-300 hover:text-rose-700 lg:hidden"
      >
        <MenuIcon />
      </button>

      <div
        className={`fixed inset-0 z-40 bg-stone-950/40 transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-stone-200 bg-white shadow-xl transition-transform duration-300 ease-out lg:translate-x-0 lg:transition-[width] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${desktopOpen ? "lg:w-72" : "lg:w-24"}`}
      >
        <div className="flex h-20 items-center justify-between border-b border-stone-200 px-4">
          <Link
            href={`/${user.role}/dashboard`}
            className={`min-w-0 transition-opacity duration-200 ${
              desktopOpen ? "lg:opacity-100" : "lg:pointer-events-none lg:opacity-0"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-rose-700">
              Makeup LMS
            </p>
            <p className="truncate text-lg font-black text-stone-950">
              {user.role} panel
            </p>
          </Link>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="grid h-10 w-10 place-items-center rounded-md border border-stone-200 text-xl font-bold text-stone-700 transition hover:border-rose-300 hover:text-rose-700 lg:hidden"
          >
            <CloseIcon />
          </button>
          <button
            type="button"
            aria-label={desktopOpen ? "Collapse navigation" : "Expand navigation"}
            aria-expanded={desktopOpen}
            onClick={() => setDesktopOpen((open) => !open)}
            className="hidden h-10 w-10 place-items-center rounded-md border border-stone-200 text-sm font-bold text-stone-700 transition hover:border-rose-300 hover:text-rose-700 lg:grid"
          >
            <ChevronIcon open={desktopOpen} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-5">
          {nav.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                onClick={() => setMobileOpen(false)}
                className={`flex h-12 items-center gap-3 rounded-md px-3 text-sm font-semibold transition ${
                  active
                    ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                    : "text-stone-700 hover:bg-stone-100 hover:text-stone-950"
                } ${desktopOpen ? "lg:justify-start" : "lg:justify-center"}`}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-stone-100 text-base">
                  <DrawerIcon name={item.icon} />
                </span>
                <span
                  className={`truncate transition-[opacity,width] duration-200 ${
                    desktopOpen ? "lg:w-40 lg:opacity-100" : "lg:w-0 lg:opacity-0"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-stone-200 p-4">
          <div
            className={`flex items-center gap-3 rounded-lg bg-[#fbf7f4] p-3 ${
              desktopOpen ? "lg:justify-start" : "lg:justify-center"
            }`}
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-stone-950 text-sm font-bold uppercase text-white">
              {user.name.slice(0, 1)}
            </div>
            <div
              className={`min-w-0 transition-[opacity,width] duration-200 ${
                desktopOpen ? "lg:w-40 lg:opacity-100" : "lg:w-0 lg:opacity-0"
              }`}
            >
              <p className="truncate text-sm font-bold">{user.name}</p>
              <p className="truncate text-xs text-stone-500">{user.email}</p>
            </div>
          </div>
          <LogoutButton collapsed={!desktopOpen} />
        </div>
      </aside>

      <section
        className={`min-h-screen transition-[padding] duration-300 ease-out ${sidebarWidth}`}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 pt-20 sm:px-6 lg:px-8 lg:pt-6">
          <header className="border-b border-stone-200 pb-5">
            {/* <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">
              Makeup LMS
            </p> */}
            <h1 className="mt-1 text-3xl font-bold">{title}</h1>
            {/* <p className="mt-1 text-sm text-stone-600">
              Signed in as {user.name} ({user.role})
            </p> */}
          </header>
          {children}
        </div>
      </section>
    </main>
  );
}
