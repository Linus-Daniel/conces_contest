import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project, { IProject } from "@/models/Project";
import Enroll, { IEnroll } from "@/models/Enroll";
import { Types } from "mongoose";

// 🔹 Helper: Transform candidate data into consistent format
function formatCandidate(candidate: Partial<IEnroll> | null) {
  return {
    fullName: candidate?.fullName || "Unknown",
    schoolName: candidate?.institution || "Unknown School",
    department: candidate?.department || "Unknown Department",
    email: candidate?.email || "",
    _id:candidate?._id,
    avatar: candidate?.avatar || null,
    isQualified: candidate?.isQualified ?? true, // ✅ Added isQualified field
    matricNumber: candidate?.matricNumber || "", // ✅ Added matricNumber for completeness
    phone: candidate?.phone || "", // ✅ Added phone for completeness
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
    const onlyQualified = searchParams.get("onlyQualified") !== "false"; // Default to true

    const query: Record<string, unknown> = { status };
    const enroll = await Enroll.find({})

    if (projectId) {
      const project = await Project.findById(projectId)
        .populate<{ candidate: IEnroll }>(
          "candidate",
          "_id fullName institution isQualified department email avatar matricNumber phone"
        )
        .lean();

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      // Check if candidate is qualified (if onlyQualified is true)
      if (onlyQualified && !project.candidate?.isQualified) {
        return NextResponse.json(
          { error: "Project not found or candidate not qualified" },
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

    // Get all projects first
    const allProjects = await Project.find(query)
      .populate<{ candidate: IEnroll }>(
        "candidate",
        "_id fullName institution isQualified department email avatar matricNumber phone"
      )
      .sort({ totalVotes: -1, submittedAt: -1 }) // Sort by votes first, then by submission date
      .lean();

    // Filter for qualified candidates only (if onlyQualified is true)
    const filteredProjects = onlyQualified
      ? allProjects.filter((project) => project.candidate?.isQualified === true)
      : allProjects;

    const transformedProjects = filteredProjects.map((project) => ({
      ...project,
      candidate: formatCandidate(project.candidate),
    }));

    // Calculate total votes across all qualified projects
    const totalVotes = transformedProjects.reduce(
      (sum, project) => sum + (project.vote || 0),
      0
    );

    // Get voting statistics
    const votingStats = {
      totalVotes,
      totalProjects: transformedProjects.length,
      totalQualifiedCandidates: transformedProjects.length,
      averageVotesPerProject:
        transformedProjects.length > 0
          ? Math.round(totalVotes / transformedProjects.length)
          : 0,
      topVoted: transformedProjects.slice(0, 5).map((p) => ({
        projectTitle: p.projectTitle,
        candidate: p.candidate.fullName,
        votes: p.vote || 0,
      })),
    };

    return NextResponse.json(
      {
        success: true,
        projects: transformedProjects,
        total: transformedProjects.length,
        votingStats,
        filters: {
          status,
          onlyQualified,
        },
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
        "_id fullName institution isQualified department email avatar matricNumber phone" // ✅ Added isQualified, matricNumber, phone
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
