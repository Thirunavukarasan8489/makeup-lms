import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getSession } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getSession();
  if (user) redirect(`/${user.role}/dashboard`);

  return (
    <main className="grid min-h-screen place-items-center bg-[#fbf7f4] px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-rose-700">
          Welcome back
        </p>
        <h1 className="mt-2 text-3xl font-bold text-stone-950">Login</h1>
        <p className="mt-2 text-sm text-stone-600">
          Access your admin, staff, or student dashboard.
        </p>
        <div className="mt-6">
          <AuthForm mode="login" />
        </div>
        <p className="mt-5 text-sm text-stone-600">
          New here?{" "}
          <Link href="/register" className="font-semibold text-rose-700">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
