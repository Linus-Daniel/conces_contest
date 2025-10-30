// api/vote/request-otp/route.ts - Modified for no expiry, one-time use only
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import OTP from "@/models/OTP";
import Vote from "@/models/Vote";
import crypto from "crypto";
import axios from "axios";
import { detectBotAttack } from "@/lib/antiBot";

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
          name: "otp_verificaton",
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

// Rate limiting store (optional - can be removed if not needed)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();


// Enhanced phone/OTP validation function - MODIFIED for no expiry, one-time use
async function validatePhoneAndOTPStatus(
  formattedPhone: string,
  encryptedPhone: string,
  projectId: string
) {
  console.log("=== Starting Phone/OTP Validation ===");

  // 1. GLOBAL CHECK: Has this phone number already voted for ANY project?
  const existingVote = await Vote.findOne({
    phoneNumber: encryptedPhone,
  });

  if (existingVote) {
    console.log("❌ Phone number already voted globally");
    return {
      canSendOTP: false,
      reason: "ALREADY_VOTED",
      message:
        "This phone number has already been used to vote. Each phone number can only vote once globally.",
    };
  }

  // 2. GLOBAL CHECK: Has this phone number been used for any confirmed vote via OTP?
  const confirmedOTP = await OTP.findOne({
    phoneNumber: formattedPhone,
    used: true,
    voteConfirmed: true,
  });

  if (confirmedOTP) {
    console.log("❌ Phone number has confirmed vote via OTP globally");
    return {
      canSendOTP: false,
      reason: "VOTE_CONFIRMED",
      message:
        "This phone number has already been used to vote and cannot request another OTP.",
    };
  }

  // 3. Check for ANY existing OTP (used or unused) for this phone/project combination
  // Since we don't want to allow multiple OTPs for the same phone number
  const existingOTP = await OTP.findOne({
    phoneNumber: formattedPhone,
  }).sort({ createdAt: -1 });

  if (existingOTP) {
    if (existingOTP.used) {
      console.log("❌ Phone number already has a used OTP");
      return {
        canSendOTP: false,
        reason: "OTP_ALREADY_USED",
        message:
          "This phone number has been used, cannot request another one OTP.",
      };
    } else {
      console.log("⚠️ Phone number already has an unused OTP");
      return {
        canSendOTP: false,
        reason: "UNUSED_OTP_EXISTS",
        message:
          "An unused verification code already exists for this phone number. Please use the existing code or contact support if you need assistance.",
        sessionId: existingOTP._id,
      };
    }
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
    // 🛡️ ANTI-BOT PROTECTION: Check for automated scripts
    const botCheck = detectBotAttack(request);
    if (botCheck.isBot) {
      console.log(`🚨 BOT ATTACK BLOCKED: ${botCheck.reason} from IP: ${botCheck.ipAddress}`);
      return NextResponse.json(
        {
          error: "Access denied",
          message: "Automated requests are not allowed. Please use a web browser.",
          code: "BOT_DETECTED"
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { projectId, voterPhone } = body;

    console.log("\n=== New OTP Request ===");
    console.log("Project ID:", projectId);
    console.log("Voter Phone:", voterPhone);
    console.log("User Agent:", botCheck.userAgent);
    console.log("IP Address:", botCheck.ipAddress);
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
        validationResult.reason === "VOTE_CONFIRMED" ||
        validationResult.reason === "OTP_ALREADY_USED"
          ? 409
          : 400;

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
    // NO EXPIRY - Remove expiresAt or set to far future

    console.log("Generated OTP:", otpCode);

    // Get request metadata
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create OTP record - NO EXPIRY
    const newOTP = new OTP({
      phoneNumber: formattedPhone, // Store plain phone for OTP matching
      code: otpCode,
      projectId,
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
      message:
        "Verification code sent to your WhatsApp. This code does not expire.",
      sessionId: newOTP._id,
      phoneNumber: maskedPhone,
      projectTitle: project.projectTitle,
      messageId: whatsAppResult.messageId,
      noExpiry: true, // Indicate that this OTP doesn't expire
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
