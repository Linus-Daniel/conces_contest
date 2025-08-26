import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Enroll, { IEnroll } from "@/models/Enroll";
import { sendWelcomeEmail } from "@/lib/email/emailService";
import crypto from "crypto";
import { EmailTemplateData } from "@/lib/email/templates";

// Types
interface RateLimitData {
  count: number;
  resetTime: number;
  windowStart: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
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
    authToken?: string;
  };
}

interface ErrorResponse {
  error: string;
  details?: string[] | string;
  suggestion?: string;
  field?: string;
}

// Enhanced rate limiting store with sliding window
const rateLimitStore = new Map<string, RateLimitData>();

// Helper function for enhanced rate limiting
function checkRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const windowSize = 60000; // 1 minute window
  const maxRequests = 3; // Reduced from 5 to 3 for better protection
  
  const limit = rateLimitStore.get(ip);

  if (!limit || limit.resetTime < now) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + windowSize,
      windowStart: now,
    });
    return { allowed: true };
  }

  if (limit.count >= maxRequests) {
    return { 
      allowed: false, 
      resetTime: limit.resetTime 
    };
  }

  limit.count++;
  return { allowed: true };
}

// Enhanced phone validation
function validatePhoneNumber(phone: string): { isValid: boolean; formatted?: string; error?: string } {
  if (!phone) {
    return { isValid: false, error: "Phone number is required" };
  }

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Nigerian phone patterns
  const patterns = [
    {
      regex: /^\+234[789]\d{9}$/,
      description: "International Nigerian format (+234XXXXXXXXX)",
      format: (num: string) => `+234 ${num.slice(4, 7)} ${num.slice(7, 10)} ${num.slice(10, 14)}`
    },
    {
      regex: /^234[789]\d{9}$/,
      description: "Nigerian format without + (234XXXXXXXXX)",
      format: (num: string) => `+234 ${num.slice(3, 6)} ${num.slice(6, 9)} ${num.slice(9, 13)}`
    },
    {
      regex: /^0[789]\d{9}$/,
      description: "Local Nigerian format (0XXXXXXXXXX)",
      format: (num: string) => `+234 ${num.slice(1, 4)} ${num.slice(4, 7)} ${num.slice(7, 11)}`
    },
    {
      regex: /^[789]\d{9}$/,
      description: "Nigerian mobile without prefix (XXXXXXXXXX)",
      format: (num: string) => `+234 ${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6, 10)}`
    }
  ];

  // Check Nigerian patterns first
  for (const pattern of patterns) {
    if (pattern.regex.test(cleaned)) {
      return { 
        isValid: true, 
        formatted: pattern.format(cleaned)
      };
    }
  }

  // Check international format (more permissive for other countries)
  const internationalRegex = /^\+[1-9]\d{7,14}$/;
  if (internationalRegex.test(cleaned)) {
    return { isValid: true, formatted: cleaned };
  }

  return { 
    isValid: false, 
    error: "Please enter a valid phone number. Nigerian numbers: +234 803 123 4567 or 08031234567" 
  };
}

// Enhanced validation with more specific error messages
function validateEnrollmentData(data: IEnroll): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  console.log("Validating enrollment data:", data);

  // Full name validation
  if (!data.fullName?.trim()) {
    errors.push("Full name is required");
  } else {
    const fullNameRegex = /^[a-zA-Z\s'-]+$/;
    if (!fullNameRegex.test(data.fullName.trim())) {
      errors.push("Full name can only contain letters, spaces, hyphens, and apostrophes");
    }
    if (data.fullName.trim().length < 3) {
      errors.push("Full name must be at least 3 characters long");
    }
    if (data.fullName.trim().length > 100) {
      errors.push("Full name is too long (maximum 100 characters)");
    }
  }

  // Email validation
  if (!data.email?.trim()) {
    errors.push("Email address is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.push("Please enter a valid email address");
    }
    if (data.email.length > 255) {
      errors.push("Email address is too long");
    }
  }

  // Phone validation
  const phoneValidation = validatePhoneNumber(data.phone);
  if (!phoneValidation.isValid) {
    errors.push(phoneValidation.error || "Invalid phone number");
  }

  // Institution validation
  if (!data.institution?.trim()) {
    errors.push("Institution name is required");
  } else if (data.institution.trim().length < 3) {
    errors.push("Institution name must be at least 3 characters long");
  } else if (data.institution.trim().length > 200) {
    errors.push("Institution name is too long");
  }

  // Department validation
  if (!data.department?.trim()) {
    errors.push("Department is required");
  } else if (data.department.trim().length < 2) {
    errors.push("Department must be at least 2 characters long");
  } else if (data.department.trim().length > 100) {
    errors.push("Department name is too long");
  }

  // Matric number validation
  if (!data.matricNumber?.trim()) {
    errors.push("Matric number is required");
  } else {
    const matricRegex = /^[A-Z0-9\/\-]+$/i;
    if (!matricRegex.test(data.matricNumber.trim())) {
      errors.push("Matric number can only contain letters, numbers, slashes, and hyphens");
    }
    if (data.matricNumber.trim().length < 5) {
      errors.push("Matric number must be at least 5 characters long");
    }
    if (data.matricNumber.trim().length > 50) {
      errors.push("Matric number is too long");
    }
  }

  // Avatar validation
  if (!data.avatar?.trim()) {
    errors.push("Profile photo is required");
  } else {
    // Basic URL validation for avatar
    try {
      new URL(data.avatar);
    } catch {
      errors.push("Invalid profile photo URL");
    }
  }

  // Terms acceptance validation
  if (!data.agreeToTerms) {
    errors.push("You must agree to the terms and conditions to continue");
  }

  // Additional checks for suspicious patterns
  if (data.fullName && data.email) {
    const nameParts = data.fullName.toLowerCase().split(' ');
    const emailLocal = data.email.split('@')[0].toLowerCase();
    
    // Check if email seems legitimate
    if (nameParts.length > 0 && !nameParts.some(part => emailLocal.includes(part.slice(0, 3)))) {
      warnings.push("Email doesn't seem to match the provided name");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Enhanced IP detection
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  const xClientIp = request.headers.get("x-client-ip");

  if (forwarded) {
    // Handle multiple IPs in x-forwarded-for
    const ips = forwarded.split(",").map(ip => ip.trim());
    return ips[0];
  }

  return realIp || cfConnectingIp || xClientIp || "unknown";
}

// Enhanced sanitization
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/[\x00-\x1F\x7F]/g, ""); // Remove control characters
}

// Generate secure auth token
function generateAuthToken(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Enhanced error response helper
function createErrorResponse(
  error: string, 
  details?: string | string[], 
  statusCode: number = 400,
  field?: string,
  suggestion?: string
): NextResponse<ErrorResponse> {
  return NextResponse.json<ErrorResponse>(
    { 
      error, 
      details, 
      field,
      suggestion 
    },
    { status: statusCode }
  );
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<EnrollmentResponse | ErrorResponse>> {
  const startTime = Date.now();
  
  try {
    // Rate limiting check
    const clientIp = getClientIP(request);
    const rateLimitCheck = checkRateLimit(clientIp);
    
    if (!rateLimitCheck.allowed) {
      const waitTime = Math.ceil((rateLimitCheck.resetTime! - Date.now()) / 1000);
      return createErrorResponse(
        "Too many registration attempts", 
        `Please wait ${waitTime} seconds before trying again`,
        429,
        undefined,
        "Take a moment to review your information, then try again"
      );
    }

    // Parse request body with size limit check
    let requestBody: EnrollmentRequestBody;
    try {
      const bodyText = await request.text();
      if (bodyText.length > 10000) { // 10KB limit
        return createErrorResponse(
          "Request too large", 
          "Please reduce the size of your submission",
          413
        );
      }
      requestBody = JSON.parse(bodyText);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return createErrorResponse(
        "Invalid request format", 
        "Please check your submission and try again",
        400
      );
    }

    const { data } = requestBody;

    // Validate request structure
    if (!data || typeof data !== "object") {
      return createErrorResponse(
        "Invalid request data", 
        "Missing or invalid enrollment data",
        400
      );
    }

    // Comprehensive validation
    const validation = validateEnrollmentData(data);
    if (!validation.isValid) {
      return createErrorResponse(
        "Validation failed", 
        validation.errors,
        422 // Unprocessable Entity
      );
    }

    // Connect to database with timeout
    try {
      await Promise.race([
        connectDB(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Database connection timeout")), 10000)
        )
      ]);
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return createErrorResponse(
        "Service temporarily unavailable", 
        "Please try again in a few moments",
        503,
        undefined,
        "Our servers are experiencing high traffic. Please try again shortly."
      );
    }

    // Normalize and check for existing enrollment
    const normalizedEmail = data.email.toLowerCase().trim();
    const normalizedPhone = data.phone.replace(/[\s\-\(\)\.]/g, '');
    
    const existingEnrollment = await Enroll.findOne({
      
        email: normalizedEmail ,
    
      
    });

    if (existingEnrollment) {
      let conflictField = "email";
      let conflictMessage = "This email is already registered for the contest";
      
      if (existingEnrollment.phone === normalizedPhone) {
        conflictField = "phone";
        conflictMessage = "This phone number is already registered";
      } else if (existingEnrollment.matricNumber === data.matricNumber.trim().toUpperCase()) {
        conflictField = "matricNumber";
        conflictMessage = "This matric number is already registered";
      }
      
      return createErrorResponse(
        conflictMessage,
        "Each participant can only register once",
        409,
        conflictField,
        "Please use different information or contact support if this is an error"
      );
    }

    // Generate unique auth token (with collision check)
    let authToken: string;
    let tokenAttempts = 0;
    do {
      authToken = generateAuthToken();
      tokenAttempts++;
      if (tokenAttempts > 10) {
        throw new Error("Unable to generate unique token");
      }
    } while (await Enroll.findOne({ authToken }));

    // Validate and format phone number
    const phoneValidation = validatePhoneNumber(data.phone);
    if (!phoneValidation.isValid) {
      return createErrorResponse(
        "Invalid phone number", 
        phoneValidation.error,
        422,
        "phone"
      );
    }

    // Create enrollment with enhanced data processing
    const enrollment = new Enroll({
      fullName: sanitizeInput(data.fullName).replace(/\s+/g, ' '), // Normalize spaces
      email: normalizedEmail,
      phone: normalizedPhone,
      avatar: sanitizeInput(data.avatar),
      institution: sanitizeInput(data.institution),
      department: sanitizeInput(data.department),
      matricNumber: sanitizeInput(data.matricNumber).toUpperCase(),
      authToken,
      agreeToTerms: Boolean(data.agreeToTerms),
      metadata: {
        registrationIP: clientIp,
        userAgent: request.headers.get("user-agent") || "unknown",
        registrationTime: new Date(),
      }
    });

    // Save with retry logic
    let savedEnrollment;
    let saveAttempts = 0;
    const maxSaveAttempts = 3;
    
    while (saveAttempts < maxSaveAttempts) {
      try {
        savedEnrollment = await enrollment.save();
        break;
      } catch (saveError: any) {
        saveAttempts++;
        if (saveError.code === 11000) { // Duplicate key error
          if (saveAttempts >= maxSaveAttempts) {
            return createErrorResponse(
              "Registration conflict", 
              "Another registration with this information already exists",
              409
            );
          }
          // Regenerate token and try again
          authToken = generateAuthToken();
          enrollment.authToken = authToken;
        } else {
          throw saveError;
        }
      }
    }

    if (!savedEnrollment) {
      throw new Error("Failed to save enrollment after multiple attempts");
    }

    // Prepare and send welcome email
    const emailData: EmailTemplateData = {
      fullName: savedEnrollment.fullName,
      email: savedEnrollment.email,
      authToken: savedEnrollment.authToken,
      institution: savedEnrollment.institution,
      department: savedEnrollment.department,
    };

    let emailSent = false;
    let emailError = null;
    
    try {
      emailSent = await Promise.race([
        sendWelcomeEmail(emailData),
        new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error("Email timeout")), 15000)
        )
      ]);
      console.log("Welcome email sent successfully:", emailSent);
    } catch (error) {
      emailError = error;
      console.error("Error sending welcome email:", error);
      // Don't fail the enrollment if email fails, but log it
    }

    // Update contest pack status
    if (emailSent && savedEnrollment.contestPack) {
      try {
        await Enroll.findByIdAndUpdate(
          savedEnrollment._id,
          {
            "contestPack.sent": true,
            "contestPack.sentAt": new Date(),
          },
          { new: true }
        );
      } catch (updateError) {
        console.error("Failed to update contest pack status:", updateError);
      }
    }

    // Log successful registration
    console.log(`Registration successful: ${savedEnrollment.email} (${Date.now() - startTime}ms)`);

    // Return success response
    return NextResponse.json<EnrollmentResponse>(
      {
        success: true,
        message: emailSent
          ? "Registration successful! Check your email for your contest pack and access token."
          : "Registration successful! We'll send your contest pack shortly. If you don't receive it within 10 minutes, please contact support.",
        data: {
          id: savedEnrollment._id.toString(),
          fullName: savedEnrollment.fullName,
          email: savedEnrollment.email,
          // Include auth token in response for immediate use if needed
          authToken: savedEnrollment.authToken,
        },
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error("Error in enrollment route:", error);

    // Enhanced error handling
    if (error && typeof error === "object" && "name" in error) {
      
      // MongoDB validation errors
      if (error.name === "ValidationError") {
        const validationError = error as any;
        const fieldErrors: string[] = [];
        
        for (const field in validationError.errors) {
          fieldErrors.push(validationError.errors[field].message);
        }
        
        return createErrorResponse(
          "Invalid data provided", 
          fieldErrors,
          422
        );
      }

      // MongoDB duplicate key errors
      if (error.name === "MongoServerError" && (error as any).code === 11000) {
        const duplicateError = error as any;
        let field = "email";
        
        if (duplicateError.keyPattern?.phone) field = "phone";
        if (duplicateError.keyPattern?.matricNumber) field = "matricNumber";
        
        return createErrorResponse(
          "Registration conflict",
          `This ${field} is already registered`,
          409,
          field,
          "Please use different information or contact support"
        );
      }

      // MongoDB connection errors
      if (error.name === "MongoError" || error.name === "MongoServerError") {
        return createErrorResponse(
          "Database service unavailable", 
          "Please try again in a few moments",
          503,
          undefined,
          "Our servers are experiencing high traffic"
        );
      }

      // Timeout errors
      if (error.name === "TimeoutError" || (error as any).message?.includes("timeout")) {
        return createErrorResponse(
          "Request timeout", 
          "The registration took too long to process",
          408,
          undefined,
          "Please try again with a stable internet connection"
        );
      }
    }

    // Generic server error
    return createErrorResponse(
      "Registration failed", 
      "An unexpected error occurred during registration",
      500,
      undefined,
      "Please try again. If the problem persists, contact support"
    );
  }
}

// Enhanced health check with system status
export async function GET(): Promise<NextResponse> {
  try {
    const healthCheck = {
      status: "healthy",
      message: "Enrollment API is running",
      timestamp: new Date().toISOString(),
      version: "2.0",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      rateLimitStore: rateLimitStore.size,
    };

    return NextResponse.json(healthCheck, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        message: "Health check failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}