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
          (c) => c.contestPack?.sent === false
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
            ? projects.reduce((sum, p) => sum + (p.vote || 0), 0) /
              projects.length
            : 0,
        withMockup: projects.filter(
          (p) => p.mockupUrl && p.mockupUrl.trim() !== ""
        ).length,
        withFeedback: projects.filter(
          (p) => p.feedback && p.feedback.trim() !== ""
        ).length,
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
            : "0",
        qualificationRate:
          contestants.length > 0
            ? (
                (contestants.filter((c) => c.isQualified === true).length /
                  contestants.length) *
                100
              ).toFixed(2)
            : "0",
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
            : "0",
      },

      // Recent Activity (last 7 days)
      recentActivity: {
        newContestants: contestants.filter(
          (c) =>
            new Date(c.createdAt) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        newSubmissions: projects.filter(
          (p) =>
            p.submittedAt &&
            new Date(p.submittedAt) >
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
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
    console.log("Error fetching stats:", error);
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
