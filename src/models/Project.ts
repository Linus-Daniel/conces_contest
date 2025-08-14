import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { IEnroll } from "./Enroll";

export interface IProject extends Document {
  candidate: Types.ObjectId | IEnroll; // Candidate is stored as an ObjectId referencing Enroll
  projectTitle: string;
  designConcept: string;
  colorPalette: string;
  inspiration: string;
  primaryFileUrl: string;
  mockupUrl?: string;
  status: "draft" | "submitted" | "reviewed" | "selected" | "rejected";
  submittedAt: Date;
  updatedAt?: Date;
  vote?: number;
  feedback?: string;
}

const ProjectSchema = new Schema<IProject>(
  {
    candidate: {
      type: Schema.Types.ObjectId,
      ref: "Enroll",
      required: [true, "Candidate ID is required"],
      index: true,
    },
    projectTitle: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [200, "Project title cannot exceed 200 characters"],
    },
    designConcept: {
      type: String,
      required: [true, "Design concept is required"],
      maxlength: [2000, "Design concept cannot exceed 2000 characters"],
    },
    colorPalette: {
      type: String,
      required: [true, "Color palette explanation is required"],
      maxlength: [
        1000,
        "Color palette explanation cannot exceed 1000 characters",
      ],
    },
    inspiration: {
      type: String,
      required: [true, "Inspiration is required"],
      maxlength: [2000, "Inspiration cannot exceed 2000 characters"],
    },
    primaryFileUrl: {
      type: String,
      required: [true, "Primary file URL is required"],
    },
    mockupUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "reviewed", "selected", "rejected"],
      default: "draft",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
    vote: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    feedback: {
      type: String,
      maxlength: [1000, "Feedback cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
ProjectSchema.index({ candidate: 1, submittedAt: -1 });
ProjectSchema.index({ status: 1 });

// Avoid recompiling model in dev/watch mode
const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
