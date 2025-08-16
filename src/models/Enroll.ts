import mongoose, { Schema, Model } from "mongoose";
import crypto from "crypto";

export interface IEnroll {
  fullName: string;
  _id:string;
  email: string;
  phone: string;
  institution: string;
  department: string;
  matricNumber: string;
  authToken: string;
  avatar: string;
  agreeToTerms: boolean;
  isQualified: boolean;
  contestPack: {
    sent: boolean;
    sentAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EnrollSchema = new Schema<IEnroll>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    avatar: {
      type: String,
      required: [true, "Avatar is required"],
      trim: true,
      match: [
        /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/,
        "Please provide a valid image URL",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
      index: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [
        /^(\+234|0)[789]\d{9}$/,
        "Please provide a valid Nigerian phone number",
      ],
    },
    institution: {
      type: String,
      required: [true, "School name is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    matricNumber: {
      type: String,
      required: [true, "Matric number is required"],
      trim: true,
      uppercase: true,
    },
    authToken: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      default: function () {
        return crypto.randomBytes(32).toString("hex");
      },
    },
    agreeToTerms: {
      type: Boolean,
      required: [true, "You must accept the terms and conditions"],
      validate: {
        validator: function (v: boolean) {
          return v === true;
        },
        message: "You must accept the terms and conditions",
      },
    },
    isQualified: {
      type: Boolean,
      default: true,
      required: true,
    },
    contestPack: {
      sent: {
        type: Boolean,
        default: false,
      },
      sentAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

EnrollSchema.index({ email: 1, authToken: 1 });
EnrollSchema.index({ createdAt: -1 });
EnrollSchema.index({ isQualified: 1 });

EnrollSchema.pre("save", function (next) {
  if (!this.authToken) {
    this.authToken = crypto.randomBytes(32).toString("hex");
  }
  next();
});

EnrollSchema.post("save", function (error: any, doc: any, next: any) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    if (error.keyPattern?.email) {
      next(new Error("This email is already registered for the contest"));
    } else if (error.keyPattern?.authToken) {
      // Retry with new token
      this.authToken = crypto.randomBytes(32).toString("hex");
      this.save();
    } else {
      next(error);
    }
  } else {
    next(error);
  }
});

// Ensure model is not re-compiled
const Enroll: Model<IEnroll> =
  mongoose.models.Enroll || mongoose.model<IEnroll>("Enroll", EnrollSchema);

export default Enroll;
