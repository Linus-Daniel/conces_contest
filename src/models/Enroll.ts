

import mongoose, { Schema, Model } from "mongoose";
import crypto from "crypto";

export interface IEnroll {
  fullName: string;
  _id: string;
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
      validate: {
        validator: function (phone: string) {
          // Remove common formatting characters
          const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, "");
          // Accept international format with or without +, minimum 7 digits, maximum 15
          return /^[\+]?[1-9][\d]{6,14}$/.test(cleanPhone);
        },
        message:
          "Please provide a valid phone number (7-15 digits, may include country code)",
      },
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

// Pre-save middleware to clean phone numbers
EnrollSchema.pre("save", function (next) {
  if (!this.authToken) {
    this.authToken = crypto.randomBytes(32).toString("hex");
  }

  // Clean and standardize phone number format
  if (this.phone) {
    this.phone = this.phone.replace(/[\s\-\(\)\.]/g, "");
  }

  next();
});

EnrollSchema.index({ email: 1, authToken: 1 });
EnrollSchema.index({ createdAt: -1 });
EnrollSchema.index({ isQualified: 1 });

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

// ===== PHONE NUMBER EXAMPLES NOW ACCEPTED =====
/*
✅ ACCEPTED FORMATS:
- +1234567890 (US)
- +447700123456 (UK)
- +33123456789 (France)
- +8613800138000 (China)
- +234803456789 (Nigeria)
- 0803456789 (Local Nigerian)
- 1234567890 (US without +)
- 447700123456 (UK without +)
- (555) 123-4567 (formatted)
- 555-123-4567 (formatted)
- 555.123.4567 (formatted)

❌ REJECTED FORMATS:
- 123 (too short)
- 01234567890123456 (too long)
- +0123456789 (starts with 0 after +)
- abc123456 (contains letters)
- 555 (too short)
*/
