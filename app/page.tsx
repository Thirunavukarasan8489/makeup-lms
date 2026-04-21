import Link from "next/link";

const features = [
  "Role based learning portals",
  "Staff task assignment and status tracking",
  "Course enrollment, progress, certificates, and feedback",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fbf7f4] text-stone-950">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wide text-rose-700">
            Makeup Learning Management System
          </p>
          <h1 className="mt-4 text-5xl font-bold leading-tight sm:text-6xl">
            Train artists, manage staff, and run makeup operations in one place.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-stone-700">
            A full-stack LMS foundation with JWT authentication, MongoDB models,
            protected dashboards, course management, task workflows, certificates,
            and student enquiries.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-md bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-rose-300 hover:text-rose-700"
            >
              Register
            </Link>
          </div>
        </div>
        <div className="grid gap-4">
          {features.map((feature, index) => (
            <article
              key={feature}
              className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-semibold text-rose-700">
                0{index + 1}
              </p>
              <h2 className="mt-2 text-xl font-bold">{feature}</h2>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
