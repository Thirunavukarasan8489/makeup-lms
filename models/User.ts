import mongoose, { Schema, models } from "mongoose";
import type { UserRole } from "@/lib/types";

export type UserDocument = {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
};

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "staff", "user"],
      default: "user",
      index: true,
    },
    phone: { type: String, default: "" },
    profileImage: { type: String, default: "" },
  },
  { timestamps: true },
);

export default models.User ||
  mongoose.model<UserDocument>("User", UserSchema);
