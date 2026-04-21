import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getSession } from "@/lib/auth";

export default async function RegisterPage() {
  const user = await getSession();
  if (user) redirect(`/${user.role}/dashboard`);

  return (
    <main className="grid min-h-screen place-items-center bg-[#fbf7f4] px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-rose-700">
          Start learning
        </p>
        <h1 className="mt-2 text-3xl font-bold text-stone-950">Register</h1>
        <p className="mt-2 text-sm text-stone-600">
          Create an account for students, staff, or administrators.
        </p>
        <div className="mt-6">
          <AuthForm mode="register" />
        </div>
        <p className="mt-5 text-sm text-stone-600">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-rose-700">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
