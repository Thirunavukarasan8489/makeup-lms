"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import type { SessionUser } from "@/lib/types";

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

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
    setMobileOpen(false);
  }, [pathname]);

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
        ☰
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
            ×
          </button>
          <button
            type="button"
            aria-label={desktopOpen ? "Collapse navigation" : "Expand navigation"}
            aria-expanded={desktopOpen}
            onClick={() => setDesktopOpen((open) => !open)}
            className="hidden h-10 w-10 place-items-center rounded-md border border-stone-200 text-sm font-bold text-stone-700 transition hover:border-rose-300 hover:text-rose-700 lg:grid"
          >
            {desktopOpen ? "‹" : "›"}
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
                className={`flex h-12 items-center gap-3 rounded-md px-3 text-sm font-semibold transition ${
                  active
                    ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                    : "text-stone-700 hover:bg-stone-100 hover:text-stone-950"
                } ${desktopOpen ? "lg:justify-start" : "lg:justify-center"}`}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-stone-100 text-base">
                  {item.icon}
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
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">
              Makeup LMS
            </p>
            <h1 className="mt-1 text-3xl font-bold">{title}</h1>
            <p className="mt-1 text-sm text-stone-600">
              Signed in as {user.name} ({user.role})
            </p>
          </header>
          {children}
        </div>
      </section>
    </main>
  );
}
