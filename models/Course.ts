import mongoose, { Schema, models } from "mongoose";

export type CourseDocument = {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  videos: {
    _id: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    key?: string;
    publicId?: string;
    url: string;
    contentType?: string;
    size?: number;
    uploadedAt?: Date;
  }[];
  assignedStaff?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const VideoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    key: { type: String, trim: true },
    publicId: { type: String, trim: true },
    url: { type: String, required: true, trim: true },
    contentType: { type: String, trim: true },
    size: { type: Number, min: 0 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true },
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
