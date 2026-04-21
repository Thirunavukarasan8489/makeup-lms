import mongoose, { Schema, models } from "mongoose";
import type { TaskStatus, TaskType } from "@/lib/types";

export type TaskDocument = {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: TaskType;
  assignedTo: mongoose.Types.ObjectId;
  status: TaskStatus;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const TaskSchema = new Schema<TaskDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["course", "client_work"],
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default models.Task ||
  mongoose.model<TaskDocument>("Task", TaskSchema);
