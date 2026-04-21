import mongoose, { Schema, models } from "mongoose";

export type CertificateDocument = {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  certificateUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

const CertificateSchema = new Schema<CertificateDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    certificateUrl: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

CertificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default models.Certificate ||
  mongoose.model<CertificateDocument>("Certificate", CertificateSchema);
