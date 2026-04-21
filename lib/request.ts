import { NextRequest } from "next/server";

export function isJsonRequest(request: NextRequest) {
  return (request.headers.get("content-type") ?? "").includes("application/json");
}

export async function readRequestBody(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return request.json();
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    return Object.fromEntries(await request.formData());
  }

  return {};
}
