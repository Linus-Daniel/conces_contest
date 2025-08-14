import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";

export interface IVote extends Document {
  voterPhone: string;
  projectId: string;
  contestId?: string;
  ipAddress: string;
  userAgent: string;
  verified: boolean;
  votedAt: Date;
}

const VoteSchema = new Schema<IVote>({
  voterPhone: {
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
  contestId: {
    type: String,
    default: "conces-2024",
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: true,
  },
  votedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound unique index to prevent duplicate votes
VoteSchema.index({ phoneNumberHash: 1, projectId: 1 }, { unique: true });

// Static method to hash phone numbers
VoteSchema.statics.hashPhone = function (phoneNumber: string): string {
  return crypto
    .createHash("sha256")
    .update(phoneNumber + (process.env.PHONE_SALT || "conces-secret"))
    .digest("hex");
};

const Vote: Model<IVote> =
  mongoose.models.Vote || mongoose.model<IVote>("Vote", VoteSchema);

export default Vote;
