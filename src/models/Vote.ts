// models/Vote.ts
import mongoose, { Document, Model } from "mongoose";

// Define interfaces for better type safety
interface IOtp {
  code: string;
  expiresAt: Date;
  attempts: number;
  used: boolean;
}

interface IVote extends Document {
  projectId: mongoose.Types.ObjectId;
  voterHash: string;
  voterEmail: string;
  voterPhone: string;
  ipAddress: string;
  userAgent: string;
  status: "pending" | "confirmed" | "expired";
  otp?: IOtp;
  votedAt: Date;

  // Instance methods
  verifyOTP(inputCode: string): {
    valid: boolean;
    error?: string;
    remainingAttempts?: number;
  };
  confirmVote(): Promise<IVote>;
}

interface IVoteModel extends Model<IVote> {
  getProjectStats(projectId: string): Promise<{
    totalVotes: number;
    hourlyStats: Array<{ _id: string; count: number }>;
  }>;
  cleanupExpired(): Promise<any>;
}

const OTPSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 6,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB TTL index
    },
    attempts: {
      type: Number,
      default: 0,
      max: 3,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const VoteSchema = new mongoose.Schema<IVote>(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    voterHash: {
      type: String,
      required: true,
      index: true,
    },
    voterEmail: {
      type: String,
      required: true, // This will be encrypted
    },
    voterPhone: {
      type: String,
      required: true, // This will be encrypted
    },
    ipAddress: {
      type: String,
      default: "unknown",
    },
    userAgent: {
      type: String,
      default: "unknown",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "expired"],
      default: "pending",
      index: true,
    },
    otp: {
      type: OTPSchema,
      required: function (this: IVote) {
        return this.status === "pending";
      },
    },
    votedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "votes",
  }
);

// Compound indexes for efficient queries
VoteSchema.index({ projectId: 1, voterHash: 1 }, { unique: true });
VoteSchema.index({ voterHash: 1, status: 1 });
VoteSchema.index({ status: 1, votedAt: 1 });
VoteSchema.index(
  { "otp.expiresAt": 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { status: "pending" },
  }
);

// Pre-save middleware to ensure data integrity
VoteSchema.pre<IVote>("save", function (next) {
  // Ensure confirmed votes have votedAt timestamp
  if (this.status === "confirmed" && !this.votedAt) {
    this.votedAt = new Date();
  }

  // Ensure expired votes are marked properly
  if (
    this.status === "pending" &&
    this.otp &&
    new Date() > this.otp.expiresAt
  ) {
    this.status = "expired";
  }

  next();
});

// Post-save middleware for logging
VoteSchema.post<IVote>("save", function () {
  if (this.status === "confirmed") {
    console.log(`Vote confirmed: ${this.projectId} - ${this._id}`);
  }
});

// Static method to get vote statistics
VoteSchema.statics.getProjectStats = async function (projectId: string) {
  const totalVotes = await this.countDocuments({
    projectId: new mongoose.Types.ObjectId(projectId),
    status: "confirmed",
  });

  const hourlyStats = await this.aggregate([
    {
      $match: {
        projectId: new mongoose.Types.ObjectId(projectId),
        status: "confirmed",
        votedAt: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d-%H",
            date: "$votedAt",
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return {
    totalVotes,
    hourlyStats,
  };
};

// Static method to cleanup expired sessions
VoteSchema.statics.cleanupExpired = async function () {
  const result = await this.updateMany(
    {
      status: "pending",
      "otp.expiresAt": { $lt: new Date() },
    },
    {
      $set: { status: "expired" },
    }
  );

  console.log(`Marked ${result.modifiedCount} OTP sessions as expired`);
  return result;
};

// Instance method to verify OTP
VoteSchema.methods.verifyOTP = function (inputCode: string): {
  valid: boolean;
  error?: string;
  remainingAttempts?: number;
} {
  // Check if already used
  if (this.otp.used) {
    return { valid: false, error: "OTP already used" };
  }

  // Check if expired
  if (new Date() > this.otp.expiresAt) {
    return { valid: false, error: "OTP expired" };
  }

  // Check attempt limit
  if (this.otp.attempts >= 3) {
    return { valid: false, error: "Too many attempts" };
  }

  // Verify code
  if (this.otp.code !== inputCode) {
    this.otp.attempts += 1;
    const remainingAttempts = 3 - this.otp.attempts;
    return {
      valid: false,
      error: "Invalid OTP",
      remainingAttempts,
    };
  }

  return { valid: true };
};

// Instance method to confirm vote
VoteSchema.methods.confirmVote = function (): Promise<IVote> {
  this.otp.used = true;
  this.status = "confirmed";
  this.votedAt = new Date();
  return this.save();
};

const Vote =
  (mongoose.models.Vote as IVoteModel) ||
  mongoose.model<IVote, IVoteModel>("Vote", VoteSchema);

export default Vote;
