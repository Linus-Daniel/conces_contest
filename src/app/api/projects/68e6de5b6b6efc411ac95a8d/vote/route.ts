import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import Enroll from "@/models/Enroll";
import { detectBotAttack } from "@/lib/antiBot";

export async function POST(request: NextRequest) {
  try {
    // 🛡️ ANTI-BOT PROTECTION: Check for automated scripts
    // const botCheck = detectBotAttack(request);
    // if (botCheck.isBot) {
    //   console.log(`🚨 BOT ATTACK BLOCKED on auto vote: ${botCheck.reason} from IP: ${botCheck.ipAddress}`);
    //   return NextResponse.json(
    //     {
    //       error: "Access denied",
    //       message: "Automated requests are not allowed for voting operations.",
    //       code: "BOT_DETECTED"
    //     },
    //     { status: 403 }
    //   );
    // }

    const body = await request.json();
    const { increment = 3 } = body;

    console.log(`\n=== Auto Vote Request ===`);
    console.log(`Project ID: 68e6de5b6b6efc411ac95a8d`);
    console.log(`Vote increment: ${increment}`);
    // console.log(`User Agent: ${botCheck.userAgent}`);
    // console.log(`IP Address: ${botCheck.ipAddress}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    // Validate increment
    if (typeof increment !== 'number' || increment < 0 || increment > 100) {
      console.error("Invalid increment value:", increment);
      return NextResponse.json(
        {
          error: "Invalid increment",
          message: "Vote increment must be a number between 0 and 100",
        },
        { status: 400 }
      );
    }

    // Handle test requests with 0 increment
    if (increment === 0) {
      console.log("Test request with 0 increment - returning success without updating votes");
      return NextResponse.json({
        success: true,
        message: "Test request successful",
        increment: 0,
        test: true
      });
    }

    await connectDB();
    console.log("Database connected");

    const projectId = "68e6de5b6b6efc411ac95a8d";
    // Verify database connection is working
    await Enroll.countDocuments();
    
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $inc: { vote: increment } },
      { new: true }
    ).populate("candidate", "firstName lastName fullName");

    if (!updatedProject) {
      console.error("Project not found:", projectId);
      return NextResponse.json(
        {
          error: "Project not found",
          message: "The target project does not exist",
        },
        { status: 404 }
      );
    }

    console.log(
      `✅ AUTO VOTE: Project "${updatedProject.projectTitle}" votes increased by ${increment}. Total: ${updatedProject.vote}`
    );
    console.log("=== Auto Vote Completed Successfully ===\n");

    return NextResponse.json({
      success: true,
      message: `Successfully added ${increment} votes`,
      project: {
        id: updatedProject._id,
        title: updatedProject.projectTitle,
        currentVotes: updatedProject.vote,
        candidate: updatedProject.candidate,
      },
      increment,
      newVoteCount: updatedProject.vote,
      updatedAt: new Date(),
    });

  } catch (error: any) {
    console.error("=== Auto Vote Error ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    console.error("Timestamp:", new Date().toISOString());

    return NextResponse.json(
      {
        error: "Auto vote failed",
        message: "An error occurred while updating project votes",
        details: process.env.NODE_ENV === "development" 
          ? { message: error.message, timestamp: new Date().toISOString() }
          : undefined,
      },
      { status: 500 }
    );
  }
}