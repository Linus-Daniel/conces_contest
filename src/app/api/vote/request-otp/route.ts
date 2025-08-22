// api/vote/request-otp/route.ts - Enhanced with proper phone/OTP validation
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import OTP from "@/models/OTP";
import Vote from "@/models/Vote";
import crypto from "crypto";
import axios from "axios";

class WhatsAppService {
  private accessToken: string;
  private phoneNumberId: string;
  private baseUrl: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN!;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
    this.baseUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
  }

  async sendOTPTemplate(
    phoneNumber: string,
    code: string
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
    debugInfo?: any;
  }> {
    try {
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;

      console.log("=== WhatsApp OTP Send Attempt ===");
      console.log("Phone Number:", formattedPhone);
      console.log("OTP Code:", code);

      const requestPayload = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",
        template: {
          name: "conces_contest",
          language: {
            code: "en_US",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: code,
                },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [
                {
                  type: "text",
                  text: code,
                },
              ],
            },
          ],
        },
      };

      const response = await axios.post(this.baseUrl, requestPayload, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
        validateStatus: function (status) {
          return true;
        },
      });

      console.log("=== WhatsApp API Response ===");
      console.log("Status:", response.status);
      console.log("Response Data:", JSON.stringify(response.data, null, 2));

      if (
        response.status === 200 &&
        response.data.messages &&
        response.data.messages[0]
      ) {
        return {
          success: true,
          messageId: response.data.messages[0].id,
          debugInfo: response.data,
        };
      } else {
        const errorMessage =
          response.data.error?.message ||
          response.data.error?.error_user_msg ||
          "Unknown WhatsApp API error";

        return {
          success: false,
          error: errorMessage,
          debugInfo: {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
          },
        };
      }
    } catch (error: any) {
      console.error("=== WhatsApp Service Exception ===");
      console.error("Error:", error.message);

      if (error.response) {
        return {
          success: false,
          error: error.response.data?.error?.message || error.message,
          debugInfo: {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
          },
        };
      } else if (error.request) {
        return {
          success: false,
          error: "No response from WhatsApp API - Network error",
          debugInfo: {
            message: error.message,
            code: error.code,
          },
        };
      } else {
        return {
          success: false,
          error: error.message || "WhatsApp service error",
          debugInfo: {
            message: error.message,
            stack: error.stack,
          },
        };
      }
    }
  }
}

// Utility functions
function encrypt(text: string): string {
  const algorithm = "aes-256-gcm";
  const keyString =
    process.env.ENCRYPTION_KEY || "your-32-char-secret-key-here123";
  const key = crypto.createHash("sha256").update(keyString).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted;
}

function validateNigerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  const patterns = [
    /^234[789]\d{9}$/, // Full international format
    /^0[789]\d{9}$/, // Local format with 0
    /^[789]\d{9}$/, // Local format without 0
  ];
  return patterns.some((pattern) => pattern.test(cleaned));
}

function formatNigerianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("234")) {
    return `+${cleaned}`;
  }

  if (cleaned.startsWith("0")) {
    return `+234${cleaned.slice(1)}`;
  }

  if (cleaned.length === 10 && /^[789]/.test(cleaned)) {
    return `+234${cleaned}`;
  }

  return phone;
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(phoneNumber: string): {
  allowed: boolean;
  retryAfter?: number;
} {
  const now = Date.now();
  const windowSize = 120000; // 2 minutes
  const maxAttempts = 1;

  const entry = rateLimitStore.get(phoneNumber);

  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(phoneNumber, {
      count: 1,
      resetTime: now + windowSize,
    });
    return { allowed: true };
  }

  if (entry.count >= maxAttempts) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}

// Enhanced phone/OTP validation function
async function validatePhoneAndOTPStatus(
  formattedPhone: string,
  encryptedPhone: string,
  projectId: string
) {
  console.log("=== Starting Phone/OTP Validation ===");

  // 1. Check if this phone number has already voted for this project
  const existingVote = await Vote.findOne({
    phoneNumber: encryptedPhone,
    projectId,
  });

  if (existingVote) {
    console.log("❌ Phone number already voted for this project");
    return {
      canSendOTP: false,
      reason: "ALREADY_VOTED",
      message:
        "This phone number has already voted for this project. Each phone number can only vote once.",
    };
  }

  // 2. Check if this phone number has any confirmed votes (used OTP that resulted in vote)
  const confirmedOTP = await OTP.findOne({
    phoneNumber: formattedPhone,
    projectId,
    used: true,
    voteConfirmed: true,
  });

  if (confirmedOTP) {
    console.log("❌ Phone number has confirmed vote via OTP");
    return {
      canSendOTP: false,
      reason: "VOTE_CONFIRMED",
      message:
        "This phone number has already been used to vote for this project.",
    };
  }

  // 3. Check for active (unused and not expired) OTPs
  const activeOTP = await OTP.findOne({
    phoneNumber: formattedPhone,
    projectId,
    used: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (activeOTP) {
    const expiresIn = Math.floor(
      (activeOTP.expiresAt.getTime() - Date.now()) / 1000
    );
    console.log("⚠️ Active OTP found, expires in:", expiresIn, "seconds");

    return {
      canSendOTP: false,
      reason: "ACTIVE_OTP_EXISTS",
      message: `A verification code was recently sent to your WhatsApp. Please check your messages or wait ${Math.ceil(
        expiresIn / 60
      )} minute(s) to request a new code.`,
      expiresIn,
      sessionId: activeOTP._id,
      resendAvailable: expiresIn < 60, // Allow resend if less than 1 minute remaining
    };
  }

  // 4. Clean up expired OTPs for this phone/project combination (optional housekeeping)
  const expiredOTPs = await OTP.find({
    phoneNumber: formattedPhone,
    projectId,
    used: false,
    expiresAt: { $lt: new Date() },
  });

  if (expiredOTPs.length > 0) {
    console.log(`🧹 Found ${expiredOTPs.length} expired OTPs for cleanup`);
    // Note: We keep expired OTPs as per your requirement, just logging for awareness
  }

  console.log("✅ Phone validation passed - can send new OTP");
  return {
    canSendOTP: true,
    reason: "VALIDATION_PASSED",
  };
}

// Main POST handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, voterPhone } = body;

    console.log("\n=== New OTP Request ===");
    console.log("Project ID:", projectId);
    console.log("Voter Phone:", voterPhone);
    console.log("Timestamp:", new Date().toISOString());

    // Validate input
    if (!projectId || !voterPhone) {
      console.error("Missing required fields");
      return NextResponse.json(
        {
          error: "Missing information",
          message:
            "Please provide both project ID and phone number to continue",
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
          message:
            "Please provide a valid Nigerian phone number (e.g., 08012345678, +2348012345678, or 8012345678)",
        },
        { status: 400 }
      );
    }

    const formattedPhone = formatNigerianPhone(voterPhone);
    console.log("Formatted Phone:", formattedPhone);

    const encryptedPhone = encrypt(formattedPhone);
    console.log("Phone encrypted for vote checking");

    // Check rate limit
    const rateLimitResult = checkRateLimit(formattedPhone);
    if (!rateLimitResult.allowed) {
      console.warn("Rate limit exceeded for phone:", formattedPhone);
      return NextResponse.json(
        {
          error: "Too many requests",
          message: `Please wait ${rateLimitResult.retryAfter} seconds before requesting another code.`,
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      );
    }

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

    // Comprehensive phone/OTP validation
    const validationResult = await validatePhoneAndOTPStatus(
      formattedPhone,
      encryptedPhone,
      projectId
    );

    if (!validationResult.canSendOTP) {
      const statusCode =
        validationResult.reason === "ALREADY_VOTED" ||
        validationResult.reason === "VOTE_CONFIRMED"
          ? 409
          : validationResult.reason === "ACTIVE_OTP_EXISTS"
          ? 400
          : 400;

      return NextResponse.json(
        {
          error: validationResult.reason.toLowerCase().replace(/_/g, " "),
          message: validationResult.message,
          ...(validationResult.expiresIn && {
            expiresIn: validationResult.expiresIn,
          }),
          ...(typeof validationResult.sessionId !== "undefined"
            ? { sessionId: validationResult.sessionId }
            : {}),
          ...(validationResult.resendAvailable !== undefined && {
            resendAvailable: validationResult.resendAvailable,
          }),
        },
        { status: statusCode }
      );
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    console.log("Generated OTP:", otpCode);
    console.log("Expires at:", expiresAt.toISOString());

    // Get request metadata
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create OTP record
    const newOTP = new OTP({
      phoneNumber: formattedPhone, // Store plain phone for OTP matching
      code: otpCode,
      projectId,
      expiresAt,
      used: false,
      voteConfirmed: false,
      attempts: 0,
      ipAddress,
      userAgent,
    });

    console.log("Saving new OTP to database...");
    await newOTP.save();
    console.log("OTP saved to database with ID:", newOTP._id);

    // Send WhatsApp message
    console.log("Attempting to send WhatsApp message...");
    const whatsAppService = new WhatsAppService();
    const whatsAppResult = await whatsAppService.sendOTPTemplate(
      formattedPhone,
      otpCode
    );

    if (!whatsAppResult.success) {
      // Delete OTP if WhatsApp sending failed
      await OTP.deleteOne({ _id: newOTP._id });
      console.error("Failed to send WhatsApp, OTP deleted from database");

      return NextResponse.json(
        {
          error: "Message delivery failed",
          message:
            "We couldn't send the verification code to your WhatsApp. Please check if your number is registered with WhatsApp and try again.",
          details:
            process.env.NODE_ENV === "development"
              ? { whatsAppError: whatsAppResult.error }
              : undefined,
        },
        { status: 500 }
      );
    }

    console.log("✅ OTP sent successfully via WhatsApp!");
    console.log("Message ID:", whatsAppResult.messageId);

    // Prepare success response
    const maskedPhone = formattedPhone.replace(
      /(\+234)(\d{3})(\d{3})(\d{4})/,
      "$1$2***$4"
    );

    const response: any = {
      success: true,
      message: "Verification code sent to your WhatsApp",
      sessionId: newOTP._id,
      expiresIn: 300, // 5 minutes in seconds
      phoneNumber: maskedPhone,
      projectTitle: project.projectTitle,
      messageId: whatsAppResult.messageId,
    };

    // Add debug info in development
    if (process.env.NODE_ENV === "development") {
      response.devCode = otpCode;
      response.debugInfo = {
        formattedPhone,
        otpCode,
      };
      console.log(`[DEV MODE] OTP Code: ${otpCode}`);
    }

    console.log("=== Request Completed Successfully ===\n");
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("=== Unexpected Error in OTP Request ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);

    return NextResponse.json(
      {
        error: "Something went wrong",
        message:
          "We encountered an unexpected error while processing your request. Please try again in a few moments.",
        details:
          process.env.NODE_ENV === "development"
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
