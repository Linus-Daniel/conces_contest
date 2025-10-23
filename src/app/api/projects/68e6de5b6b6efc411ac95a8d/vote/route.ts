import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { increment = 3 } = body;

    console.log(`\n=== Auto Vote Request ===`);
    console.log(`Project ID: 68e6de5b6b6efc411ac95a8d`);
    console.log(`Vote increment: ${increment}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    await connectDB();

    const projectId = "68e6de5b6b6efc411ac95a8d";
    
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