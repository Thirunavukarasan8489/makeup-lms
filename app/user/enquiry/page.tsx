import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { EndpointForm, TextArea } from "@/components/Forms";
import { getSession } from "@/lib/auth";
import { getEnquiries } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function UserEnquiryPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const enquiries = await getEnquiries(user.id);

  return (
    <DashboardShell user={user} title="Enquiry & Feedback">
      <section className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <EndpointForm endpoint="/api/enquiry" button="Submit">
          <h2 className="text-xl font-bold">Send Message</h2>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Type
            <select name="type" className="h-10 rounded-md border border-stone-300 px-3">
              <option value="feedback">Feedback</option>
              <option value="issue">Issue</option>
            </select>
          </label>
          <TextArea name="message" label="Message" required />
        </EndpointForm>
        <div className="grid gap-3">
          {enquiries.map((enquiry) => (
            <article key={String(enquiry._id)} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-bold">{String(enquiry.type)}</h2>
                <span className="text-sm font-semibold uppercase text-rose-700">{String(enquiry.status)}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-stone-600">{String(enquiry.message)}</p>
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
