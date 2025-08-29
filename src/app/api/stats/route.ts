import Enroll from "@/models/Enroll";
import Project from "@/models/Project";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

// Type definitions for the response
interface ContestantStats {
  total: number;
  qualified: number;
  disqualified: number;
  contestPackSent: number;
  contestPackPending: number;
}

interface ProjectStats {
  total: number;
  byStatus: {
    draft: number;
    submitted: number;
    reviewed: number;
    selected: number;
    rejected: number;
  };
  totalVoted: number;
  totalSubmissions: number;
  averageVote: number;
  withMockup: number;
  withFeedback: number;
  totalPrimaryFiles: number;
  totalMockupFiles: number;
}

interface EngagementStats {
  submissionRate: string;
  qualificationRate: string;
  completionRate: string;
}

interface RecentActivityStats {
  newContestants: number;
  newSubmissions: number;
}

interface SummaryStats {
  totalCandidates: number;
  totalSubmissions: number;
  totalVoted: number;
  qualified: number;
  disqualified: number;
}

interface StatsResponse {
  contestants: ContestantStats;
  projects: ProjectStats;
  engagement: EngagementStats;
  recentActivity: RecentActivityStats;
  summary: SummaryStats;
}

interface ApiResponse {
  message: string;
  data?: StatsResponse;
  timestamp?: string;
  error?: string;
}

// Helper function to safely check if an array has valid content
function hasValidFiles(files: any): boolean {
  if (!files) return false;
  if (Array.isArray(files)) {
    return (
      files.length > 0 &&
      files.some(
        (file) =>
          file &&
          (typeof file === "string"
            ? file.trim() !== ""
            : file.url && file.url.trim() !== "")
      )
    );
  }
  // Handle legacy single file format
  if (typeof files === "string") {
    return files.trim() !== "";
  }
  return false;
}

// Helper function to count total files in arrays
function countFiles(files: any): number {
  if (!files) return 0;
  if (Array.isArray(files)) {
    return files.filter(
      (file) =>
        file &&
        (typeof file === "string"
          ? file.trim() !== ""
          : file.url && file.url.trim() !== "")
    ).length;
  }
  // Handle legacy single file format
  if (typeof files === "string" && files.trim() !== "") {
    return 1;
  }
  return 0;
}

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  await connectDB();

  try {
    // Get all contestants and projects
    const contestants = await Enroll.find({});
    const projects = await Project.find({});

    if (!contestants || !projects) {
      console.log("Stats are not complete");
      return NextResponse.json<ApiResponse>(
        {
          message: "Some stats are not available",
        },
        { status: 404 }
      );
    }

    // Calculate total files across all projects
    const totalPrimaryFiles = projects.reduce((sum, project) => {
      return (
        sum + countFiles(project.primaryFileUrls)
      );
    }, 0);

    const totalMockupFiles = projects.reduce((sum, project) => {
      return sum + countFiles(project.mockupUrls);
    }, 0);

    // Calculate projects with mockups (supporting both old and new formats)
    const projectsWithMockup = projects.filter(
      (project) =>
        hasValidFiles(project.mockupUrls) 
    ).length;

    // Calculate detailed statistics
    const stats: StatsResponse = {
      // Contestant Statistics
      contestants: {
        total: contestants.length,
        qualified: contestants.filter((c) => c.isQualified === true).length,
        disqualified: contestants.filter((c) => c.isQualified === false).length,
        contestPackSent: contestants.filter((c) => c.contestPack?.sent === true)
          .length,
        contestPackPending: contestants.filter(
          (c) => c.contestPack?.sent === false || !c.contestPack?.sent
        ).length,
      },

      // Project Statistics
      projects: {
        total: projects.length,
        byStatus: {
          draft: projects.filter((p) => p.status === "draft").length,
          submitted: projects.filter((p) => p.status === "submitted").length,
          reviewed: projects.filter((p) => p.status === "reviewed").length,
          selected: projects.filter((p) => p.status === "selected").length,
          rejected: projects.filter((p) => p.status === "rejected").length,
        },
        totalVoted: projects.filter((p) => p.vote && p.vote > 0).length,
        totalSubmissions: projects.filter((p) => p.status !== "draft").length,
        averageVote:
          projects.length > 0
            ? Math.round(
                (projects.reduce((sum, p) => sum + (p.vote || 0), 0) /
                  projects.length) *
                  100
              ) / 100 // Round to 2 decimal places
            : 0,
        withMockup: projectsWithMockup,
        withFeedback: projects.filter(
          (p) => p.feedback && p.feedback.trim() !== ""
        ).length,
        totalPrimaryFiles,
        totalMockupFiles,
      },

      // Engagement Statistics
      engagement: {
        submissionRate:
          contestants.length > 0
            ? (
                (projects.filter((p) => p.status !== "draft").length /
                  contestants.length) *
                100
              ).toFixed(2)
            : "0.00",
        qualificationRate:
          contestants.length > 0
            ? (
                (contestants.filter((c) => c.isQualified === true).length /
                  contestants.length) *
                100
              ).toFixed(2)
            : "0.00",
        completionRate:
          projects.length > 0
            ? (
                (projects.filter(
                  (p) =>
                    p.status === "submitted" ||
                    p.status === "reviewed" ||
                    p.status === "selected"
                ).length /
                  projects.length) *
                100
              ).toFixed(2)
            : "0.00",
      },

      // Recent Activity (last 7 days)
      recentActivity: {
        newContestants: contestants.filter((c) => {
          if (!c.createdAt) return false;
          const createdDate = new Date(c.createdAt);
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return createdDate > sevenDaysAgo;
        }).length,
        newSubmissions: projects.filter((p) => {
          if (!p.submittedAt && !p.updatedAt) return false;
          const submissionDate = new Date(p.submittedAt || p.updatedAt);
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return submissionDate > sevenDaysAgo && p.status !== "draft";
        }).length,
      },

      // Summary for quick overview
      summary: {
        totalCandidates: contestants.length,
        totalSubmissions: projects.filter((p) => p.status !== "draft").length,
        totalVoted: projects.filter((p) => p.vote && p.vote > 0).length,
        qualified: contestants.filter((c) => c.isQualified === true).length,
        disqualified: contestants.filter((c) => c.isQualified === false).length,
      },
    };

    return NextResponse.json<ApiResponse>(
      {
        message: "Stats fetched successfully",
        data: stats,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json<ApiResponse>(
      {
        message: "An unexpected error occurred while fetching stats",
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}
