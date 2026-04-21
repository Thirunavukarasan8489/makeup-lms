# 💄 Makeup Learning Management System (LMS)

## 📌 Project Overview

Build a **Makeup Learning Management System (LMS)** where users can learn makeup courses, staff can manage assigned tasks, and admin controls the entire system.

The application must be built using **Next.js (Full Stack)**:

* Frontend: Next.js (App Router) + Tailwind CSS
* Backend: Next.js API Routes / Server Actions
* Database: MongoDB with Mongoose
* Authentication: JWT / NextAuth (Role-based)

---

## 👥 User Roles

### 1. Admin

* Full control over system
* Manage users, staff, courses, and tasks

### 2. Staff

* View assigned tasks
* Update task status

### 3. User (Student)

* Enroll and learn courses
* View certificate after completion
* Submit enquiry/feedback

---

## 🧱 Core Features

### 🔐 Authentication & Authorization

* Register/Login system
* Role-based access (Admin / Staff / User)
* Secure routes using middleware

---

## 🧑‍💼 Admin Features

### Dashboard

* Overview: total users, staff, courses, tasks

### User Management

* View all users
* Add / Update / Delete users & staff

### Staff Management

* View all staff
* Assign roles

### Course Management

* Create course
* Upload videos & content
* Assign staff to course

### Task Management

* Assign staff to:

  * Teaching course
  * Client makeup work
* Track task status

---

## 👨‍🏫 Staff Features

### Dashboard

* View assigned tasks

### Profile

* View own details (read-only)

### Task Handling

* See assigned tasks
* Update task status:

  * Pending → In Progress → Completed

---

## 👩‍🎓 User Features

### Dashboard

* View enrolled courses

### Course Learning

* Watch videos
* Track progress

### Certificate

* View & download certificate after completion

### Enquiry / Feedback

* Submit issues or feedback form

---

## 🗂️ Database Schema (MongoDB)

### Users

* name
* email
* password
* role (admin / staff / user)
* phone
* profileImage

### Courses

* title
* description
* videos (title, url)
* assignedStaff
* createdBy

### Enrollments

* userId
* courseId
* progress
* isCompleted

### Tasks

* title
* description
* type (course / client_work)
* assignedTo (staff)
* status (pending / in_progress / completed)

### Certificates

* userId
* courseId
* certificateUrl

### Enquiries

* userId
* message
* type (issue / feedback)
* status

---

## 🏗️ Folder Structure (Next.js App Router)

```
/app
  /(auth)
    /login
    /register

  /admin
    /dashboard
    /users
    /staff
    /courses
    /tasks

  /staff
    /dashboard
    /tasks

  /user
    /dashboard
    /courses
    /certificate
    /enquiry

/lib
  db.js
  auth.js

/models
  User.js
  Course.js
  Enrollment.js
  Task.js
  Certificate.js
  Enquiry.js

/app/api
  /auth
  /users
  /courses
  /tasks
  /enrollments
  /enquiries
```

---

## 🔌 API Endpoints

### Auth

* POST /api/auth/register
* POST /api/auth/login

### Users

* GET /api/users
* POST /api/users
* PUT /api/users/:id
* DELETE /api/users/:id

### Courses

* POST /api/courses
* GET /api/courses
* GET /api/courses/:id

### Tasks

* POST /api/tasks
* GET /api/tasks
* PUT /api/tasks/:id/status

### Enrollments

* POST /api/enroll
* GET /api/enrollments

### Enquiries

* POST /api/enquiry
* GET /api/enquiry

---

## 🎨 UI Requirements

* Clean and modern UI
* Use Tailwind CSS
* Responsive design (mobile + desktop)
* Role-based dashboards

---

## 🔐 Security Requirements

* Password hashing (bcrypt)
* JWT authentication
* Role-based middleware protection
* Secure API routes

---

## ☁️ Storage

* Store videos in:

  * Cloudinary / AWS S3
* Store certificate PDFs

---

## 🚀 Optional Advanced Features

* Email notification (Welcome mail, task assigned)
* WhatsApp integration
* Analytics dashboard
* Video progress tracking (per lesson)
* Admin reports

---

## ✅ Deliverables

* Fully working Next.js full-stack LMS
* Clean code structure
* Scalable architecture
* Ready for deployment (Vercel + MongoDB Atlas)

---

## 🎯 Goal

Create a **scalable, secure, and user-friendly Makeup LMS platform** that supports:

* Learning
* Task management
* Business operations (client work)

---

## Implementation Update - 2026-04-21

Completed the initial full-stack LMS foundation in this Next.js app.

### Done

* Replaced the starter page with a Makeup LMS landing page.
* Added login and register pages with role-based redirects.
* Added JWT cookie authentication using `jose`.
* Added password hashing using `bcryptjs`.
* Added MongoDB/Mongoose connection handling.
* Added Mongoose models:
  * User
  * Course
  * Enrollment
  * Task
  * Certificate
  * Enquiry
* Added protected route handling using the Next.js 16 `proxy.ts` convention.
* Added admin dashboard and management pages:
  * Dashboard
  * Users
  * Staff
  * Courses
  * Tasks
* Added staff pages:
  * Dashboard
  * My Tasks
  * Task status updates
* Added student pages:
  * Dashboard
  * Courses and enrollment
  * Certificates
  * Enquiry and feedback
* Added API routes:
  * `POST /api/auth/register`
  * `POST /api/auth/login`
  * `GET /api/auth/me`
  * `POST /api/auth/logout`
  * `GET /api/users`
  * `POST /api/users`
  * `PUT /api/users/[id]`
  * `DELETE /api/users/[id]`
  * `GET /api/courses`
  * `POST /api/courses`
  * `GET /api/courses/[id]`
  * `GET /api/tasks`
  * `POST /api/tasks`
  * `PUT /api/tasks/[id]/status`
  * `POST /api/enroll`
  * `GET /api/enrollments`
  * `GET /api/enquiry`
  * `POST /api/enquiry`
* Added runtime dependencies:
  * `bcryptjs`
  * `jose`
  * `mongoose`

### Verification

* `npm install` completed and updated `package-lock.json`.
* `npm run build` completed successfully.
* `npm run lint` completed successfully before the final proxy/db cleanup.
* A final lint rerun was requested but not approved; the production build still passed TypeScript and compilation after the final changes.

### Notes

* `.env` currently contains `MONGO_URI=mongodb://0.0.0.0:27017/makeup-lms`.
* Add `JWT_SECRET` to `.env` before production deployment.
* Video and certificate file upload storage is scaffolded by URL fields; Cloudinary/AWS upload integration is still a future enhancement.

### Security Fix - Auth Forms

* Updated login/register forms to use `method="post"` and API form actions so credentials are not exposed in query parameters if client-side JavaScript is not ready.
* Login/register still submit JSON request bodies during normal client-side use.
* Auth APIs now also accept form request bodies as a safe fallback.
* Browser form fallback submissions now redirect to the correct role dashboard instead of showing raw API JSON.
* Client-side auth success responses now include `redirectTo`, use same-origin credentials, and perform a full-page dashboard navigation so the new auth cookie is present.
* Login/register pages now redirect already-authenticated users away from auth screens and into their role dashboard.

### Dashboard UI Update

* Replaced top dashboard navigation with a role-aware left side drawer.
* Added desktop collapse/expand behavior with smooth width and content transitions.
* Added mobile slide-in drawer with overlay and automatic close on route change.
* Dashboard navigation is now shared across admin, staff, and student pages.
* Added a drawer logout button that clears the auth cookie and returns users to login.
* Replaced placeholder drawer letters with relevant SVG icons for dashboard, users, staff, courses, tasks, certificates, enquiries, and logout.

### Toast Notifications

* Added `react-toastify` for success and failure messages.
* Added a global toast container in the root layout.
* Replaced inline form messages with toast notifications for auth, CRUD forms, enrollment, task updates, and logout.

### Task Management Update

* Admin task assignment now shows a staff dropdown populated with staff names and emails.
* Task cards now show the assigned staff member name and email.
