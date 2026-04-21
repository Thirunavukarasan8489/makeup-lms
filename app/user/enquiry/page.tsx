import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import {
  UserEnquiryManager,
  type UserEnquiryItem,
} from "@/components/UserEnquiryManager";
import { getSession } from "@/lib/auth";
import { getEnquiries } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function UserEnquiryPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const enquiries = await getEnquiries(user.id);

  const enquiryItems: UserEnquiryItem[] = enquiries.map((enquiry) => ({
    id: String(enquiry._id),
    type: enquiry.type === "issue" ? "issue" : "feedback",
    message: String(enquiry.message),
    status:
      enquiry.status === "reviewing" || enquiry.status === "closed"
        ? enquiry.status
        : "open",
  }));

  return (
    <DashboardShell user={user} title="Enquiry & Feedback">
      <UserEnquiryManager initialEnquiries={enquiryItems} />
    </DashboardShell>
  );
}
