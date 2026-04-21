import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { getSession } from "@/lib/auth";
import { getCertificates, getEnrollments } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function UserCertificatePage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const [certificates, enrollments] = await Promise.all([
    getCertificates(user.id),
    getEnrollments(user.id),
  ]);
  const completed = enrollments.filter((enrollment) => enrollment.isCompleted);

  return (
    <DashboardShell user={user} title="Certificates">
      <section className="grid gap-3">
        {certificates.map((certificate) => (
          <article key={String(certificate._id)} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Certificate</h2>
            <a
              href={String(certificate.certificateUrl)}
              className="mt-2 inline-block text-sm font-semibold text-rose-700"
            >
              View and download
            </a>
          </article>
        ))}
        {certificates.length === 0 ? (
          <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">No certificates yet</h2>
            <p className="mt-2 text-sm text-stone-600">
              Certificates appear here after a course is marked complete.
              Completed courses: {completed.length}
            </p>
          </article>
        ) : null}
      </section>
    </DashboardShell>
  );
}
