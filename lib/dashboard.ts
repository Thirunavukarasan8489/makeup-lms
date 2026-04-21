import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Enquiry from "@/models/Enquiry";
import Task from "@/models/Task";
import User from "@/models/User";

export async function getAdminCounts() {
  try {
    await connectDB();
    const [users, staff, courses, tasks, enquiries] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "staff" }),
      Course.countDocuments(),
      Task.countDocuments(),
      Enquiry.countDocuments(),
    ]);

    return { users, staff, courses, tasks, enquiries };
  } catch {
    return { users: 0, staff: 0, courses: 0, tasks: 0, enquiries: 0 };
  }
}

export async function getUsers(role?: string) {
  try {
    await connectDB();
    return User.find(role ? { role } : {})
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();
  } catch {
    return [];
  }
}

export async function getCourses() {
  try {
    await connectDB();
    return Course.find()
      .populate("assignedStaff", "name email")
      .sort({ createdAt: -1 })
      .lean();
  } catch {
    return [];
  }
}

export async function getTasks(staffId?: string) {
  try {
    await connectDB();
    return Task.find(staffId ? { assignedTo: staffId } : {})
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .lean();
  } catch {
    return [];
  }
}

export async function getEnrollments(userId?: string) {
  try {
    await connectDB();
    return Enrollment.find(userId ? { userId } : {})
      .populate("courseId", "title description videos")
      .sort({ updatedAt: -1 })
      .lean();
  } catch {
    return [];
  }
}

export async function getCertificates(userId?: string) {
  try {
    await connectDB();
    return Certificate.find(userId ? { userId } : {})
      .populate("courseId", "title")
      .sort({ createdAt: -1 })
      .lean();
  } catch {
    return [];
  }
}

export async function getEnquiries(userId?: string) {
  try {
    await connectDB();
    return Enquiry.find(userId ? { userId } : {})
      .sort({ createdAt: -1 })
      .lean();
  } catch {
    return [];
  }
}
