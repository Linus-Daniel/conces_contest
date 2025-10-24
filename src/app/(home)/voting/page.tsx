// Enhanced VotingPage with ISR optimization for App Router
import React from "react";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import Enroll, { IEnroll } from "@/models/Enroll";
import VotingClientComponent from "@/components/VotingClientComponent";

interface ProjectData {
  _id: string;
  candidate: {
    _id: string;
    fullName: string;
    schoolName: string;
    department: string;
    avatar: string;
  };
  projectTitle: string;
  designConcept: string;
  colorPalette: string;
  inspiration: string;
  primaryFileUrls: string[];
  mockupUrls?: string[];
  vote: number;
  status: string;
  submittedAt: string;
}


// Server component that fetches data at build time
async function getProjectsData(): Promise<{
  projects: ProjectData[];
  votingStats: any;
}> {
  try {
    await connectDB();
    
    // Get all projects
    const enroll =  await Enroll.find();
    const allProjects = await Project.find({})
      .populate<{ candidate: IEnroll }>(
        "candidate",
        "_id fullName institution isQualified department email avatar matricNumber phone"
      )
      .sort({ totalVotes: -1, submittedAt: -1 })
      .lean();

    const filteredProjects = allProjects.filter(
      (project) => project.candidate?.isQualified === true
    );

    const transformedProjects = filteredProjects.map((project) => ({
      _id: project._id.toString(),
      candidate: {
        _id: project.candidate._id?.toString() || "",
        fullName: project.candidate.fullName || "Unknown",
        schoolName: project.candidate.institution || "Unknown School",
        department: project.candidate.department || "Unknown Department", 
        avatar: project.candidate.avatar || "",
      },
      projectTitle: project.projectTitle,
      designConcept: project.designConcept,
      colorPalette: project.colorPalette,
      inspiration: project.inspiration,
      primaryFileUrls: project.primaryFileUrls || [],
      mockupUrls: project.mockupUrls || [],
      vote: project.vote || 0,
      status: project.status,
      submittedAt: project.submittedAt.toISOString(),
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

    return {
      projects: transformedProjects,
      votingStats,
    };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return {
      projects: [],
      votingStats: {
        totalVotes: 0,
        totalProjects: 0,
        totalQualifiedCandidates: 0,
        averageVotesPerProject: 0,
        topVoted: [],
      },
    };
  }
}

// Main page component (Server Component)
export default async function VotingPage() {
  const { projects, votingStats } = await getProjectsData();

  return (
    <VotingClientComponent 
      initialProjects={projects} 
      initialVotingStats={votingStats} 
    />
  );
}

// Enable ISR with 60 second revalidation
export const revalidate = 60;

// Generate metadata for SEO
export async function generateMetadata() {
  const { projects, votingStats } = await getProjectsData();
  
  return {
    title: `Design Showcase - ${projects.length} Designs, ${votingStats.totalVotes} Votes`,
    description: `Vote for innovative designs from ${votingStats.totalProjects} talented designers across multiple schools.`,
    openGraph: {
      title: `Design Showcase - ${projects.length} Designs`,
      description: `${votingStats.totalVotes} votes cast on ${projects.length} amazing designs`,
    },
  };
}