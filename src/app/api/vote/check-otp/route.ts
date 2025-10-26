// api/vote/check-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import OTP from "@/models/OTP";
import { detectBotAttack } from "@/lib/antiBot";

// Response interfaces
interface CheckOTPResponse {
  success: boolean;
  hasActiveOTP?: boolean;
  message?: string;
  error?: string;
  sessionId?: string;
  expiresIn?: number;
  phoneNumber?: string;
  status?: "ACTIVE" | "EXPIRED" | "USED" | "NOT_FOUND";
}

// Utility function to validate Nigerian phone numbers
function validateNigerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  const patterns = [
    /^234[789]\d{9}$/, // Full international format
    /^0[789]\d{9}$/, // Local format with 0
    /^[789]\d{9}$/, // Local format without 0
  ];
  return patterns.some((pattern) => pattern.test(cleaned));
}

// Utility function to format Nigerian phone numbers
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

export async function POST(request: NextRequest) {
  try {
    // 🛡️ ANTI-BOT PROTECTION: Check for automated scripts
    const botCheck = detectBotAttack(request);
    if (botCheck.isBot) {
      console.log(`🚨 BOT ATTACK BLOCKED: ${botCheck.reason} from IP: ${botCheck.ipAddress}`);
      return NextResponse.json(
        {
          success: false,
          error: "Access denied",
          message: "Automated requests are not allowed. Please use a web browser."
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { phoneNumber } = body;

    console.log("\n=== OTP Check Request ===");
    console.log("Phone Number:", phoneNumber);
    console.log("User Agent:", botCheck.userAgent);
    console.log("IP Address:", botCheck.ipAddress);
    console.log("Timestamp:", new Date().toISOString());

    // Validate input
    if (!phoneNumber) {
      console.error("Missing phone number");
      return NextResponse.json(
        {
          success: false,
          error: "Missing phone number",
          message: "Phone number is required to check for existing OTP",
        },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!validateNigerianPhone(phoneNumber)) {
      console.error("Invalid phone number format:", phoneNumber);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid phone number",
          message:
            "Please provide a valid Nigerian phone number (e.g., 08012345678, +2348012345678, or 8012345678)",
        },
        { status: 400 }
      );
    }

    const formattedPhone = formatNigerianPhone(phoneNumber);
    console.log("Formatted Phone:", formattedPhone);

    // Connect to database
    await connectDB();
    console.log("Database connected");

    // Find all OTPs for this phone number (most recent first)
    const otpRecords = await OTP.find({
      phoneNumber: formattedPhone,
    }).sort({ createdAt: -1 });

    console.log("Found", otpRecords.length, "OTP records for this number");

    // If no OTP records found
    if (otpRecords.length === 0) {
      console.log("No OTP records found for this number");
      return NextResponse.json({
        success: true,
        hasActiveOTP: false,
        status: "NOT_FOUND",
        message: "No verification codes found for this number",
      });
    }

    const latestOTP = otpRecords[0];
    console.log("Latest OTP:", {
      id: latestOTP._id,
      createdAt: latestOTP.createdAt,
      used: latestOTP.used,
      attempts: latestOTP.attempts,
    });

    // Check if OTP has been used
    if (latestOTP.used) {
      console.log("OTP has already been used");
      return NextResponse.json({
        success: true,
        hasActiveOTP: false,
        status: "USED",
        message: "This verification code has already been used",
      });
    }

    // Check if OTP is expired
    const now = new Date();


 

    return NextResponse.json({
      success: true,
      hasActiveOTP: true,
      status: "ACTIVE",
      message: "An active verification code was found",
      sessionId: (latestOTP._id as { toString: () => string }).toString(),
      phoneNumber: formattedPhone.replace(/(\d{4})\d{4}(\d{2})/, "$1****$2"), // Mask phone number
    });
  } catch (error: any) {
    console.error("=== Error in OTP Check ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);

    return NextResponse.json(
      {
        success: false,
        error: "Server error",
        message:
          "An unexpected error occurred while checking for verification codes",
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

// Optional: GET endpoint to check OTP status by sessionId
export async function GET(request: NextRequest) {
  try {
    // 🛡️ ANTI-BOT PROTECTION: Check for automated scripts
    const botCheck = detectBotAttack(request);
    if (botCheck.isBot) {
      console.log(`🚨 BOT ATTACK BLOCKED: ${botCheck.reason} from IP: ${botCheck.ipAddress}`);
      return NextResponse.json(
        {
          success: false,
          error: "Access denied",
          message: "Automated requests are not allowed. Please use a web browser."
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing session ID",
          message: "Session ID is required to check OTP status",
        },
        { status: 400 }
      );
    }

    console.log("\n=== OTP Status Check ===");
    console.log("Session ID:", sessionId);
    console.log("User Agent:", botCheck.userAgent);
    console.log("IP Address:", botCheck.ipAddress);

    // Connect to database
    await connectDB();

    // Find OTP by sessionId
    const otp = await OTP.findById(sessionId);

    if (!otp) {
      console.log("OTP not found for session ID:", sessionId);
      return NextResponse.json({
        success: true,
        hasActiveOTP: false,
        status: "NOT_FOUND",
        message: "Verification code not found",
      });
    }

    const now = new Date();
    let status: "ACTIVE" | "EXPIRED" | "USED" = "ACTIVE";
    let message = "Verification code is active";
   


    console.log("OTP Status:", status);

    return NextResponse.json({
      success: true,
      hasActiveOTP: status === "ACTIVE",
      status,
      message,
      sessionId: (otp._id as { toString: () => string }).toString(),
      phoneNumber: otp.phoneNumber.replace(/(\d{4})\d{4}(\d{2})/, "$1****$2"), // Mask phone number
    });
  } catch (error: any) {
    console.error("=== Error in OTP Status Check ===");
    console.error("Error:", error.message);

    return NextResponse.json(
      {
        success: false,
        error: "Server error",
        message:
          "An unexpected error occurred while checking verification code status",
      },
      { status: 500 }
    );
  }
}
