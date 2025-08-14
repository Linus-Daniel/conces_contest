import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import Vote from "@/models/Vote";
import crypto from "crypto";

function encrypt(text: string): string {
  const algorithm = "aes-256-gcm";

  // Create a proper 32-byte key for AES-256
  const keyString =
    process.env.ENCRYPTION_KEY || "your-32-char-secret-key-here123";

  // Hash the key string to ensure it's exactly 32 bytes
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

  // Create the same 32-byte key
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

// Create voter hash
function createVoterHash(email: string, phone: string): string {
  return crypto
    .createHash("sha256")
    .update(`${email.toLowerCase().trim()}-${phone.trim()}`)
    .digest("hex");
}

// Validate Nigerian phone number
function validateNigerianPhone(phone: string): boolean {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "");

  // Check various Nigerian phone number formats
  const patterns = [
    /^234[789]\d{9}$/, // +234 format without +
    /^0[789]\d{9}$/, // 0 prefix format
    /^[789]\d{9}$/, // Without country code or 0
  ];

  return patterns.some((pattern) => pattern.test(cleaned));
}

// Format Nigerian phone number
function formatNigerianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  // Convert to standard +234 format
  if (cleaned.startsWith("234")) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith("0")) {
    return `+234${cleaned.slice(1)}`;
  } else if (cleaned.length === 10 && /^[789]/.test(cleaned)) {
    return `+234${cleaned}`;
  }

  return phone; // Return original if can't format
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, voterEmail, voterPhone } = body;

    // Validate input
    if (!projectId || !voterEmail || !voterPhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(voterEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Phone validation (Nigerian format)
    if (!validateNigerianPhone(voterPhone)) {
      return NextResponse.json(
        {
          error:
            "Invalid Nigerian phone number format. Use formats like: 08012345678, +2348012345678, or 8012345678",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if project exists and is votable
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Only allow voting on submitted projects (uncomment if needed)
    // if (!["submitted", "selected"].includes(project.status)) {
    //   return NextResponse.json(
    //     { error: "This project is not available for voting" },
    //     { status: 403 }
    //   );
    // }

    // Format phone number to standard format
    const formattedPhone = formatNigerianPhone(voterPhone);

    // Create voter hash and check for existing vote
    const voterHash = createVoterHash(voterEmail, formattedPhone);

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

    // Get IP and user agent
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create new vote with encrypted data
    const vote = new Vote({
      projectId,
      voterHash,
      voterEmail: encrypt(voterEmail),
      voterPhone: encrypt(formattedPhone),
      ipAddress,
      userAgent,
    });




    await vote.save();

    // Update project vote count atomically
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $inc: { vote: 1 } },
      { new: true }
    );

    console.log(updatedProject);
    return NextResponse.json({
      success: true,
      message: "Vote submitted successfully",
      newVoteCount: updatedProject?.vote || 1,
    });
  } catch (error: any) {
    console.error("Error submitting vote:", error);

    // Handle duplicate vote error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "You have already voted for this design" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit vote" },
      { status: 500 }
    );
  }
}

// Get vote statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    await connectDB();

    if (projectId) {
      // Get votes for specific project
      const voteCount = await Vote.countDocuments({ projectId });

      // Get hourly voting trend for last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const hourlyVotes = await Vote.aggregate([
        {
          $match: {
            projectId,
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
      // Get overall statistics
      const totalVotes = await Vote.countDocuments();
      const uniqueVoters = await Vote.distinct("voterHash");
      const topProjects = await Vote.aggregate([
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
  } catch (error) {
    console.error("Error fetching vote statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}

// Utility endpoint to decrypt data (for admin use only)
export async function PATCH(request: NextRequest) {
  try {
    // Add authentication check here for admin only
    const { encryptedData } = await request.json();

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
  } catch (error) {
    console.error("Error decrypting data:", error);
    return NextResponse.json(
      { error: "Failed to decrypt data" },
      { status: 500 }
    );
  }
}
