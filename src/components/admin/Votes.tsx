"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  CheckBadgeIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";

// Dynamically import Highcharts to avoid SSR issues
const HighchartsReact = dynamic(() => import("highcharts-react-official"), {
  ssr: false,
});

interface ProjectVoteData {
  _id: string;
  projectTitle: string;
  vote: number;
  lastVoteAt?: string;
  candidate: {
    fullName: string;
    schoolName: string;
    department: string;
    email: string;
    avatar: string;
    isQualified: boolean;
  };
  status: string;
}

interface VotingStats {
  totalVotes: number;
  totalProjects: number;
  totalQualifiedCandidates: number;
  averageVotesPerProject: number;
  topVoted: Array<{
    projectTitle: string;
    candidate: string;
    votes: number;
  }>;
}

export default function VoteManagement() {
  const [projects, setProjects] = useState<ProjectVoteData[]>([]);
  const [votingStats, setVotingStats] = useState<VotingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("approved");
  const [chartOptions, setChartOptions] = useState<any>(null);
  const [adjustingVotes, setAdjustingVotes] = useState<string | null>(null);

  // Fetch projects data
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/projects?status=${selectedStatus}&onlyQualified=true`
      );
      const data = await response.json();


      if (data.success) {
        setProjects(data.projects);
        setVotingStats(data.votingStats);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize chart options
  useEffect(() => {
    if (votingStats && typeof window !== "undefined") {
      const topProjects = votingStats.topVoted.slice(0, 4);
      const othersVotes =
        votingStats.totalVotes -
        topProjects.reduce((sum, p) => sum + p.votes, 0);

      const chartData = [
        ...topProjects.map((project, index) => ({
          name: project.candidate,
          y: project.votes,
          color:
            ["#0ea5e9", "#3b82f6", "#8b5cf6", "#10b981"][index] || "#6b7280",
        })),
      ];

      if (othersVotes > 0) {
        chartData.push({
          name: "Others",
          y: othersVotes,
          color: "#e5e7eb",
        });
      }

      const options = {
        chart: {
          type: "pie",
          height: 250,
        },
        title: { text: "" },
        plotOptions: {
          pie: {
            innerSize: "50%",
            dataLabels: { enabled: false },
          },
        },
        series: [
          {
            name: "Votes",
            data: chartData,
          },
        ],
      };
      setChartOptions(options);
    }
  }, [votingStats]);

  // Load data on component mount
  useEffect(() => {
    fetchProjects();
  }, [selectedStatus]);


  console.log(votingStats, "vote stats")
  console.log(projects, "All project");

  // Filter projects based on search
  const filteredProjects = projects.filter(
    (project) =>
      project.candidate.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      project.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.candidate.schoolName
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Handle vote adjustment
  const handleVoteAdjustment = async (
    projectId: string,
    newVoteCount: number
  ) => {
    try {
      setAdjustingVotes(projectId);

      const response = await fetch(`/api/projects/${projectId}/vote`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newVoteCount,
          adminId: "current-admin-id", // Replace with actual admin ID
          reason: "Manual adjustment from vote management panel",
        }),
      });

      if (response.ok) {
        // Refresh the data
        await fetchProjects();
      } else {
        console.error("Failed to adjust votes");
      }
    } catch (error) {
      console.error("Error adjusting votes:", error);
    } finally {
      setAdjustingVotes(null);
    }
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours ago`;
    return `${Math.floor(minutes / 1440)} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading vote data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vote Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor and manage voting activity across all qualified contestants
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Vote Summary Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Vote Summary
          </h3>
          <div className="h-64">
            {chartOptions && (
              <HighchartsReact
                highcharts={require("highcharts")}
                options={chartOptions}
              />
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500">Total Votes</p>
              <p className="text-xl font-semibold text-gray-900">
                {votingStats?.totalVotes || "0"}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500">Active Projects</p>
              <p className="text-xl font-semibold text-gray-900">
                {votingStats?.totalProjects || "0"}
              </p>
            </div>
          </div>
        </div>

        {/* Top Contestants Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Top Contestants
            </h3>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-sm border-gray-300 rounded-md"
            >
              <option value="approved">Approved Projects</option>
              <option value="submitted">All Submissions</option>
            </select>
          </div>
          <div className="space-y-4">
            {projects.slice(0, 5).map((project, index) => {
              const maxVotes = Math.max(...projects.map((p) => p.vote));
              const percentage =
                maxVotes > 0 ? (project.vote / maxVotes) * 100 : 0;

              return (
                <div key={project._id} className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    <span className="text-sm font-bold text-gray-500 w-6 text-center inline-block">
                      #{index + 1}
                    </span>
                  </div>
                  <Image
                    src={project.candidate.avatar || "/default-avatar.png"}
                    alt={project.candidate.fullName}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {project.candidate.fullName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {project.projectTitle}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900 ml-2">
                        {project.vote.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

       
      </div>

      {/* Vote Management Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search contestants or projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="approved">Approved Projects</option>
                <option value="submitted">All Submissions</option>
                <option value="under_review">Under Review</option>
              </select>
              <button
                onClick={() => fetchProjects()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer">
                    <span>Contestant</span>
                    <ChevronUpDownIcon className="w-4 h-4 ml-1" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer">
                    <span>Project</span>
                    <ChevronUpDownIcon className="w-4 h-4 ml-1" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer">
                    <span>Total Votes</span>
                    <ChevronUpDownIcon className="w-4 h-4 ml-1" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer">
                    <span>Last Vote</span>
                    <ChevronUpDownIcon className="w-4 h-4 ml-1" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr key={project._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Image
                          className="h-10 w-10 rounded-full object-cover"
                          src={
                            project.candidate.avatar || "/default-avatar.png"
                          }
                          alt={project.candidate.fullName}
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {project.candidate.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {project.candidate.schoolName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {project.projectTitle}
                    </div>
                    <div className="text-sm text-gray-500">
                      {project.candidate.department}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {project.vote.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTimeAgo(project.lastVoteAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.candidate.isQualified
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {project.candidate.isQualified
                        ? "Qualified"
                        : "Disqualified"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        const newCount = prompt(
                          `Current votes: ${project.vote}\nEnter new vote count:`,
                          project.vote.toString()
                        );
                        if (newCount && !isNaN(parseInt(newCount))) {
                          handleVoteAdjustment(project._id, parseInt(newCount));
                        }
                      }}
                      disabled={adjustingVotes === project._id}
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {adjustingVotes === project._id ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                          Adjusting...
                        </div>
                      ) : (
                        "Adjust Votes"
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <CheckBadgeIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            </div>
            <p className="text-gray-500 text-lg">No projects found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your search criteria or status filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
