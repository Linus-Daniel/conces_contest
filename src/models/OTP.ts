// models/OTP.ts - Enhanced OTP model
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOTP extends Document {
  phoneNumber: string;
  code: string;
  projectId: string;
  expiresAt: Date;
  used: boolean;
  voteConfirmed: boolean; // New field to track if vote was actually cast
  attempts: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
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
    },
    projectId: {
      type: String,
      required: true,
      ref: "Project",
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    },
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
OTPSchema.index({ phoneNumber: 1, expiresAt: 1 });
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP: Model<IOTP> =
  mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema);

export default OTP;
