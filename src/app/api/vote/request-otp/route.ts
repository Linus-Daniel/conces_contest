// api/vote/request-otp/route.ts - Streamlined OTP flow
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import OTP from "@/models/OTP";
import Vote from "@/models/Vote";
import axios from "axios";

// WhatsApp Service using Axios
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
  }> {
    try {
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;

      const requestPayload = {
        messaging_product: "whatsapp",
        to: formattedPhone,
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

      const response = await axios.post(this.baseUrl, requestPayload, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      if (response.status === 200 && response.data.messages?.[0]) {
        return {
          success: true,
          messageId: response.data.messages[0].id,
        };
      } else {
        const errorMessage =
          response.data.error?.message || "Unknown WhatsApp API error";
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.message ||
        "WhatsApp service error";
      return { success: false, error: errorMessage };
    }
  }
}

// Utility functions
function validateNigerianPhone(phone: string): {
  isValid: boolean;
  formatted: string;
} {
  const cleaned = phone.replace(/\D/g, "");

  // Check if it's a valid Nigerian number
  if (!/^(234|0)?[789]\d{9}$/.test(cleaned)) {
    return { isValid: false, formatted: phone };
  }

  // Convert to international format
  let formatted = cleaned;
  if (cleaned.startsWith("0")) {
    formatted = `234${cleaned.substring(1)}`;
  } else if (!cleaned.startsWith("234")) {
    formatted = `234${cleaned}`;
  }

  return { isValid: true, formatted: `+${formatted}` };
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

// Main POST handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, voterPhone } = body;

    // Validate input
    if (!projectId || !voterPhone) {
      return NextResponse.json(
        { error: "Project ID and phone number are required" },
        { status: 400 }
      );
    }

    // Validate and format phone number
    const phoneValidation = validateNigerianPhone(voterPhone);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { error: "Invalid Nigerian phone number format" },
        { status: 400 }
      );
    }

    const formattedPhone = phoneValidation.formatted;

    // Check rate limit
    const rateLimit = checkRateLimit(formattedPhone);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Please wait before requesting another code" },
        {
          status: 429,
          headers: { "Retry-After": rateLimit.retryAfter?.toString() || "120" },
        }
      );
    }

    // Connect to database
    await connectDB();

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if already voted (using formatted phone number)
    const existingVote = await Vote.findOne({
      phoneNumber: formattedPhone,
      projectId,
    });

    if (existingVote) {
      return NextResponse.json(
        { error: "You have already voted for this project" },
        { status: 409 }
      );
    }

    // Check for existing unused OTP
    const existingOTP = await OTP.findOne({
      phoneNumber: formattedPhone,
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
          sessionId: existingOTP._id,
        },
        { status: 400 }
      );
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Get request metadata
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create OTP record with formatted phone number
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

    await newOTP.save();

    // Send WhatsApp message
    const whatsAppService = new WhatsAppService();
    const whatsAppResult = await whatsAppService.sendOTPTemplate(
      formattedPhone,
      otpCode
    );

    if (!whatsAppResult.success) {
      // Delete OTP if WhatsApp sending failed
      await OTP.deleteOne({ _id: newOTP._id });

      return NextResponse.json(
        { error: "Failed to send verification code via WhatsApp" },
        { status: 500 }
      );
    }

    // Prepare success response
    const maskedPhone = formattedPhone.replace(
      /(\+\d{3})(\d{3})(\d{3})(\d{4})/,
      "$1$2***$4"
    );

    const response: any = {
      success: true,
      message: "Verification code sent to your WhatsApp",
      sessionId: newOTP._id,
      expiresIn: 300, // 5 minutes in seconds
      phoneNumber: maskedPhone,
      projectTitle: project.projectTitle,
    };

    // Add debug info in development
    if (process.env.NODE_ENV === "development") {
      response.devCode = otpCode;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error in OTP request:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
