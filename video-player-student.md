# 🎓 Secure Video Player (Student View – Next.js + Cloudinary)

---

## 🎯 Goal

Build a secure video player for students where:

* Only logged-in students can watch videos
* Videos are streamed (not downloadable easily)
* Video URLs are protected
* Watermark shows student identity
* Prevent basic inspect/download tricks

---

## ⚙️ Tech Stack

### Frontend

* Next.js (App Router)
* Tailwind CSS
* Video Player: hls.js or Cloudinary Player

### Backend (Next.js)

* API Routes / Route Handlers
* JWT Authentication (student login)

### Storage & Streaming

* Cloudinary (video hosting + streaming)
* Use adaptive streaming (HLS/DASH)

---

## 🧠 Video Access Flow

1. Student logs in
2. Student opens course video page
3. Frontend requests secure video URL
4. Backend verifies user access
5. Backend returns signed Cloudinary URL
6. Player streams video securely

---

## 🔐 Authentication & Authorization

### Protect Routes

* Use Next.js middleware
* Only logged-in users allowed

### Check Access

* Verify:

  * User purchased course OR
  * User enrolled

---

## 📦 Database Video Structure

```json id="db1"
{
  "id": "video123",
  "title": "React Basics",
  "description": "Learn React fundamentals",
  "cloudinaryPublicId": "course/react-basics",
  "courseId": "course001"
}
```

---

## 🔐 Backend – Generate Secure Video URL

### 📌 `/app/api/video-access/route.js`

```js id="api1"
export async function POST(req) {
  const { videoId } = await req.json();

  // 1. Verify user (JWT/session)
  // 2. Check course access

  // Example Cloudinary signed URL
  const url = `https://res.cloudinary.com/${process.env.CLOUD_NAME}/video/upload/${videoId}.m3u8`;

  return Response.json({ url });
}
```

---

## 🎨 Frontend Video Player

### 📌 `/app/course/[id]/page.jsx`

```jsx id="player1"
"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function VideoPlayer({ videoId }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const loadVideo = async () => {
      const res = await fetch("/api/video-access", {
        method: "POST",
        body: JSON.stringify({ videoId }),
      });

      const { url } = await res.json();

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(videoRef.current);
      } else {
        videoRef.current.src = url;
      }
    };

    loadVideo();
  }, [videoId]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        controls
        className="w-full rounded-lg"
      />

      {/* Watermark */}
      <div className="absolute top-2 left-2 text-white text-sm opacity-70">
        User: student@email.com
      </div>
    </div>
  );
}
```

---

## 🚫 Protection Layer

### Disable Right Click

```js id="sec1"
document.addEventListener("contextmenu", (e) => e.preventDefault());
```

---

### Disable DevTools Keys

```js id="sec2"
document.onkeydown = function(e) {
  if (e.keyCode === 123) return false;
};
```

---

### Hide Video URL

* Never expose raw Cloudinary URL directly in UI
* Always fetch via backend API

---

## 💧 Dynamic Watermark (IMPORTANT)

* Show:

  * Student email
  * Current time

* Move position every few seconds

Example:

```id="wm1"
User: gopi@email.com | 10:45 PM
```

---

## 🔒 Advanced Security (Cloudinary)

### Use Signed URLs

* Expire after short time

### Restrict Access

* Token-based delivery

### Optional:

* Cloudinary DRM (enterprise)

---

## 🚀 Deployment

* Use HTTPS
* Store secrets in env variables
* Protect API routes

---

## ❌ Limitations

Cannot fully prevent:

* Screen recording
* External recording
* Advanced downloading

---

## ✅ Expected Result

* Only students can access videos
* No direct download links
* Secure streaming via Cloudinary
* Watermark discourages piracy

---

## 🎯 Bonus Features

* Resume playback
* Track watch progress
* Next/Previous lesson navigation
* Auto-play next video

---

## 📌 Final Result

A professional LMS video player that:

* Streams securely
* Restricts unauthorized access
* Protects content with multiple layers
* Works like modern learning platforms

---
r