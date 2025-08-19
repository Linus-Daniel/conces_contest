// api/vote/route.ts - Updated vote confirmation endpoint
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import OTP from "@/models/OTP";
import Vote from "@/models/Vote";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, otpCode } = body;

    // Validate input
    if (!sessionId || !otpCode) {
      return NextResponse.json(
        { error: "Session ID and OTP code are required" },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otpCode)) {
      return NextResponse.json(
        { error: "Invalid OTP code format" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the OTP session
    const otpSession = await OTP.findById(sessionId);

    if (!otpSession) {
      return NextResponse.json({ error: "Invalid session" }, { status: 404 });
    }

    // Check if OTP has expired
    if (new Date() > otpSession.expiresAt) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if OTP has already been used
    if (otpSession.used) {
      return NextResponse.json(
        { error: "This verification code has already been used" },
        { status: 400 }
      );
    }

    // Check if maximum attempts exceeded
    if (otpSession.attempts >= 3) {
      return NextResponse.json(
        {
          error:
            "Maximum verification attempts exceeded. Please request a new code.",
        },
        { status: 400 }
      );
    }

    // Check if OTP code matches
    if (otpSession.code !== otpCode) {
      // Increment attempts
      await OTP.updateOne({ _id: sessionId }, { $inc: { attempts: 1 } });

      const remainingAttempts = 3 - (otpSession.attempts + 1);
      return NextResponse.json(
        {
          error: "Invalid verification code",
          remainingAttempts,
          message:
            remainingAttempts > 0
              ? `${remainingAttempts} attempt(s) remaining`
              : "No attempts remaining. Please request a new code.",
        },
        { status: 400 }
      );
    }

    // Check if project still exists
    const project = await Project.findById(otpSession.projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Double-check: Has this phone number already voted for this project?
    const existingVote = await Vote.findOne({
      phoneNumber: otpSession.phoneNumber,
      projectId: otpSession.projectId,
    });

    if (existingVote) {
      return NextResponse.json(
        { error: "You have already voted for this design" },
        { status: 409 }
      );
    }

    // Get request metadata
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

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

    // Create vote record
    const newVote = new Vote({
      phoneNumber: otpSession.phoneNumber,
      projectId: otpSession.projectId,
      otpId: otpSession._id,
      ipAddress,
      userAgent,
    });

    await newVote.save();

    // Increment project vote count
    const updatedProject = await Project.findByIdAndUpdate(
      otpSession.projectId,
      { $inc: { vote: 1 } },
      { new: true }
    ).populate("candidate", "firstName lastName fullName");

    console.log(
      `🔴 VOTE CONFIRMED: Project ${updatedProject?.projectTitle} now has ${updatedProject?.vote} votes`
    );

    return NextResponse.json({
      success: true,
      message: "Vote confirmed successfully!",
      project: {
        id: updatedProject?._id,
        title: updatedProject?.projectTitle,
        currentVotes: updatedProject?.vote,
        candidate: updatedProject?.candidate,
      },
      newVoteCount: updatedProject?.vote,
      voteConfirmedAt: new Date(),
    });
  } catch (error: any) {
    console.error("Unexpected error in vote confirmation:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: "An unexpected error occurred. Please try again.",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
