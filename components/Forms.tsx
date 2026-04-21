"use client";

import { FormEvent } from "react";
import { toast } from "react-toastify";

type EndpointFormProps = {
  endpoint: string;
  button: string;
  children: React.ReactNode;
};

export function EndpointForm({ endpoint, button, children }: EndpointFormProps) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      toast.success("Saved successfully");
      formElement.reset();
      return;
    }

    const data = await response.json().catch(() => null);
    toast.error(data?.error ?? "Could not save. Check required fields.");
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      {children}
      <button className="h-10 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white hover:bg-rose-700">
        {button}
      </button>
    </form>
  );
}

export function TextInput({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-stone-700">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-rose-500"
      />
    </label>
  );
}

export function TextArea({
  name,
  label,
  required = false,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-stone-700">
      {label}
      <textarea
        name={name}
        required={required}
        rows={4}
        className="rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-rose-500"
      />
    </label>
  );
}
