import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb"; // Adjust path to your connectDB
import Project from "@/models/Project";

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Parse the request body
    const body = await request.json();

    // Extract candidateId from headers or body
    // Assuming you're sending it from the frontend
    const {
      candidateId,
      projectTitle,
      designConcept,
      colorPalette,
      inspiration,
      primaryFileUrl,
      mockupUrl,
    } = body;

    // Validate required fields
    if (!candidateId) {
      return NextResponse.json(
        { error: "Candidate ID is required" },
        { status: 401 }
      );
    }

    if (!projectTitle || !designConcept || !colorPalette || !inspiration) {
      return NextResponse.json(
        { error: "All project details are required" },
        { status: 400 }
      );
    }

    if (!primaryFileUrl) {
      return NextResponse.json(
        { error: "Primary logo file is required" },
        { status: 400 }
      );
    }

    // Create new project
    const newProject = new Project({
      candidateId,
      projectTitle,
      designConcept,
      colorPalette,
      inspiration,
      primaryFileUrl,
      mockupUrl,
      status: "submitted",
      submittedAt: new Date(),
    });

    // Save to database
    const savedProject = await newProject.save();

    return NextResponse.json(
      {
        success: true,
        message: "Project submitted successfully",
        projectId: savedProject._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Project submission error:", error);

    return NextResponse.json(
      {
        error: "Failed to submit project",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve projects
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get("candidateId");
    const projectId = searchParams.get("projectId");

    let query = {};

    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ project }, { status: 200 });
    }

    if (candidateId) {
      query = { candidateId };
    }

    const projects = await Project.find(query).sort({ submittedAt: -1 });

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch projects",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update project (for draft functionality)
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { projectId, ...updateData } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Project updated successfully",
        project: updatedProject,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      {
        error: "Failed to update project",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
