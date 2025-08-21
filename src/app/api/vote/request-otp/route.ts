// api/vote/request-otp/route.ts - Using Axios for WhatsApp API
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
      // Ensure phone number has + prefix for WhatsApp API
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;

      console.log("=== WhatsApp OTP Send Attempt ===");
      console.log("Phone Number:", formattedPhone);
      console.log("OTP Code:", code);
      console.log("Phone Number ID:", this.phoneNumberId);
      console.log("Has Access Token:", !!this.accessToken);
      console.log("Access Token Length:", this.accessToken?.length);

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

      console.log("Request URL:", this.baseUrl);
      console.log("Request Payload:", JSON.stringify(requestPayload, null, 2));

      // Make the API call using axios
      const response = await axios.post(this.baseUrl, requestPayload, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 seconds timeout
        validateStatus: function (status) {
          // Don't throw on any status, we'll handle it manually
          return true;
        },
      });

      console.log("=== WhatsApp API Response ===");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);
      console.log("Response Data:", JSON.stringify(response.data, null, 2));

      // Check if the request was successful
      if (
        response.status === 200 &&
        response.data.messages &&
        response.data.messages[0]
      ) {
        console.log("✅ WhatsApp message sent successfully!");
        console.log("Message ID:", response.data.messages[0].id);

        return {
          success: true,
          messageId: response.data.messages[0].id,
          debugInfo: response.data,
        };
      } else {
        // Handle error response
        const errorMessage =
          response.data.error?.message ||
          response.data.error?.error_user_msg ||
          "Unknown WhatsApp API error";

        console.error("❌ WhatsApp API Error:");
        console.error("Error Message:", errorMessage);
        console.error("Full Error:", response.data.error);

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
      console.error("Error Type:", error.name);
      console.error("Error Message:", error.message);

      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("Response Status:", error.response.status);
        console.error("Response Data:", error.response.data);

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
        // The request was made but no response was received
        console.error("No response received from WhatsApp API");
        console.error("Request:", error.request);

        return {
          success: false,
          error: "No response from WhatsApp API - Network error",
          debugInfo: {
            message: error.message,
            code: error.code,
          },
        };
      } else {
        // Something happened in setting up the request
        console.error("Error setting up request:", error.message);

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

  // Already in international format
  if (cleaned.startsWith("234")) {
    return `+${cleaned}`;
  }

  // Local format with 0 prefix
  if (cleaned.startsWith("0")) {
    return `+234${cleaned.slice(1)}`;
  }

  // Local format without prefix
  if (cleaned.length === 10 && /^[789]/.test(cleaned)) {
    return `+234${cleaned}`;
  }

  // Return as-is if doesn't match expected formats
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

// OTP status enum for better readability
enum OTPStatus {
  NOT_FOUND = "NOT_FOUND",
  ACTIVE = "ACTIVE",
  USED = "USED",
  EXPIRED = "EXPIRED",
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

    // Check rate limit
   
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

    // Check if already voted
    const existingVote = await Vote.findOne({
      phoneNumber: encryptedPhone,
      projectId,
    });

    if (existingVote) {
      console.warn("User already voted for this project");
      return NextResponse.json(
        {
          error: "Already voted",
          message:
            "You have already voted for this project. Each phone number can only vote once.",
        },
        { status: 409 }
      );
    }

    // Check for existing OTPs for this phone number
    const existingOTPs = await OTP.find({
      phoneNumber: formattedPhone,
    }).sort({ createdAt: -1 }); // Get most recent first

    let otpStatus = OTPStatus.NOT_FOUND;
    let activeOTP = null;

    if (existingOTPs.length > 0) {
      const latestOTP = existingOTPs[0];

      // Check if OTP has been used
      if (latestOTP.used) {
        otpStatus = OTPStatus.USED;
        console.log("OTP already used for this phone number");
      }
      // Check if OTP is expired
      else if (latestOTP.expiresAt < new Date()) {
        otpStatus = OTPStatus.EXPIRED;
        console.log("Existing OTP has expired");
      }
      // OTP is still active
      else {
        otpStatus = OTPStatus.ACTIVE;
        activeOTP = latestOTP;
        console.log("Active OTP found, expires at:", latestOTP.expiresAt);
      }
    }

    // Handle different OTP statuses
    switch (otpStatus) {
      case OTPStatus.USED:
        return NextResponse.json(
          {
            error: "Already verified",
            message:
              "This phone number has already been used to verify a vote. Each number can only be used once.",
          },
          { status: 409 }
        );

      case OTPStatus.ACTIVE:
        if (activeOTP) {
          const expiresIn = Math.floor(
            (activeOTP.expiresAt.getTime() - Date.now()) / 1000
          );

          console.warn(
            "Existing OTP still valid, expires in:",
            expiresIn,
            "seconds"
          );

          return NextResponse.json(
            {
              error: "Code already sent",
              message: `A verification code was recently sent to your WhatsApp. Please check your messages or wait ${Math.ceil(
                expiresIn / 60
              )} minute(s) to request a new code.`,
              expiresIn,
              sessionId: activeOTP._id,
              resendAvailable: expiresIn < 60, // Allow resend if less than 1 minute remaining
            },
            { status: 400 }
          );
        }
        break;

      case OTPStatus.EXPIRED:
        console.log("Previous OTP expired, generating new one");
        break;
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
      phoneNumber: formattedPhone,
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
              ? {
                  whatsAppError: whatsAppResult.error,
                }
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
