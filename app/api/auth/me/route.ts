import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { jsonError } from "@/lib/api";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return jsonError("Authentication required", 401);
  }

  return NextResponse.json({ user: session });
}
