// api/vote/route.ts - Modified for no expiry, one-time use validation
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import OTP from "@/models/OTP";
import Vote from "@/models/Vote";
import crypto from "crypto";
import { detectBotAttack } from "@/lib/antiBot";

// Encryption function (same as in request-otp route)
function encrypt(text: string): string {
  try {
    if (!text || typeof text !== 'string') {
      console.error("Invalid input to encrypt function:", text);
      throw new Error("Invalid input for encryption");
    }

    const algorithm = "aes-256-gcm";
    const keyString =
      process.env.ENCRYPTION_KEY || "your-32-char-secret-key-here123";
    const key = crypto.createHash("sha256").update(keyString).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag();

    const result = iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted;
    console.log("Encryption successful, result length:", result.length);
    return result;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt phone number");
  }
}

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
    const { sessionId, otpCode } = body;

    console.log("\n=== Vote Confirmation Request ===");
    console.log("Session ID:", sessionId);
    console.log("OTP Code:", otpCode ? "PROVIDED" : "MISSING");
    console.log("User Agent:", botCheck.userAgent);
    console.log("IP Address:", botCheck.ipAddress);
    console.log("Timestamp:", new Date().toISOString());

    // Validate input
    if (!sessionId || !otpCode) {
      console.error("Missing required fields");
      return NextResponse.json(
        {
          error: "Missing information",
          message: "Session ID and OTP code are required",
        },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otpCode)) {
      console.error("Invalid OTP format:", otpCode);
      return NextResponse.json(
        {
          error: "Invalid OTP format",
          message: "OTP code must be 6 digits",
        },
        { status: 400 }
      );
    }

    await connectDB();
    console.log("Database connected");

    // Find the OTP session
    const otp = await OTP.findById(sessionId);
    console.log("OTP lookup completed");

    if (!otp) {
      console.error("OTP session not found:", { sessionId });
      return NextResponse.json(
        {
          error: "Invalid session",
          message:
            "The verification session could not be found. Please request a new code.",
        },
        { status: 404 }
      );
    }

    console.log("OTP Session found for phone:", otp.phoneNumber);
    console.log("Project ID:", otp.projectId);
    console.log("OTP used:", otp.used);
    console.log("Vote confirmed:", otp.voteConfirmed);
    console.log("Current attempts:", otp.attempts);

    // REMOVED: No expiry check since OTPs don't expire
    // The original expiry check has been removed

    // Check if OTP has already been used for voting
    if (otp.used && otp.voteConfirmed) {
      console.warn("OTP already used for voting");
      return NextResponse.json(
        {
          error: "Code already used",
          message:
            "This verification code has already been used to cast a vote and cannot be used again.",
        },
        { status: 400 }
      );
    }

    // Check if OTP has been marked as used (even without vote confirmation)
    if (otp.used) {
      console.warn("OTP already marked as used");
      return NextResponse.json(
        {
          error: "Code already used",
          message:
            "This verification code has already been used and cannot be used again.",
        },
        { status: 400 }
      );
    }

    // Check if maximum attempts exceeded
    if (otp.attempts >= 3) {
      console.warn("Maximum attempts exceeded");
      return NextResponse.json(
        {
          error: "Maximum attempts exceeded",
          message:
            "Maximum verification attempts exceeded. This code is now invalid.",
        },
        { status: 400 }
      );
    }

    // Check if OTP code matches
    if (otp.code !== otpCode) {
      console.warn("Invalid OTP code provided");

      // Increment attempts
      const updatedAttempts = otp.attempts + 1;
      await OTP.updateOne({ _id: sessionId }, { $inc: { attempts: 1 } });

      const remainingAttempts = 3 - updatedAttempts;
      return NextResponse.json(
        {
          error: "Invalid verification code",
          message:
            remainingAttempts > 0
              ? `Invalid code. ${remainingAttempts} attempt(s) remaining.`
              : "Invalid code. Maximum attempts exceeded. This code is now invalid.",
          remainingAttempts,
        },
        { status: 400 }
      );
    }

    console.log("✅ OTP code verified successfully");
    
    const project = await Project.findById(otp.projectId);
    if (!project) {
      console.error("Project not found:", otp.projectId);
      return NextResponse.json(
        {
          error: "Project not found",
          message: "The voting project no longer exists",
        },
        { status: 404 }
      );
    }

    console.log("Project found:", project.projectTitle);

    // Encrypt phone number for vote storage (consistent with request-otp route)
    console.log("Phone number to encrypt:", otp.phoneNumber ? "PROVIDED" : "MISSING");
    console.log("Phone number type:", typeof otp.phoneNumber);
    const encryptedPhone = encrypt(otp.phoneNumber);

    // Double-check: Has this phone number already voted for this project?
    const existingVote = await Vote.findOne({
      phoneNumber: encryptedPhone,
      projectId: otp.projectId,
    });

    if (existingVote) {
      console.warn("Phone number already voted for this project");
      return NextResponse.json(
        {
          error: "Already voted",
          message: "This phone number has already voted for this project",
        },
        { status: 409 }
      );
    }

    // Additional check: Has this phone number been used for any confirmed vote for this project?
    const existingConfirmedOTP = await OTP.findOne({
      phoneNumber: otp.phoneNumber,
      projectId: otp.projectId,
      used: true,
      voteConfirmed: true,
      _id: { $ne: otp._id }, // Exclude current session
    });

    if (existingConfirmedOTP) {
      console.warn("Phone number already used for confirmed vote");
      return NextResponse.json(
        {
          error: "Phone already used",
          message:
            "This phone number has already been used to vote for this project",
        },
        { status: 409 }
      );
    }

    console.log("✅ Phone number validation passed");

    // Get request metadata
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    console.log("Creating vote record...");
    console.log("Encrypted phone (length):", encryptedPhone?.length);
    console.log("Project ID:", otp.projectId);
    console.log("OTP ID:", otp._id?.toString());

    if (!encryptedPhone || !otp.projectId || !otp._id) {
      console.error("Missing required vote data:", {
        hasEncryptedPhone: !!encryptedPhone,
        hasProjectId: !!otp.projectId,
        hasOtpId: !!otp._id
      });
      throw new Error("Missing required vote data");
    }

    const newVote = new Vote({
      phoneNumber: encryptedPhone,
      voterEmail: otp.email ? encrypt(otp.email) : undefined,
      projectId: otp.projectId,
      otpId: otp._id.toString(),
      ipAddress,
      userAgent,
    });

    console.log(" New Vote Data", newVote)

    await newVote.save();
    console.log("✅ Vote record created with ID:", newVote._id);

    // Mark OTP as used and vote confirmed
    await OTP.updateOne(
      { _id: sessionId },
      {
        $set: {
          used: true,
          voteConfirmed: true,
        },
      }
    );
    console.log("✅ OTP marked as used and vote confirmed");

    // Increment project vote count
    const updatedProject = await Project.findByIdAndUpdate(
      otp.projectId,
      { $inc: { vote: 1 } },
      { new: true }
    ).populate("candidate", "firstName lastName fullName");

    console.log(
      `🎉 VOTE CONFIRMED: Project "${updatedProject?.projectTitle}" now has ${updatedProject?.vote} votes`
    );
    console.log("=== Vote Confirmation Completed Successfully ===\n");

    return NextResponse.json({
      success: true,
      message:
        "Vote confirmed successfully! Your OTP has been used and is no longer valid.",
      project: {
        id: updatedProject?._id,
        title: updatedProject?.projectTitle,
        currentVotes: updatedProject?.vote,
        candidate: updatedProject?.candidate,
      },
      newVoteCount: updatedProject?.vote,
      voteConfirmedAt: new Date(),
      phoneNumber: otp.phoneNumber.replace(
        /(\+234)(\d{3})(\d{3})(\d{4})/,
        "$1$2***$4"
      ),
    });
  } catch (error: any) {
    console.error("=== Unexpected Error in Vote Confirmation ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    console.error("Timestamp:", new Date().toISOString());

    return NextResponse.json(
      {
        error: "Something went wrong",
        message:
          "An unexpected error occurred while confirming your vote. Please try again.",
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
