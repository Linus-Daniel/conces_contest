import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Enroll, { IEnroll } from "@/models/Enroll";
import { sendWelcomeEmail} from "@/lib/email/emailService";
import crypto from "crypto";
import { EmailTemplateData } from "@/lib/email/templates";

// Types
interface RateLimitData {
  count: number;
  resetTime: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface EnrollmentRequestBody {
  data: IEnroll;
}

interface EnrollmentResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface ErrorResponse {
  error: string;
  details?: string[] | string;
  suggestion?: string;
}

// Rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitData>();

// Helper function for rate limiting
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(ip);

  if (!limit || limit.resetTime < now) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + 60000, // 1 minute window
    });
    return true;
  }

  if (limit.count >= 5) {
    return false;
  }

  limit.count++;
  return true;
}

// Validation function
function validateEnrollmentData(data: IEnroll): ValidationResult {
  const errors: string[] = [];
  console.log("Validating enrollment data:", data);

  // Required fields validation
  const requiredFields: (keyof IEnroll)[] = [
    "fullName",
    "email",
    "phone",
    "university",
    "department",
    "matricNumber",
  ];

  for (const field of requiredFields) {
    const value = data[field];
    if (!value || (typeof value === "string" && value.trim() === "")) {
      errors.push(`${field} is required`);
    }
  }

  // Email validation
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.push("Invalid email format");
  }

  // Phone number validation (Nigerian format)
  const phoneRegex = /^(\+234|0)[789]\d{9}$/;
  if (data.phone && !phoneRegex.test(data.phone)) {
    errors.push(
      "Invalid Nigerian phone number format (+234XXXXXXXXXX or 0XXXXXXXXXX)"
    );
  }

  // Terms acceptance validation
  if (!data.agreeToTerms) {
    errors.push("You must accept the terms and conditions");
    console.log("Terms not accepted:", data.agreeToTerms);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return realIp || cfConnectingIp || "unknown";
}

// Helper function to sanitize string inputs
function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<EnrollmentResponse | ErrorResponse>> {
  try {
    // Rate limiting
    const clientIp = getClientIP(request);
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json<ErrorResponse>(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Parse and validate request body
    let requestBody: EnrollmentRequestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return NextResponse.json<ErrorResponse>(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { data } = requestBody;

    // Validate input structure
    if (!data || typeof data !== "object") {
      return NextResponse.json<ErrorResponse>(
        { error: "Invalid request data structure" },
        { status: 400 }
      );
    }

    // Validate enrollment data
    const validation = validateEnrollmentData(data);
    if (!validation.isValid) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if email already exists
    const normalizedEmail = data.email.toLowerCase().trim();
    const existingEnrollment = await Enroll.findOne({
      email: normalizedEmail,
    });

    if (existingEnrollment) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "This email is already registered for the contest",
          suggestion:
            "Please use a different email or contact support if you need help",
        },
        { status: 409 } // Conflict status
      );
    }

    // Generate unique 8-digit auth token
    const authToken = Math.floor(
      10000000 + Math.random() * 90000000
    ).toString();

    // Create new enrollment with sanitized data
    const enrollment = new Enroll({
      fullName: sanitizeString(data.fullName),
      email: normalizedEmail,
      phone: sanitizeString(data.phone),
      university: sanitizeString(data.university),
      department: sanitizeString(data.department),
      matricNumber: sanitizeString(data.matricNumber).toUpperCase(),
      authToken,
      agreeToTerms: Boolean(data.agreeToTerms),
    });

    // Save to database
    const savedEnrollment = await enrollment.save();

    // Prepare email data
    const emailData: EmailTemplateData = {
      fullName: savedEnrollment.fullName,
      email: savedEnrollment.email,
      authToken: savedEnrollment.authToken,
      university: savedEnrollment.university, // Map university to schoolName
      department: savedEnrollment.department,
    };

    // Send welcome email
    let emailSent = false;
    try {
      emailSent = await sendWelcomeEmail(emailData);
      console.log("Welcome email sent successfully:", emailSent);
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Don't fail the enrollment if email fails
    }

    // Update contest pack status if email was sent
    if (emailSent && savedEnrollment.contestPack) {
      savedEnrollment.contestPack.sent = true;
      savedEnrollment.contestPack.sentAt = new Date();
      await savedEnrollment.save();
    }

    // Return success response
    return NextResponse.json<EnrollmentResponse>(
      {
        success: true,
        message: emailSent
          ? "Registration successful! Check your email for your contest pack."
          : "Registration successful! We'll send your contest pack shortly.",
        data: {
          id: savedEnrollment._id.toString(),
          fullName: savedEnrollment.fullName,
          email: savedEnrollment.email,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error in enrollment route:", error);

    // Handle specific MongoDB errors
    if (error && typeof error === "object" && "name" in error) {
      if (error.name === "ValidationError") {
        return NextResponse.json<ErrorResponse>(
          {
            error: "Database validation error",
            details: "Unknown validation error",
          },
          { status: 400 }
        );
      }

      if (error.name === "MongoError" || error.name === "MongoServerError") {
        console.error("MongoDB error:", error);
        return NextResponse.json<ErrorResponse>(
          { error: "Database connection error" },
          { status: 503 }
        );
      }
    }

    // General server error
    return NextResponse.json<ErrorResponse>(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      message: "Enrollment API is running",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
