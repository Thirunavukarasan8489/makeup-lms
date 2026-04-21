import mongoose, { Schema, models } from "mongoose";

export type CourseDocument = {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  videos: { title: string; url: string }[];
  assignedStaff?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const VideoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const CourseSchema = new Schema<CourseDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    videos: { type: [VideoSchema], default: [] },
    assignedStaff: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default models.Course ||
  mongoose.model<CourseDocument>("Course", CourseSchema);
