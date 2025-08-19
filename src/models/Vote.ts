// models/Vote.ts - Simplified vote tracking model
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVote extends Document {
  phoneNumber: string; // Store encrypted phone number
  projectId: string;
  otpId: string; // Reference to the OTP used
  ipAddress: string;
  userAgent: string;
  votedAt: Date;
}

const VoteSchema = new Schema<IVote>({
  phoneNumber: {
    type: String,
    required: true,
    index: true,
  },
  projectId: {
    type: String,
    required: true,
    ref: "Project",
    index: true,
  },
  otpId: {
    type: String,
    required: true,
    ref: "OTP",
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  votedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure one vote per phone number per project
VoteSchema.index({ phoneNumber: 1, projectId: 1 }, { unique: true });

const Vote: Model<IVote> =
  mongoose.models.Vote || mongoose.model<IVote>("Vote", VoteSchema);

export default Vote;
