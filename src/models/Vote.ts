// models/Vote.ts - Simplified vote tracking model
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVote extends Document {
  phoneNumber: string; // Store encrypted phone number
  voterEmail?: string; // Store encrypted email for email voting
  projectId: string;
  otpId: string; // Reference to the OTP used
  ipAddress: string;
  userAgent: string;
  votedAt: Date;
}

const VoteSchema = new Schema<IVote>({
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v: string): boolean {
        return !!(v && v.length > 0);
      },
      message: 'Phone number cannot be empty'
    },
    index: true,
  },
  voterEmail: {
    type: String,
    required: false,
    index: true,
  },
  projectId: {
    type: String,
    required: [true, 'Project ID is required'],
    ref: "Project",
    index: true,
  },
  otpId: {
    type: String,
    required: [true, 'OTP ID is required'],
    ref: "OTP",
  },
  ipAddress: {
    type: String,
    required: [true, 'IP address is required'],
    default: 'unknown',
  },
  userAgent: {
    type: String,
    required: [true, 'User agent is required'],
    default: 'unknown',
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
