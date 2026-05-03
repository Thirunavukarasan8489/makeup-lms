import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireRole } from "@/lib/api";
import { getCloudinaryConfig, signCloudinaryParams } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  const guard = await requireRole(["admin"]);
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const fileType = String(body.fileType ?? "");

    if (!fileType.startsWith("video/")) {
      return jsonError("Only video files can be uploaded");
    }

    const { cloudName, apiKey } = getCloudinaryConfig();
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "makeup-lms/videos";
    const signature = signCloudinaryParams({ folder, timestamp });

    return NextResponse.json({
      cloudName,
      apiKey,
      folder,
      timestamp,
      signature,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not create upload signature", 500);
  }
}
