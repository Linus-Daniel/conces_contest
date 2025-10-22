import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import OTP from "@/models/OTP";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phoneNumber } = body;

    console.log("\n=== Check Email OTP Request ===");
    console.log("Email:", email);
    console.log("Phone:", phoneNumber);
    console.log("Timestamp:", new Date().toISOString());

    // Validate input
    if (!email && !phoneNumber) {
      console.error("Missing email or phone number");
      return NextResponse.json(
        {
          error: "Missing information",
          message: "Please provide either email or phone number",
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();
    console.log("Database connected");

    // Build query to find existing OTP
    const query: any = {
      used: false,
      $or: []
    };

    if (email) {
      query.$or.push({ email: email.toLowerCase().trim() });
    }
    
    if (phoneNumber) {
      // Normalize phone number for consistent search
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      let normalizedPhone = phoneNumber;
      
      if (cleanPhone.startsWith("234")) {
        normalizedPhone = "+" + cleanPhone;
      } else if (cleanPhone.startsWith("0")) {
        normalizedPhone = "+234" + cleanPhone.slice(1);
      } else if (cleanPhone.length === 10) {
        normalizedPhone = "+234" + cleanPhone;
      }
      
      query.$or.push({ phoneNumber: normalizedPhone });
    }

    // If no valid search criteria, return no active OTP
    if (query.$or.length === 0) {
      return NextResponse.json({
        hasActiveOTP: false,
        message: "No active OTP found",
      });
    }

    // Find the most recent unused OTP
    const existingOTP = await OTP.findOne(query)
      .sort({ createdAt: -1 });

    console.log("Existing OTP found:", !!existingOTP);

    if (existingOTP) {
      // Check if OTP is expired
      const now = new Date();
      const expiresAt = existingOTP.expiresAt;
      
      if (expiresAt && now > expiresAt) {
        console.log("OTP found but expired");
        return NextResponse.json({
          hasActiveOTP: false,
          message: "Previous OTP has expired",
          expired: true,
        });
      }

      // Calculate remaining time
      let expiresIn: number | null = null;
      if (expiresAt) {
        expiresIn = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      }

      console.log("Active OTP found with", expiresIn, "seconds remaining");

      return NextResponse.json({
        hasActiveOTP: true,
        sessionId: existingOTP._id,
        email: existingOTP.email,
        phoneNumber: existingOTP.phoneNumber,
        expiresIn,
        message: "Active verification code found",
      });
    }

    console.log("No active OTP found");
    return NextResponse.json({
      hasActiveOTP: false,
      message: "No active OTP found",
    });

  } catch (error: any) {
    console.error("=== Error in Check Email OTP ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);

    return NextResponse.json(
      {
        error: "Something went wrong",
        message: "We encountered an error while checking for existing codes. Please try again.",
        details: process.env.NODE_ENV === "development"
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