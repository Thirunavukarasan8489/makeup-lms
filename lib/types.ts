export type UserRole = "admin" | "staff" | "user";

export type TaskStatus = "pending" | "in_progress" | "completed";

export type TaskType = "course" | "client_work";

export type EnquiryType = "issue" | "feedback";

export type EnquiryStatus = "open" | "reviewing" | "closed";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
