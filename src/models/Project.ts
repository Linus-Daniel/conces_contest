import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { IEnroll } from "./Enroll";

export interface IProject extends Document {
  candidate:  IEnroll; // Candidate is stored as an ObjectId referencing Enroll
  projectTitle: string;
  designConcept: string;
  colorPalette: string;
  inspiration: string;
  primaryFileUrls: string[];
  mockupUrls?: string[];
  status: "draft" | "submitted" | "reviewed" | "selected" | "rejected";
  submittedAt: Date;
  updatedAt?: Date;
  vote?: number;
  feedback?: string;
  votingCardEmailSent?: boolean;
  votingCardEmailSentAt?: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    candidate: {
      type: Schema.Types.ObjectId,
      ref: "Enroll",
      required: [true, "Candidate ID is required"],
      index: true,
      unique: true, // ✅ Ensure one project per candidate
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
    primaryFileUrls: [
      {
        type: String,
        required: true,
      },
    ], // Changed to array

    mockupUrls: [
      {
        type: String,
      },
    ],
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
    votingCardEmailSent: {
      type: Boolean,
      default: false,
    },
    votingCardEmailSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Create unique compound index to ensure one project per candidate
ProjectSchema.index({ candidate: 1 }, { unique: true });

// Other indexes for performance
ProjectSchema.index({ candidate: 1, submittedAt: -1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ votingCardEmailSent: 1 });

// ✅ Add error handling for duplicate submissions
ProjectSchema.post("save", function (error: any, doc: any, next: any) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    if (error.keyPattern?.candidate) {
      next(new Error("You have already submitted a project for this contest"));
    } else {
      next(error);
    }
  } else {
    next(error);
  }
});

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
