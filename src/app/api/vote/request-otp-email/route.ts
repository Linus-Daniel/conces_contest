import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import OTP from "@/models/OTP";
import Vote from "@/models/Vote";
import Enroll from "@/models/Enroll";
import crypto from "crypto";
import { generateOTP, validateEmail, validateNigerianPhone, normalizePhoneNumber } from "@/lib/emailOTP";
import { sendVotingOTPEmailWithResend } from "@/lib/email/resendService";

// Utility functions
function encrypt(text: string): string {
  const algorithm = "aes-256-gcm";
  const keyString = process.env.ENCRYPTION_KEY || "your-32-char-secret-key-here123";
  const key = crypto.createHash("sha256").update(keyString).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted;
}

// Enhanced phone/email validation function
async function validateUserAndOTPStatus(
  email: string,
  formattedPhone: string,
  encryptedEmail: string,
  encryptedPhone: string,
  projectId: string
) {
  console.log("=== Starting User/OTP Validation ===");

  // 1. Check if email already exists in Enroll model
  const existingEmailUser = await Enroll.findOne({ email: encryptedEmail });
  
  // 2. Check if phone already exists in Enroll model  
  const existingPhoneUser = await Enroll.findOne({ phoneNumber: encryptedPhone });

  if (existingEmailUser || existingPhoneUser) {
    console.log("❌ Email or phone number already registered");
    return {
      canSendOTP: false,
      reason: "USER_EXISTS",
      message: "This email or phone number is already registered. Each person can only vote once.",
    };
  }

  // 3. Check if this email has already voted for this project
  const existingEmailVote = await Vote.findOne({
    voterEmail: encryptedEmail,
  });

  if (existingEmailVote) {
    console.log("❌ Email already voted for this project");
    return {
      canSendOTP: false,
      reason: "ALREADY_VOTED_EMAIL",
      message: "This email has already been used to vote. Each email can only vote once.",
    };
  }

  // 4. Check if this phone number has already voted for this project
  const existingPhoneVote = await Vote.findOne({
    phoneNumber: encryptedPhone,
  });

  if (existingPhoneVote) {
    console.log("❌ Phone number already voted for this project");
    return {
      canSendOTP: false,
      reason: "ALREADY_VOTED_PHONE",
      message: "This phone number has already been used to vote. Each phone number can only vote once.",
    };
  }

  // 5. Check for ANY existing OTP for this email/phone combination
  const existingOTP = await OTP.findOne({
    $or: [
      { email: email },
      { phoneNumber: formattedPhone }
    ]
  }).sort({ createdAt: -1 });

  if (existingOTP) {
    if (existingOTP.used) {
      console.log("❌ Email or phone already has a used OTP");
      return {
        canSendOTP: false,
        reason: "OTP_ALREADY_USED",
        message: "This email or phone number has already been used to vote.",
      };
    } else {
      console.log("⚠️ Email or phone already has an unused OTP");
      return {
        canSendOTP: false,
        reason: "UNUSED_OTP_EXISTS",
        message: "An unused verification code already exists for this email or phone number. Please use the existing code or contact support.",
        sessionId: existingOTP._id,
      };
    }
  }

  console.log("✅ User validation passed - can send new OTP");
  return {
    canSendOTP: true,
    reason: "VALIDATION_PASSED",
  };
}

// Main POST handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, voterEmail, voterPhone } = body;

    console.log("\n=== New Email OTP Request ===");
    console.log("Project ID:", projectId);
    console.log("Voter Email:", voterEmail);
    console.log("Voter Phone:", voterPhone);
    console.log("Timestamp:", new Date().toISOString());

    // Validate input
    if (!projectId || !voterEmail || !voterPhone) {
      console.error("Missing required fields");
      return NextResponse.json(
        {
          error: "Missing information",
          message: "Please provide project ID, email, and phone number to continue",
        },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(voterEmail)) {
      console.error("Invalid email format:", voterEmail);
      return NextResponse.json(
        {
          error: "Invalid email",
          message: "Please provide a valid email address",
        },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!validateNigerianPhone(voterPhone)) {
      console.error("Invalid phone number format:", voterPhone);
      return NextResponse.json(
        {
          error: "Invalid phone number",
          message: "Please provide a valid Nigerian phone number (e.g., 08012345678, +2348012345678, or 8012345678)",
        },
        { status: 400 }
      );
    }

    const formattedPhone = normalizePhoneNumber(voterPhone);
    const normalizedEmail = voterEmail.toLowerCase().trim();
    console.log("Formatted Phone:", formattedPhone);
    console.log("Normalized Email:", normalizedEmail);

    const encryptedEmail = encrypt(normalizedEmail);
    const encryptedPhone = encrypt(formattedPhone);
    console.log("Email and phone encrypted for validation");

    // Connect to database
    await connectDB();
    console.log("Database connected");

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      console.error("Project not found:", projectId);
      return NextResponse.json(
        {
          error: "Project not found",
          message: "The voting project you're trying to access doesn't exist",
        },
        { status: 404 }
      );
    }
    console.log("Project found:", project.projectTitle);

    // Comprehensive user/OTP validation
    const validationResult = await validateUserAndOTPStatus(
      normalizedEmail,
      formattedPhone,
      encryptedEmail,
      encryptedPhone,
      projectId
    );

    if (!validationResult.canSendOTP) {
      const statusCode = validationResult.reason === "USER_EXISTS" ||
        validationResult.reason.includes("ALREADY_VOTED") ||
        validationResult.reason === "OTP_ALREADY_USED" ? 409 : 400;

      return NextResponse.json(
        {
          error: validationResult.reason.toLowerCase().replace(/_/g, " "),
          message: validationResult.message,
          ...(typeof validationResult.sessionId !== "undefined"
            ? { sessionId: validationResult.sessionId }
            : {}),
        },
        { status: statusCode }
      );
    }

    // Generate new OTP
    const otpCode = generateOTP();
    console.log("Generated OTP:", otpCode);

    // Get request metadata
    const ipAddress = request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create OTP record
    const newOTP = new OTP({
      email: normalizedEmail,
      phoneNumber: formattedPhone,
      code: otpCode,
      projectId,
      used: false,
      voteConfirmed: false,
      attempts: 0,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
    });

    console.log("Saving new OTP to database...");
    await newOTP.save();
    console.log("OTP saved to database with ID:", newOTP._id);

    // Send email with OTP using Resend
    console.log("Attempting to send email OTP via Resend...");
    const emailResult = await sendVotingOTPEmailWithResend(
      normalizedEmail,
      otpCode,
      project.projectTitle
    );

    if (!emailResult.success) {
      // Delete OTP if email sending failed
      await OTP.deleteOne({ _id: newOTP._id });
      console.error("Failed to send email, OTP deleted from database");

      return NextResponse.json(
        {
          error: "Email delivery failed",
          message: "We couldn't send the verification code to your email. Please check your email address and try again.",
          details: process.env.NODE_ENV === "development"
            ? { emailError: emailResult.error }
            : undefined,
        },
        { status: 500 }
      );
    }

    console.log("✅ OTP sent successfully via email!");

    // Prepare success response
    const maskedEmail = normalizedEmail.replace(
      /(.{2})(.*)(@.*)/, 
      "$1***$3"
    );

    const response: any = {
      success: true,
      message: "Verification code sent to your email. Please check your inbox.",
      sessionId: newOTP._id,
      email: maskedEmail,
      projectTitle: project.projectTitle,
      expiresIn: 300, // 5 minutes
    };

    // Add debug info in development
    if (process.env.NODE_ENV === "development") {
      response.devCode = otpCode;
      response.debugInfo = {
        normalizedEmail,
        formattedPhone,
        otpCode,
      };
      console.log(`[DEV MODE] OTP Code: ${otpCode}`);
    }

    console.log("=== Email OTP Request Completed Successfully ===\n");
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("=== Unexpected Error in Email OTP Request ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);

    return NextResponse.json(
      {
        error: "Something went wrong",
        message: "We encountered an unexpected error while processing your request. Please try again in a few moments.",
        details: process.env.NODE_ENV === "development"
          ? {
              message: error.message,
              timestamp: new Date().toISOString(),
            }
          : undefined,
      },
      { status: 500 }
    );
  }
}