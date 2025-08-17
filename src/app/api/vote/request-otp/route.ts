// api/vote/request-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import Vote from "@/models/Vote";
import crypto from "crypto";

// WhatsApp Service
class WhatsAppService {
  private accessToken: string;
  private phoneNumberId: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN!;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
    console.log(this.accessToken,this.phoneNumberId, "whatsapp credentals")
  }

  async sendOTP(
    phoneNumber: string,
    code: string,
    projectTitle: string
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      const message = `Your voting code for "${projectTitle}": ${code}\n\nThis code expires in 5 minutes. Use it to confirm your vote.`;

      const response = await fetch(
        `https://graph.facebook.com/v22.0/${this.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: phoneNumber.replace("+", ""),
            type: "text",
            text: { body: message },
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.messages) {
        return {
          success: true,
          messageId: result.messages[0].id,
        };
      } else {
        return {
          success: false,
          error: result.error?.message || "Failed to send WhatsApp message",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "WhatsApp service error",
      };
    }
  }
}

// Encryption functions (same as your original)
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

// Create voter hash (same as your original)
function createVoterHash(phone: string): string {
  return crypto
    .createHash("sha256")
    .update(`${phone.trim()}`)
    .digest("hex");
}

// Validate Nigerian phone number (same as your original)
function validateNigerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  const patterns = [/^234[789]\d{9}$/, /^0[789]\d{9}$/, /^[789]\d{9}$/];
  return patterns.some((pattern) => pattern.test(cleaned));
}

// Format Nigerian phone number (same as your original)
function formatNigerianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("234")) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith("0")) {
    return `+234${cleaned.slice(1)}`;
  } else if (cleaned.length === 10 && /^[789]/.test(cleaned)) {
    return `+234${cleaned}`;
  }
  return phone;
}

// Generate OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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
    const { projectId, voterEmail, voterPhone } = body;

    // Validate input
    if (!projectId ||  !voterPhone) {
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

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Create voter hash and check for existing vote
    const voterHash = createVoterHash( formattedPhone);
    const existingVote = await Vote.findOne({
      projectId,
      voterHash,
    });

    if (existingVote) {
      return NextResponse.json(
        { error: "You have already voted for this design" },
        { status: 409 }
      );
    }

    // Check for existing pending OTP session
    const existingPendingVote = await Vote.findOne({
      voterHash,
      projectId,
      status: "pending",
      "otp.expiresAt": { $gt: new Date() },
    });

    if (existingPendingVote) {
      const expiresIn = Math.floor(
        (existingPendingVote.otp.expiresAt.getTime() - Date.now()) / 1000
      );
      return NextResponse.json(
        {
          error: "A verification code was already sent",
          expiresIn,
          message: `Please check your WhatsApp or wait ${Math.ceil(
            expiresIn / 60
          )} minute(s)`,
          sessionId: existingPendingVote._id,
        },
        { status: 400 }
      );
    }

    // Generate OTP and create session
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Get IP and user agent
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create OTP session (reusing your Vote model but with pending status)
    const otpSession = new Vote({
      projectId,
      voterHash,
      voterEmail: encrypt(voterEmail),
      voterPhone: encrypt(formattedPhone),
      ipAddress,
      userAgent,
      status: "pending",
      otp: {
        code: otpCode,
        expiresAt,
        attempts: 0,
        used: false,
      },
    });

    await otpSession.save();

    // Send WhatsApp OTP
    const whatsAppService = new WhatsAppService();
    const whatsAppResult = await whatsAppService.sendOTP(
      formattedPhone,
      otpCode,
      project.projectTitle
    );

    if (!whatsAppResult.success) {
      // Clean up session if WhatsApp failed
      await Vote.deleteOne({ _id: otpSession._id });

      console.error("Failed to send WhatsApp OTP:", {
        error: whatsAppResult.error,
        phoneNumber: formattedPhone,
        projectId,
      });

      return NextResponse.json(
        {
          error:
            "Failed to send verification code via WhatsApp. Please try again.",
          details:
            process.env.NODE_ENV === "development"
              ? whatsAppResult.error
              : undefined,
        },
        { status: 500 }
      );
    }

    // Success response
    const response: any = {
      success: true,
      message: "Verification code sent to your WhatsApp",
      sessionId: otpSession._id,
      expiresIn: 300, // 5 minutes
      phoneNumber: formattedPhone.replace(
        /(\+234)(\d{3})(\d{3})(\d{4})/,
        "$1$2***$4"
      ),
      projectTitle: project.projectTitle,
      messageId: whatsAppResult.messageId,
    };

    // Include code in development mode
    if (process.env.NODE_ENV === "development") {
      response.devCode = otpCode;
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
        message:error
      },
      { status: 500 }
    );
  }
}
