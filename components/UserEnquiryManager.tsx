"use client";

import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import type { EnquiryStatus, EnquiryType } from "@/lib/types";

export type UserEnquiryItem = {
  id: string;
  type: EnquiryType;
  message: string;
  status: EnquiryStatus;
};

type EnquiryPayload = {
  _id?: string;
  id?: string;
  type?: EnquiryType;
  message?: string;
  status?: EnquiryStatus;
};

function normalizeEnquiry(enquiry: EnquiryPayload): UserEnquiryItem {
  const type: EnquiryType = enquiry.type === "issue" ? "issue" : "feedback";
  const status: EnquiryStatus =
    enquiry.status === "reviewing" || enquiry.status === "closed"
      ? enquiry.status
      : "open";

  return {
    id: String(enquiry._id ?? enquiry.id ?? ""),
    type,
    message: String(enquiry.message ?? ""),
    status,
  };
}

export function UserEnquiryManager({
  initialEnquiries,
}: {
  initialEnquiries: UserEnquiryItem[];
}) {
  const [enquiries, setEnquiries] = useState(initialEnquiries);

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const payload = Object.fromEntries(new FormData(formElement));

    const response = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      toast.error(data?.error ?? "Could not submit enquiry");
      return;
    }

    toast.success("Enquiry submitted");
    formElement.reset();
    setEnquiries((current) => [normalizeEnquiry(data.enquiry), ...current]);
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[380px_1fr]">
      <form
        onSubmit={submitEnquiry}
        className="grid gap-3 rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-xl font-bold">Send Message</h2>
        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Type
          <select
            name="type"
            className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
          >
            <option value="feedback">Feedback</option>
            <option value="issue">Issue</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Message
          <textarea
            name="message"
            required
            rows={4}
            className="rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-rose-500"
          />
        </label>
        <button className="h-10 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white hover:bg-rose-700">
          Submit
        </button>
      </form>
      <div className="grid gap-3">
        {enquiries.map((enquiry) => (
          <article
            key={enquiry.id}
            className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold">{enquiry.type}</h2>
              <span className="text-sm font-semibold uppercase text-rose-700">
                {enquiry.status}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {enquiry.message}
            </p>
          </article>
        ))}
        {enquiries.length === 0 ? (
          <p className="rounded-lg border border-stone-200 bg-white p-5 text-stone-600 shadow-sm">
            No enquiries submitted yet.
          </p>
        ) : null}
      </div>
    </section>
  );
}
