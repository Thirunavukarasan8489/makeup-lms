import mongoose, { Schema, models } from "mongoose";
import type { EnquiryStatus, EnquiryType } from "@/lib/types";

export type EnquiryDocument = {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  message: string;
  type: EnquiryType;
  status: EnquiryStatus;
  createdAt: Date;
  updatedAt: Date;
};

const EnquirySchema = new Schema<EnquiryDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["issue", "feedback"],
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "reviewing", "closed"],
      default: "open",
    },
  },
  { timestamps: true },
);

export default models.Enquiry ||
  mongoose.model<EnquiryDocument>("Enquiry", EnquirySchema);
