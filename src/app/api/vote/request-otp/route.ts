// api/vote/request-otp/route.ts - Fixed version with debugging
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import OTP from "@/models/OTP";
import Vote from "@/models/Vote";
import crypto from "crypto";

// WhatsApp Service - FIXED VERSION
class WhatsAppService {
  private accessToken: string;
  private phoneNumberId: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN!;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
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
      // IMPORTANT: WhatsApp API expects the phone number WITH the + sign
      // Your curl command uses "+2349015648441" which works
      // Make sure we're sending the same format
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;

      console.log("Sending WhatsApp OTP:", {
        phoneNumberId: this.phoneNumberId,
        to: formattedPhone,
        code: code,
        hasAccessToken: !!this.accessToken,
      });

      const requestBody = {
        messaging_product: "whatsapp",
        to: formattedPhone, // Keep the + sign, unlike your original code
        type: "template",
        template: {
          name: "conces_contest",
          language: { code: "en_US" },
          components: [
            {
              type: "body",
              parameters: [{ type: "text", text: code }],
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [{ type: "text", text: code }],
            },
          ],
        },
      };

      console.log(
        "WhatsApp API Request:",
        JSON.stringify(requestBody, null, 2)
      );

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const result = await response.json();

      console.log("WhatsApp API Response:", {
        status: response.status,
        ok: response.ok,
        result: JSON.stringify(result, null, 2),
      });

      if (!response.ok) {
        console.error("WhatsApp API Error:", result);
        return {
          success: false,
          error: result.error?.message || "Failed to send WhatsApp message",
          debugInfo: result,
        };
      }

      if (result.messages && result.messages[0]) {
        return {
          success: true,
          messageId: result.messages[0].id,
          debugInfo: result,
        };
      }

      return {
        success: false,
        error: "Unexpected response format from WhatsApp API",
        debugInfo: result,
      };
    } catch (error: any) {
      console.error("WhatsApp service exception:", error);
      return {
        success: false,
        error: error.message || "WhatsApp service error",
        debugInfo: { exception: error.message, stack: error.stack },
      };
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
  const patterns = [/^234[789]\d{9}$/, /^0[789]\d{9}$/, /^[789]\d{9}$/];
  return patterns.some((pattern) => pattern.test(cleaned));
}

function formatNigerianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("234")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+234${cleaned.slice(1)}`;
  if (cleaned.length === 10 && /^[789]/.test(cleaned)) return `+234${cleaned}`;
  return phone;
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Rate limiting
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
    rateLimitStore.set(phoneNumber, { count: 1, resetTime: now + windowSize });
    return { allowed: true };
  }

  if (entry.count >= maxAttempts) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, voterPhone } = body;

    console.log("OTP Request received:", { projectId, voterPhone });

    // Validate input
    if (!projectId || !voterPhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Phone validation
    if (!validateNigerianPhone(voterPhone)) {
      return NextResponse.json(
        {
          error:
            "Invalid Nigerian phone number format. Use formats like: 08012345678, +2348012345678, or 8012345678",
        },
        { status: 400 }
      );
    }

    const formattedPhone = formatNigerianPhone(voterPhone);
    console.log("Formatted phone number:", formattedPhone);

    const encryptedPhone = encrypt(formattedPhone);

    // Check rate limit
    const rateLimit = checkRateLimit(formattedPhone);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Please wait before requesting another code",
          retryAfter: rateLimit.retryAfter,
          message: `You can request a new code in ${rateLimit.retryAfter} seconds`,
        },
        {
          status: 429,
          headers: { "Retry-After": rateLimit.retryAfter?.toString() || "120" },
        }
      );
    }

    await connectDB();

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check 1: Has this phone number already voted for this project?
    const existingVote = await Vote.findOne({
      phoneNumber: encryptedPhone,
      projectId,
    });

    if (existingVote) {
      return NextResponse.json(
        { error: "You have already voted for this design" },
        { status: 409 }
      );
    }

    // Check 2: Does this phone number have a pending, unused OTP for this project?
    const existingOTP = await OTP.findOne({
      phoneNumber: encryptedPhone,
      projectId,
      expiresAt: { $gt: new Date() },
      used: false,
    });

    if (existingOTP) {
      const expiresIn = Math.floor(
        (existingOTP.expiresAt.getTime() - Date.now()) / 1000
      );
      return NextResponse.json(
        {
          error: "A verification code was already sent",
          expiresIn,
          message: `Please check your WhatsApp or wait ${Math.ceil(
            expiresIn / 60
          )} minute(s)`,
          sessionId: existingOTP._id,
        },
        { status: 400 }
      );
    }

    // Check 3: Has this phone number used an OTP to vote (even if vote failed)?
    const usedOTP = await OTP.findOne({
      phoneNumber: encryptedPhone,
      projectId,
      voteConfirmed: true,
    });

    if (usedOTP) {
      return NextResponse.json(
        { error: "You have already voted for this design" },
        { status: 409 }
      );
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Get request metadata
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create new OTP session
    const newOTP = new OTP({
      phoneNumber: encryptedPhone,
      code: otpCode,
      projectId,
      expiresAt,
      used: false,
      voteConfirmed: false,
      attempts: 0,
      ipAddress,
      userAgent,
    });

    await newOTP.save();
    console.log("OTP saved to database:", { otpCode, sessionId: newOTP._id });

    // Send WhatsApp OTP
    const whatsAppService = new WhatsAppService();
    const whatsAppResult = await whatsAppService.sendOTPTemplate(
      formattedPhone,
      otpCode
    );

    if (!whatsAppResult.success) {
      // Clean up OTP if WhatsApp failed
      await OTP.deleteOne({ _id: newOTP._id });

      console.error("Failed to send WhatsApp OTP:", {
        error: whatsAppResult.error,
        phoneNumber: formattedPhone,
        projectId,
        debugInfo: whatsAppResult.debugInfo,
      });

      return NextResponse.json(
        {
          error:
            "Failed to send verification code via WhatsApp. Please try again.",
          details:
            process.env.NODE_ENV === "development"
              ? {
                  whatsAppError: whatsAppResult.error,
                  debugInfo: whatsAppResult.debugInfo,
                }
              : undefined,
        },
        { status: 500 }
      );
    }

    console.log("WhatsApp OTP sent successfully:", {
      messageId: whatsAppResult.messageId,
      phoneNumber: formattedPhone,
    });

    // Success response
    const response: any = {
      success: true,
      message: "Verification code sent to your WhatsApp",
      sessionId: newOTP._id,
      expiresIn: 300, // 5 minutes
      phoneNumber: formattedPhone.replace(
        /(\+234)(\d{3})(\d{3})(\d{4})/,
        "$1$2***$4"
      ),
      projectTitle: project.projectTitle,
      messageId: whatsAppResult.messageId,
    };

    // Include code and debug info in development mode
    if (process.env.NODE_ENV === "development") {
      response.devCode = otpCode;
      response.debugInfo = {
        formattedPhone,
        whatsAppDebug: whatsAppResult.debugInfo,
      };
      console.log(
        `[DEV] OTP for ${formattedPhone} (${project.projectTitle}): ${otpCode}`
      );
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Unexpected error in OTP request:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: "An unexpected error occurred. Please try again.",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
