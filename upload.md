# Admin Dashboard - Video Upload & Management (Next.js + Cloudinary)

---

## Goal

Build an admin dashboard where:

* Admin can upload videos with a real progress bar
* Each uploaded video has a title and description
* Videos are stored securely in Cloudinary
* Admin can view, preview, delete, and manage course videos
* Upload uses signed direct browser upload to Cloudinary

---

## Tech Stack

### Frontend

* Next.js App Router
* Tailwind CSS
* Axios for upload progress tracking

### Backend

* Next.js Route Handlers
* JWT admin authentication
* MongoDB/Mongoose for course video metadata

### Storage

* Cloudinary video storage

---

## Upload Architecture

1. Admin selects a course and video file
2. Admin enters video title and description
3. Frontend requests a signed Cloudinary upload payload from backend
4. Backend creates a short-lived Cloudinary signature using `CLOUDINARY_API_SECRET`
5. Frontend uploads the video directly to Cloudinary with Axios
6. Progress bar shows real browser-to-Cloudinary upload progress
7. Frontend saves the Cloudinary `public_id`, secure URL, content type, and size in the course video metadata
8. Admin can preview or delete the video from the upload dashboard

---

## Why Signed Cloudinary Upload?

* No video file passes through the Next.js server
* Cloudinary API secret stays on the server
* Browser upload progress is real
* Cloudinary returns a secure video URL for playback
* Delete can be handled securely from an admin-only API route

---

## Folder Structure

```txt
app/
  admin/
    upload/page.tsx
  api/
    upload-signature/route.ts
    videos/route.ts
components/
  AdminVideoUploadManager.tsx
lib/
  cloudinary.ts
models/
  Course.ts
```

---

## Environment Variables

`.env` needs:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

The existing project already has Cloudinary variables in `.env`.

---

## Backend - Create Cloudinary Upload Signature

### `/app/api/upload-signature/route.ts`

This route is admin-only. It validates video uploads and signs these Cloudinary upload parameters:

* `folder`
* `timestamp`

The response includes:

* `cloudName`
* `apiKey`
* `folder`
* `timestamp`
* `signature`
* `uploadUrl`

The frontend uses those fields to upload directly to:

```txt
https://api.cloudinary.com/v1_1/{cloudName}/video/upload
```

---

## Frontend - Upload UI with Progress Bar

### `/components/AdminVideoUploadManager.tsx`

The admin upload UI supports:

* Course selector with an upload-without-course fallback
* Title input
* Description textarea
* Video file picker
* Upload progress bar
* Course video list
* Video preview player
* Delete action

Upload flow:

```ts
const signature = await fetch("/api/upload-signature", { method: "POST" });

const formData = new FormData();
formData.set("file", file);
formData.set("api_key", signature.apiKey);
formData.set("timestamp", String(signature.timestamp));
formData.set("signature", signature.signature);
formData.set("folder", signature.folder);

const uploaded = await axios.post(signature.uploadUrl, formData, {
  onUploadProgress(event) {
    const percent = Math.round((event.loaded * 100) / event.total);
    setProgress(percent);
  },
});
```

---

## API - Save Video Metadata

### `/app/api/videos/route.ts`

Admin-only route handlers:

* `GET /api/videos` - list courses with uploaded videos
* `POST /api/videos` - save uploaded video metadata to a course, or auto-create `Unassigned Videos` when no course is selected
* `DELETE /api/videos` - delete video from Cloudinary and remove metadata from course

Saved video metadata:

* `title`
* `description`
* `publicId`
* `key` for backward-compatible public ID lookup
* `url`
* `contentType`
* `size`
* `uploadedAt`

---

## Admin Dashboard - Manage Videos

### `/app/admin/upload/page.tsx`

Admin can:

* Upload a video into a selected course
* Upload before creating a course, using the automatic `Unassigned Videos` course
* Track upload progress
* Preview uploaded videos
* See all uploaded videos
* Delete videos

The dashboard drawer includes an `Upload` link for quick access.

---

## Security

* Only admin can request upload signatures
* Only admin can save or delete video metadata
* Cloudinary API secret is never exposed to the browser
* Delete requests are signed on the server

---

## Next Steps

* Add drag and drop upload
* Add larger-video guidance and Cloudinary account limits
* Add video transformations or HLS delivery if needed
* Add per-student video progress tracking
* Add course lesson ordering

---

## Pro Tip

Keep uploads direct to Cloudinary. If videos are uploaded through the Next.js backend, the progress bar will only track browser-to-server progress and the server can become a bottleneck.
