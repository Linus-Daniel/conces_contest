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
    _id: candidate?._id,
    avatar: candidate?.avatar || null,
    isQualified: candidate?.isQualified ?? true,
    matricNumber: candidate?.matricNumber || "",
    phone: candidate?.phone || "",
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
      primaryFileUrls,
      mockupUrls,
    } = await request.json();

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate ID is required" },
        { status: 401 }
      );
    }

    // ✅ Check if candidate exists and is qualified
    const candidateRecord = await Enroll.findById(candidate);
    if (!candidateRecord) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    if (!candidateRecord.isQualified) {
      return NextResponse.json(
        { error: "You are not qualified to submit a project" },
        { status: 403 }
      );
    }

    // ✅ Check if candidate has already submitted a project
    const existingProject = await Project.findOne({
      candidate: new Types.ObjectId(candidate),
    });
    if (existingProject) {
      return NextResponse.json(
        {
          error: "You have already submitted a project for this contest",
          existingProject: {
            _id: existingProject._id,
            projectTitle: existingProject.projectTitle,
            status: existingProject.status,
            submittedAt: existingProject.submittedAt,
          },
        },
        { status: 409 } // Conflict status code
      );
    }

    if (!projectTitle || !designConcept || !colorPalette || !inspiration) {
      return NextResponse.json(
        { error: "All project details are required" },
        { status: 400 }
      );
    }

    if (!primaryFileUrls) {
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
      primaryFileUrls,
      mockupUrls,
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

    // ✅ Handle duplicate submission error specifically
    if (error instanceof Error && error.message.includes("already submitted")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      {
        error: "Failed to submit project",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// 🔹 GET — Fetch Projects (Updated to include submission status check)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const candidate = searchParams.get("candidate");
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status") || "submitted" || "approved";
    const onlyQualified = searchParams.get("onlyQualified") !== "false";
    const checkSubmission = searchParams.get("checkSubmission") === "true"; // ✅ New parameter

    // ✅ Check if specific candidate has submitted a project
    if (checkSubmission && candidate) {
      const existingProject = await Project.findOne({
        candidate: new Types.ObjectId(candidate),
      })
        .populate<{ candidate: IEnroll }>(
          "candidate",
          "_id fullName institution isQualified department email avatar matricNumber phone"
        )
        .lean();

      return NextResponse.json(
        {
          hasSubmitted: !!existingProject,
          project: existingProject
            ? {
                ...existingProject,
                candidate: formatCandidate(existingProject.candidate),
              }
            : null,
        },
        { status: 200 }
      );
    }

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

    // Get all projects
    const allProjects = await Project.find({})
      .populate<{ candidate: IEnroll }>(
        "candidate",
        "_id fullName institution isQualified department email avatar matricNumber phone"
      )
      .sort({ totalVotes: -1, submittedAt: -1 })
      .lean();

    const filteredProjects = onlyQualified
      ? allProjects.filter((project) => project.candidate?.isQualified === true)
      : allProjects;

    const transformedProjects = filteredProjects.map((project) => ({
      ...project,
      candidate: formatCandidate(project.candidate),
    }));

    const totalVotes = transformedProjects.reduce(
      (sum, project) => sum + (project.vote || 0),
      0
    );

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
        "_id fullName institution isQualified department email avatar matricNumber phone"
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
