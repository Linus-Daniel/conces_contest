import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project, { IProject } from "@/models/Project";
import Enroll, { IEnroll } from "@/models/Enroll";
import { Types } from "mongoose";

// 🔹 Helper: Transform candidate data into consistent format
function formatCandidate(candidate: Partial<IEnroll> | null) {
  return {
    fullName: candidate?.fullName || "Unknown",
    schoolName: candidate?.university || "Unknown School",
    department: candidate?.department || "Unknown Department",
    email: candidate?.email || "",
    avatar: candidate?.avatar || null,
  };
}

// 🔹 POST — Create Project
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const {
      candidate,
      projectTitle,
      designConcept,
      colorPalette,
      inspiration,
      primaryFileUrl,
      mockupUrl,
    } = await request.json();

    if (!candidate) {
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

const newProject = new Project({
  candidate: new Types.ObjectId(candidate),
  projectTitle,
  designConcept,
  colorPalette,
  inspiration,
  primaryFileUrl,
  mockupUrl,
  status: "submitted",
  submittedAt: new Date(),
});

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

// 🔹 GET — Fetch Projects
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const candidate = searchParams.get("candidate");
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status") || "approved";
    const enroll = await Enroll.find({});


    const query: Record<string, unknown> = { status };

    if (projectId) {
      const project = await Project.findById(projectId)
        .populate<{ candidate: IEnroll }>(
          "candidate",
          "fullName university department email avatar"
        )
        .lean();

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          project: {
            ...project,
            candidate: formatCandidate(project.candidate),
          },
        },
        { status: 200 }
      );
    }

    if (candidate) {
      query.candidate = new Types.ObjectId(candidate);
    }

    const projects = await Project.find(query)
      .populate<{ candidate: IEnroll }>(
        "candidate",
        "fullName university department email avatar"
      )
      .sort({ submittedAt: -1 })
      .lean();

    const transformedProjects = projects.map((project) => ({
      ...project,
      candidate: formatCandidate(project.candidate),
    }));

    return NextResponse.json(
      {
        success: true,
        projects: transformedProjects,
        total: transformedProjects.length,
      },
      { status: 200 }
    );
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

// 🔹 PATCH — Update Project
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const { projectId, ...updateData } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate<{ candidate: IEnroll }>(
        "candidate",
        "fullName university department email"
      )
      .lean();

    if (!updatedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Project updated successfully",
        project: {
          ...updatedProject,
          candidate: formatCandidate(updatedProject.candidate),
        },
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
