import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import OTP from "@/models/OTP";
import Vote from "@/models/Vote";
import {
  getSMSProvider,
  generateOTP,
  validateNigerianPhone,
} from "@/lib/sms/smsService";

// Rate limiting store (use Redis in production)
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, projectId } = body;

    // Basic validation
    if (!phoneNumber || !projectId) {
      return NextResponse.json(
        { error: "Phone number and project ID are required" },
        { status: 400 }
      );
    }

    // Validate project ID format (basic MongoDB ObjectId check)
    if (!/^[0-9a-fA-F]{24}$/.test(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID format" },
        { status: 400 }
      );
    }

    // Enhanced Nigerian phone validation
    const phoneValidation = validateNigerianPhone(phoneNumber);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { error: phoneValidation.error },
        { status: 400 }
      );
    }

    const formattedPhone = phoneValidation.formatted!;

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
          headers: {
            "Retry-After": rateLimit.retryAfter?.toString() || "120",
          },
        }
      );
    }

    await connectDB();

    // Check if user has already voted
    const phoneHash = (Vote as any).hashPhone(formattedPhone);
    const existingVote = await Vote.findOne({
      phoneNumberHash: phoneHash,
      projectId,
    });

    if (existingVote) {
      return NextResponse.json(
        {
          error: "You have already voted for this design",
          code: "ALREADY_VOTED",
        },
        { status: 409 }
      );
    }

    // Clean up expired OTPs
    await OTP.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    // Check for existing unused OTP
    const existingOTP = await OTP.findOne({
      phoneNumber: formattedPhone,
      projectId,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (existingOTP) {
      const expiresIn = Math.floor(
        (existingOTP.expiresAt.getTime() - Date.now()) / 1000
      );
      return NextResponse.json(
        {
          error: "A verification code was already sent to this number",
          expiresIn,
          message: `Please check your messages or wait ${Math.ceil(
            expiresIn / 60
          )} minute(s)`,
          code: "OTP_ALREADY_SENT",
        },
        { status: 400 }
      );
    }

    // Generate new OTP
    const code = generateOTP(6);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to database
    const otp = new OTP({
      phoneNumber: formattedPhone,
      code,
      projectId,
      expiresAt,
      attempts: 0,
      createdAt: new Date(),
    });

    await otp.save();

    // Send SMS using the enhanced service
    const smsService = getSMSProvider();
    const smsResult = await smsService.sendOTP(formattedPhone, code);

    if (!smsResult.success) {
      // Clean up the OTP record if SMS failed
      await OTP.deleteOne({ _id: otp._id });

      console.error("Failed to send SMS:", {
        error: smsResult.error,
        phoneNumber: formattedPhone,
        provider: smsResult.provider,
      });

      return NextResponse.json(
        {
          error: "Failed to send verification code. Please try again.",
          details:
            process.env.NODE_ENV === "development"
              ? smsResult.error
              : undefined,
          code: "SMS_FAILED",
        },
        { status: 500 }
      );
    }

    // Success response
    const response: any = {
      success: true,
      message: "Verification code sent successfully",
      expiresIn: 300, // 5 minutes in seconds
      phoneNumber: formattedPhone.replace(
        /(\+234)(\d{3})(\d{3})(\d{4})/,
        "$1$2***$4"
      ), // Mask middle digits
      carrier: phoneValidation.carrier,
      messageId: smsResult.messageId,
    };

    // Include code in development mode only
    if (process.env.NODE_ENV === "development") {
      response.devCode = code;
      response.provider = smsResult.provider;
      console.log(
        `[DEV] OTP for ${formattedPhone}: ${code} (${phoneValidation.carrier})`
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
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    await connectDB();

    // Check if SMS service is configured
    const smsProvider = getSMSProvider();
    const hasValidConfig = !!(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    );

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      smsConfigured: hasValidConfig,
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { status: "unhealthy", error: "Database connection failed" },
      { status: 503 }
    );
  }
}
