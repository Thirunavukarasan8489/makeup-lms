import mongoose, { Schema, models } from "mongoose";

export type EnrollmentDocument = {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  progress: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const EnrollmentSchema = new Schema<EnrollmentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default models.Enrollment ||
  mongoose.model<EnrollmentDocument>("Enrollment", EnrollmentSchema);
