import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject extends Document {
  candidateId: string;
  projectTitle: string;
  designConcept: string;
  colorPalette: string;
  inspiration: string;
  primaryFileUrl: string;
  mockupUrl?: string;
  status: "draft" | "submitted" | "reviewed" | "selected" | "rejected";
  submittedAt: Date;
  updatedAt?: Date;
  score?: number;
  feedback?: string;
}

const ProjectSchema = new Schema<IProject>(
  {
    candidateId: {
      type: String,
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
      required: false,
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
    score: {
      type: Number,
      min: 0,
      max: 100,
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

// Indexes for better query performance
ProjectSchema.index({ candidateId: 1, submittedAt: -1 });
ProjectSchema.index({ status: 1 });

// Prevent multiple model compilation in development
const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
