import { createHash } from "crypto";

type CloudinarySignatureParams = Record<string, string | number | undefined>;

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export function getCloudinaryConfig() {
  return {
    cloudName: requiredEnv("CLOUDINARY_CLOUD_NAME"),
    apiKey: requiredEnv("CLOUDINARY_API_KEY"),
    apiSecret: requiredEnv("CLOUDINARY_API_SECRET"),
  };
}

export function signCloudinaryParams(params: CloudinarySignatureParams) {
  const { apiSecret } = getCloudinaryConfig();
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${payload}${apiSecret}`)
    .digest("hex");
}

export function getCloudinaryVideoUrls(publicId: string) {
  const { cloudName } = getCloudinaryConfig();
  const encodedPublicId = publicId
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  const deliveryBase = `https://res.cloudinary.com/${cloudName}/video/upload`;

  return {
    hlsUrl: `${deliveryBase}/sp_auto/${encodedPublicId}.m3u8`,
    fallbackUrl: `${deliveryBase}/${encodedPublicId}.mp4`,
  };
}

export async function deleteCloudinaryVideo(publicId: string) {
  const { cloudName, apiKey } = getCloudinaryConfig();
  const timestamp = Math.round(Date.now() / 1000);
  const signature = signCloudinaryParams({ public_id: publicId, timestamp });
  const formData = new FormData();
  formData.set("public_id", publicId);
  formData.set("api_key", apiKey);
  formData.set("timestamp", String(timestamp));
  formData.set("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/video/destroy`,
    {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(15000),
    },
  );
  const data = await response.json().catch(() => null);

  if (data?.result === "not found") {
    return data;
  }

  if (!response.ok || data?.result === "error") {
    throw new Error(data?.error?.message ?? "Could not delete Cloudinary video");
  }

  return data;
}
