import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { jsonError, requireRole } from "@/lib/api";
import Enquiry from "@/models/Enquiry";
import type { EnquiryType } from "@/lib/types";

const enquiryTypes: EnquiryType[] = ["issue", "feedback"];

export async function GET() {
  const guard = await requireRole(["admin", "user"]);
  if (guard.error) return guard.error;

  await connectDB();
  const filter = guard.session?.role === "user" ? { userId: guard.session.id } : {};
  const enquiries = await Enquiry.find(filter)
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  return NextResponse.json({ enquiries });
}

export async function POST(request: NextRequest) {
  const guard = await requireRole(["user", "admin"]);
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const message = String(body.message ?? "").trim();
    const type = enquiryTypes.includes(body.type) ? body.type : "feedback";

    if (!message) return jsonError("Message is required");

    await connectDB();
    const enquiry = await Enquiry.create({
      userId: guard.session?.id,
      message,
      type,
    });

    return NextResponse.json({ enquiry }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not submit enquiry", 500);
  }
}
