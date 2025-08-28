// models/OTP.ts - Modified OTP model with no expiry
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOTP extends Document {
  phoneNumber: string;
  code: string;
  projectId: string;
  used: boolean;
  voteConfirmed: boolean; // Track if vote was actually cast
  attempts: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  // Removed expiresAt field since OTPs don't expire
}

const OTPSchema = new Schema<IOTP>(
  {
    phoneNumber: {
      type: String,
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      index: true, // Added index for faster lookups
    },
    projectId: {
      type: String,
      required: true,
      ref: "Project",
      index: true,
    },
    // Removed expiresAt field - OTPs don't expire
    used: {
      type: Boolean,
      default: false,
      index: true,
    },
    voteConfirmed: {
      type: Boolean,
      default: false,
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 3,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
OTPSchema.index({ phoneNumber: 1, projectId: 1 });
OTPSchema.index({ phoneNumber: 1, used: 1, voteConfirmed: 1 });
OTPSchema.index({ code: 1, used: 1 }); // For OTP code verification
OTPSchema.index({ projectId: 1, used: 1 }); // For project-based queries

// Ensure one OTP per phone number per project (strict one-time rule)
OTPSchema.index({ phoneNumber: 1, projectId: 1 }, { unique: true });

// Removed TTL index since OTPs don't expire
// OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP: Model<IOTP> =
  mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema);

export default OTP;