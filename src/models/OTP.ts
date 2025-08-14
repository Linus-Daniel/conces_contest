import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOTP extends Document {
  phoneNumber: string;
  code: string;
  projectId?: string;
  expiresAt: Date;
  used: boolean;
  attempts: number;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>({
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
    ref: "Project",
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  },
  used: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Auto-delete after 10 minutes
  },
});

// Index for faster lookups
OTPSchema.index({ phoneNumber: 1, code: 1 });
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP: Model<IOTP> =
  mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema);

export default OTP;
