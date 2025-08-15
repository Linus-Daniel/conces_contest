// api/vote/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import Vote from "@/models/Vote";
import crypto from "crypto";
import Enroll from "@/models/Enroll";
import mongoose from "mongoose";

// Types for better type safety
interface VoteRequestBody {
  sessionId: string;
  otpCode: string;
}

interface DecryptRequestBody {
  encryptedData: string;
}

// WhatsApp Service for confirmations
class WhatsAppService {
  private accessToken: string;
  private phoneNumberId: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN!;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  }

  async sendVoteConfirmation(
    phoneNumber: string,
    projectTitle: string,
    voteId: string
  ): Promise<boolean> {
    try {
      const message = `✅ **Vote Confirmed!**

Your vote for "${projectTitle}" has been successfully recorded.

🗳️ Vote ID: ${voteId.slice(-8)}
⏰ Time: ${new Date().toLocaleString("en-NG", {
        timeZone: "Africa/Lagos",
        dateStyle: "medium",
        timeStyle: "short",
      })}

Thank you for participating in the CONCES design voting! 🙏`;

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
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

      return response.ok;
    } catch (error) {
      console.error("Failed to send WhatsApp confirmation:", error);
      return false;
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

function decrypt(encryptedText: string): string {
  const algorithm = "aes-256-gcm";
  const keyString =
    process.env.ENCRYPTION_KEY || "your-32-char-secret-key-here123";
  const key = crypto.createHash("sha256").update(keyString).digest();

  const [ivHex, authTagHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// Create voter hash (same as your original)
function createVoterHash(email: string, phone: string): string {
  return crypto
    .createHash("sha256")
    .update(`${email.toLowerCase().trim()}-${phone.trim()}`)
    .digest("hex");
}

// UPDATED POST method - now verifies OTP before voting
export async function POST(request: NextRequest) {
  try {
    const body: VoteRequestBody = await request.json();
    const { sessionId, otpCode } = body;

    // Validate input
    if (!sessionId || !otpCode) {
      return NextResponse.json(
        { error: "Session ID and OTP code are required" },
        { status: 400 }
      );
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otpCode)) {
      return NextResponse.json(
        { error: "Invalid OTP format. Please enter a 6-digit code." },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the OTP session
    const otpSession = await Vote.findById(sessionId);

    if (!otpSession) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 404 }
      );
    }

    if (otpSession.status !== "pending") {
      if (otpSession.status === "confirmed") {
        return NextResponse.json(
          { error: "This vote has already been confirmed" },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: "This session has expired" },
          { status: 400 }
        );
      }
    }

    // Check if OTP exists and is not expired
    if (!otpSession.otp) {
      return NextResponse.json(
        { error: "No OTP found for this session" },
        { status: 400 }
      );
    }

    // Check if OTP expired
    if (new Date() > otpSession.otp.expiresAt) {
      otpSession.status = "expired";
      await otpSession.save();

      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if OTP already used
    if (otpSession.otp.used) {
      return NextResponse.json(
        { error: "This verification code has already been used" },
        { status: 400 }
      );
    }

    // Check attempt limit
    if (otpSession.otp.attempts >= 3) {
      otpSession.status = "expired";
      await otpSession.save();

      return NextResponse.json(
        { error: "Too many incorrect attempts. Please request a new code." },
        { status: 400 }
      );
    }

    // Verify OTP
    if (otpSession.otp.code !== otpCode) {
      otpSession.otp.attempts += 1;
      await otpSession.save();

      const remainingAttempts = 3 - otpSession.otp.attempts;

      if (remainingAttempts === 0) {
        otpSession.status = "expired";
        await otpSession.save();

        return NextResponse.json(
          { error: "Too many incorrect attempts. Please request a new code." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: "Invalid verification code",
          remainingAttempts,
        },
        { status: 400 }
      );
    }

    // OTP is valid! Now process the vote

    // Double-check project exists
    const project = await Project.findById(otpSession.projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Double-check no vote exists (race condition protection)
    const existingVote = await Vote.findOne({
      projectId: otpSession.projectId,
      voterHash: otpSession.voterHash,
      status: "confirmed",
    });

    if (existingVote) {
      return NextResponse.json(
        { error: "You have already voted for this design" },
        { status: 409 }
      );
    }

    // Mark OTP as used and confirm the vote
    otpSession.otp.used = true;
    otpSession.status = "confirmed";
    otpSession.votedAt = new Date();
    await otpSession.save();

    // Update project vote count atomically
    const updatedProject = await Project.findByIdAndUpdate(
      otpSession.projectId,
      { $inc: { vote: 1 } },
      { new: true }
    );

    // Send WhatsApp confirmation (optional - don't fail if this fails)
    try {
      const whatsAppService = new WhatsAppService();
      const decryptedPhone = decrypt(otpSession.voterPhone);
      await whatsAppService.sendVoteConfirmation(
        decryptedPhone,
        project.projectTitle,
        otpSession._id.toString()
      );
    } catch (confirmationError) {
      console.error("Failed to send WhatsApp confirmation:", confirmationError);
      // Don't fail the vote if confirmation fails
    }

    console.log(
      `Vote confirmed: ${project.projectTitle} - ${otpSession._id} - Total votes: ${updatedProject?.vote}`
    );

    return NextResponse.json({
      success: true,
      message: "Vote submitted successfully",
      newVoteCount: updatedProject?.vote || 1,
      voteId: otpSession._id,
      projectTitle: project.projectTitle,
    });
  } catch (error: unknown) {
    console.error("Error submitting vote:", error);

    return NextResponse.json(
      { error: "Failed to submit vote" },
      { status: 500 }
    );
  }
}

// Get vote statistics (keep your existing GET method)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const enroll = await Enroll.find({});

    await connectDB();

    if (projectId) {
      // Validate projectId format
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return NextResponse.json(
          { error: "Invalid project ID format" },
          { status: 400 }
        );
      }

      // Get votes for specific project (only confirmed votes)
      const voteCount = await Vote.countDocuments({
        projectId: new mongoose.Types.ObjectId(projectId),
        status: "confirmed",
      });

      // Get hourly voting trend for last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const hourlyVotes = await Vote.aggregate([
        {
          $match: {
            projectId: new mongoose.Types.ObjectId(projectId),
            status: "confirmed",
            votedAt: { $gte: twentyFourHoursAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d-%H",
                date: "$votedAt",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return NextResponse.json({
        success: true,
        totalVotes: voteCount,
        hourlyTrend: hourlyVotes,
      });
    } else {
      // Get overall statistics (only confirmed votes)
      const totalVotes = await Vote.countDocuments({ status: "confirmed" });
      const uniqueVoters = await Vote.distinct("voterHash", {
        status: "confirmed",
      });
      const topProjects = await Vote.aggregate([
        {
          $match: { status: "confirmed" },
        },
        {
          $group: {
            _id: "$projectId",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "projects",
            localField: "_id",
            foreignField: "_id",
            as: "project",
          },
        },
        {
          $unwind: "$project",
        },
        {
          $project: {
            projectId: "$_id",
            projectTitle: "$project.projectTitle",
            candidate: "$project.candidate",
            voteCount: "$count",
          },
        },
      ]);

      return NextResponse.json({
        success: true,
        totalVotes,
        uniqueVoters: uniqueVoters.length,
        topProjects,
      });
    }
  } catch (error: unknown) {
    console.error("Error fetching vote statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}

// Utility endpoint to decrypt data (for admin use only) - keep your existing PATCH method
export async function PATCH(request: NextRequest) {
  try {
    // Add authentication check here for admin only
    const body: DecryptRequestBody = await request.json();
    const { encryptedData } = body;

    if (!encryptedData) {
      return NextResponse.json(
        { error: "No encrypted data provided" },
        { status: 400 }
      );
    }

    const decryptedData = decrypt(encryptedData);

    return NextResponse.json({
      success: true,
      decryptedData,
    });
  } catch (error: unknown) {
    console.error("Error decrypting data:", error);
    return NextResponse.json(
      { error: "Failed to decrypt data" },
      { status: 500 }
    );
  }
}
