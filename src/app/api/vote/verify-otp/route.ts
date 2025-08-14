import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import OTP from "@/models/OTP";
import Vote from "@/models/Vote";
import Project from "@/models/Project";
import { formatNigerianPhone } from "@/lib/sms/smsService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, code, projectId } = body;

    // Validate input
    if (!phoneNumber || !code || !projectId) {
      return NextResponse.json(
        { error: "Phone number, code, and project ID are required" },
        { status: 400 }
      );
    }

    const formattedPhone = formatNigerianPhone(phoneNumber);

    await connectDB();

    // Find OTP
    const otp = await OTP.findOne({
      phoneNumber: formattedPhone,
      code: code.toString(),
      projectId,
      used: false,
    });

    if (!otp) {
      // Increment attempts for any OTP with this phone/project
      await OTP.updateMany(
        {
          phoneNumber: formattedPhone,
          projectId,
          used: false,
        },
        { $inc: { attempts: 1 } }
      );

      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Check if expired
    if (otp.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Verification code has expired" },
        { status: 400 }
      );
    }

    // Check attempts
    if (otp.attempts >= 3) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new code" },
        { status: 400 }
      );
    }

    // Mark OTP as used
    otp.used = true;
    await otp.save();

    // Create vote
    const phoneHash = (Vote as any).hashPhone(formattedPhone);

    // Get IP and user agent
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Check again for existing vote (double-check)
    const existingVote = await Vote.findOne({
      phoneNumberHash: phoneHash,
      projectId,
    });

    if (existingVote) {
      return NextResponse.json(
        { error: "You have already voted for this design" },
        { status: 409 }
      );
    }

    // Create new vote
    const vote = new Vote({
      phoneNumberHash: phoneHash,
      projectId,
      ipAddress,
      userAgent,
      verified: true,
    });

    await vote.save();

    // Update project vote count
    const project = await Project.findByIdAndUpdate(
      projectId,
      { $inc: { vote: 1 } },
      { new: true }
    );

    if (!project) {
      // Rollback vote if project not found
      await Vote.deleteOne({ _id: vote._id });
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Vote recorded successfully!",
      newVoteCount: project.vote,
    });
  } catch (error: any) {
    console.error("Error verifying OTP:", error);

    // Handle duplicate vote error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "You have already voted for this design" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 }
    );
  }
}
