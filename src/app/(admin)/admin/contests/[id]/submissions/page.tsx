"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  HeartIcon,
  ChatBubbleLeftEllipsisIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CloudArrowDownIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import api from "@/lib/axiosInstance";
import toast, { Toaster } from "react-hot-toast";

interface ProjectSubmission {
  _id: string;
  projectTitle: string;
  designConcept: string;
  colorPalette: string;
  inspiration: string;
  primaryFileUrl: string;
  mockupUrl?: string;
  status: "draft" | "submitted" | "reviewed" | "selected" | "rejected";
  submittedAt: string;
  updatedAt?: string;
  vote?: number;
  feedback?: string;
  candidate: {
    _id: string;
    fullName: string;
    schoolName: string;
    department: string;
    email: string;
    avatar: string | null;
    isQualified: boolean;
    matricNumber: string;
    phone: string;
  };
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

export default function LogoContestSubmissions() {
  const [selectedSubmission, setSelectedSubmission] =
    useState<ProjectSubmission | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"votes" | "date" | "views">("votes");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "draft" | "submitted" | "reviewed" | "selected" | "rejected"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [votingStats, setVotingStats] = useState<VotingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingLoading, setVotingLoading] = useState<string | null>(null);

  // Fetch submissions from API
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await api.get("/projects");
        const data = response.data;

        if (data.success) {
          setSubmissions(data.projects || []);
          setVotingStats(data.votingStats);
        } else {
          throw new Error("Failed to fetch submissions");
        }
      } catch (err: any) {
        console.error("Error fetching submissions:", err);
        setError(err.response?.data?.error || "Failed to load submissions");
        toast.error("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const handleLike = (submissionId: string) => {
    setFavorites((prev) =>
      prev.includes(submissionId)
        ? prev.filter((id) => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  const handleVote = async (submissionId: string, voteType: "up" | "down") => {
    if (votingLoading) return;

    setVotingLoading(submissionId);
    try {
      const response = await api.post("/projects/vote", {
        projectId: submissionId,
        voteType: voteType,
      });

      if (response.data.success) {
        const newVotes = response.data.newVotes;

        // Update the submissions state
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub._id === submissionId ? { ...sub, vote: newVotes } : sub
          )
        );

        // Update selected submission if it's the same one
        if (selectedSubmission && selectedSubmission._id === submissionId) {
          setSelectedSubmission({ ...selectedSubmission, vote: newVotes });
        }

        // Refresh voting stats
        const statsResponse = await api.get("/projects");
        if (statsResponse.data.success && statsResponse.data.votingStats) {
          setVotingStats(statsResponse.data.votingStats);
        }

        toast.success(`Vote ${voteType === "up" ? "added" : "removed"}!`);
      }
    } catch (error: any) {
      console.error("Error voting:", error);
      toast.error(error.response?.data?.error || "Failed to vote");
    } finally {
      setVotingLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "selected":
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case "submitted":
      case "reviewed":
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
      case "draft":
        return <ExclamationTriangleIcon className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "selected":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "reviewed":
        return "bg-purple-100 text-purple-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDepartmentColor = (department: string) => {
    // Simple hash function to generate consistent colors based on department
    const hash = department.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    const colors = [
      "bg-purple-100 text-purple-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
    ];

    return colors[Math.abs(hash) % colors.length];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredSubmissions = submissions
    .filter((submission) => {
      if (filterStatus !== "all" && submission.status !== filterStatus)
        return false;
      if (
        searchTerm &&
        !submission.projectTitle
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) &&
        !submission.candidate.fullName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) &&
        !submission.candidate.schoolName
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "votes":
          return (b.vote || 0) - (a.vote || 0);
        case "date":
          return (
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
          );
        case "views":
          // Since we don't have views data, we'll sort by votes as fallback
          return (b.vote || 0) - (a.vote || 0);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link href="/contests" className="mr-4">
                <ArrowLeftIcon className="w-5 h-5 text-gray-600 hover:text-gray-900" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  CONCES Logo Design Contest
                </h1>
                <p className="text-sm text-gray-500">
                  Brand Identity Challenge 2024
                </p>
                {votingStats && (
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>Total Votes: {votingStats.totalVotes}</span>
                    <span>
                      Avg per Project: {votingStats.averageVotesPerProject}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {filteredSubmissions.length} submissions
              </span>
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 text-sm font-medium border ${
                    viewMode === "grid"
                      ? "bg-blue-100 text-blue-700 border-blue-300"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  } rounded-l-md`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 text-sm font-medium border-t border-b border-r ${
                    viewMode === "list"
                      ? "bg-blue-100 text-blue-700 border-blue-300"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  } rounded-r-md`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by project title, designer name, or school..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="reviewed">Reviewed</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "date" | "votes" | "views")
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="votes">Sort by Votes</option>
                <option value="date">Sort by Date</option>
              </select>

              <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <FunnelIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No submissions found
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No projects have been submitted yet."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => setSelectedSubmission(submission)}
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={submission.primaryFileUrl}
                    alt={submission.projectTitle}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {getStatusIcon(submission.status)}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(submission._id);
                      }}
                      className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
                    >
                      {favorites.includes(submission._id) ? (
                        <HeartIconSolid className="w-4 h-4 text-red-500" />
                      ) : (
                        <HeartIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        submission.status
                      )}`}
                    >
                      {submission.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {submission.projectTitle}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {submission.designConcept}
                  </p>

                  {/* Designer Info */}
                  <div className="flex items-center mb-3">
                    {submission.candidate.avatar ? (
                      <Image
                        src={submission.candidate.avatar}
                        alt={submission.candidate.fullName}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs text-gray-600">
                          {submission.candidate.fullName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="ml-2 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {submission.candidate.fullName}
                      </p>
                      <div className="flex items-center">
                        <span
                          className={`text-xs px-1 py-0.5 rounded ${getDepartmentColor(
                            submission.candidate.department
                          )}`}
                        >
                          {submission.candidate.department}
                        </span>
                        {submission.candidate.isQualified && (
                          <CheckCircleIcon className="w-3 h-3 text-green-500 ml-1" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(submission._id, "up");
                          }}
                          disabled={votingLoading === submission._id}
                          className="p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50 group"
                          title="Vote for this design"
                        >
                          {votingLoading === submission._id ? (
                            <ArrowPathIcon className="w-4 h-4 text-gray-400 animate-spin" />
                          ) : (
                            <HeartIcon className="w-4 h-4 text-red-500 group-hover:fill-red-500 transition-all" />
                          )}
                        </button>
                        <span
                          className={`font-medium ${
                            votingLoading === submission._id
                              ? "opacity-50"
                              : "text-gray-900"
                          }`}
                        >
                          {submission.vote || 0}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs">
                          {formatDate(submission.submittedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* School */}
                  <div className="mt-3">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {submission.candidate.schoolName}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission._id}
                  className="p-6 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Image */}
                    <div className="relative w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={submission.primaryFileUrl}
                        alt={submission.projectTitle}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {submission.projectTitle}
                            </h3>
                            {getStatusIcon(submission.status)}
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                submission.status
                              )}`}
                            >
                              {submission.status}
                            </span>
                          </div>

                          <p className="text-gray-600 mb-2">
                            {submission.designConcept}
                          </p>

                          {/* Designer Info */}
                          <div className="flex items-center mb-2">
                            {submission.candidate.avatar ? (
                              <Image
                                src={submission.candidate.avatar}
                                alt={submission.candidate.fullName}
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-xs text-gray-600">
                                  {submission.candidate.fullName.charAt(0)}
                                </span>
                              </div>
                            )}
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {submission.candidate.fullName}
                            </span>
                            <span
                              className={`ml-2 text-xs px-2 py-1 rounded ${getDepartmentColor(
                                submission.candidate.department
                              )}`}
                            >
                              {submission.candidate.department}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                              {submission.candidate.schoolName}
                            </span>
                            {submission.candidate.isQualified && (
                              <CheckCircleIcon className="w-4 h-4 text-green-500 ml-2" />
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(submission._id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500"
                          >
                            {favorites.includes(submission._id) ? (
                              <HeartIconSolid className="w-5 h-5 text-red-500" />
                            ) : (
                              <HeartIcon className="w-5 h-5" />
                            )}
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600">
                            <CloudArrowDownIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVote(submission._id, "up");
                              }}
                              disabled={votingLoading === submission._id}
                              className="p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50 group"
                              title="Vote for this design"
                            >
                              {votingLoading === submission._id ? (
                                <ArrowPathIcon className="w-4 h-4 text-gray-400 animate-spin" />
                              ) : (
                                <HeartIcon className="w-4 h-4 text-red-500 group-hover:fill-red-500 transition-all" />
                              )}
                            </button>
                            <span
                              className={`font-medium ${
                                votingLoading === submission._id
                                  ? "opacity-50"
                                  : "text-gray-900"
                              }`}
                            >
                              {submission.vote || 0} votes
                            </span>
                          </div>
                          <div>
                            Submitted: {formatDate(submission.submittedAt)}
                          </div>
                          {submission.feedback && (
                            <div className="flex items-center">
                              <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mr-1" />
                              Has feedback
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedSubmission.projectTitle}
                  </h2>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedSubmission.status)}
                    <span
                      className={`px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                        selectedSubmission.status
                      )}`}
                    >
                      {selectedSubmission.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Images */}
                <div>
                  <div className="relative h-80 bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <Image
                      src={selectedSubmission.primaryFileUrl}
                      alt={selectedSubmission.projectTitle}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Mockup */}
                  {selectedSubmission.mockupUrl && (
                    <div className="relative h-40 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={selectedSubmission.mockupUrl}
                        alt="Mockup"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div>
                  {/* Designer Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-2">
                      {selectedSubmission.candidate.avatar ? (
                        <Image
                          src={selectedSubmission.candidate.avatar}
                          alt={selectedSubmission.candidate.fullName}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm text-gray-600">
                            {selectedSubmission.candidate.fullName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="font-semibold text-gray-900">
                          {selectedSubmission.candidate.fullName}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${getDepartmentColor(
                              selectedSubmission.candidate.department
                            )}`}
                          >
                            {selectedSubmission.candidate.department}
                          </span>
                          <span className="text-xs text-gray-500">
                            {selectedSubmission.candidate.schoolName}
                          </span>
                          {selectedSubmission.candidate.isQualified && (
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Design Concept
                      </h3>
                      <p className="text-gray-600">
                        {selectedSubmission.designConcept}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Color Palette
                      </h3>
                      <p className="text-gray-600">
                        {selectedSubmission.colorPalette}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Inspiration
                      </h3>
                      <p className="text-gray-600">
                        {selectedSubmission.inspiration}
                      </p>
                    </div>
                  </div>

                  {/* Feedback */}
                  {selectedSubmission.feedback && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Feedback
                      </h3>
                      <p className="text-gray-700">
                        {selectedSubmission.feedback}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <button
                          onClick={() =>
                            handleVote(selectedSubmission._id, "up")
                          }
                          disabled={votingLoading === selectedSubmission._id}
                          className="p-3 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50 group"
                          title="Vote up"
                        >
                          {votingLoading === selectedSubmission._id ? (
                            <ArrowPathIcon className="w-6 h-6 animate-spin" />
                          ) : (
                            <HeartIcon className="w-6 h-6 group-hover:fill-red-600 transition-all" />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            handleVote(selectedSubmission._id, "down")
                          }
                          disabled={
                            votingLoading === selectedSubmission._id ||
                            (selectedSubmission.vote || 0) === 0
                          }
                          className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 group"
                          title="Remove vote"
                        >
                          {votingLoading === selectedSubmission._id ? (
                            <ArrowPathIcon className="w-6 h-6 animate-spin" />
                          ) : (
                            <HeartIcon className="w-6 h-6 rotate-180 group-hover:fill-gray-600 transition-all" />
                          )}
                        </button>
                      </div>
                      <div
                        className={`text-3xl font-bold text-gray-900 ${
                          votingLoading === selectedSubmission._id
                            ? "opacity-50"
                            : ""
                        }`}
                      >
                        {selectedSubmission.vote || 0}
                      </div>
                      <div className="text-sm text-gray-500">Votes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mt-8">
                        {formatDate(selectedSubmission.submittedAt)}
                      </div>
                      <div className="text-sm text-gray-500">Submitted</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleLike(selectedSubmission._id)}
                      className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                        favorites.includes(selectedSubmission._id)
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {favorites.includes(selectedSubmission._id) ? (
                        <HeartIconSolid className="w-4 h-4 mr-2" />
                      ) : (
                        <HeartIcon className="w-4 h-4 mr-2" />
                      )}
                      {favorites.includes(selectedSubmission._id)
                        ? "Liked"
                        : "Like"}
                    </button>
                    <button
                      onClick={() =>
                        window.open(selectedSubmission.primaryFileUrl, "_blank")
                      }
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <CloudArrowDownIcon className="w-4 h-4 mr-2" />
                      View File
                    </button>
                  </div>

                  {/* Admin Actions (if admin) */}
                  {selectedSubmission.status === "submitted" && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Admin Actions
                      </h3>
                      <div className="flex space-x-3">
                        <button
                          onClick={async () => {
                            try {
                              await api.patch("/projects", {
                                projectId: selectedSubmission._id,
                                status: "selected",
                              });
                              toast.success("Project approved!");
                              setSelectedSubmission(null);
                              // Refresh the submissions
                              window.location.reload();
                            } catch (error) {
                              toast.error("Failed to approve project");
                            }
                          }}
                          className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await api.patch("/projects", {
                                projectId: selectedSubmission._id,
                                status: "rejected",
                              });
                              toast.success("Project rejected");
                              setSelectedSubmission(null);
                              // Refresh the submissions
                              window.location.reload();
                            } catch (error) {
                              toast.error("Failed to reject project");
                            }
                          }}
                          className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          <XCircleIcon className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                      </div>

                      {/* Feedback Section */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Add Feedback (Optional)
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                          placeholder="Provide feedback for the designer..."
                          defaultValue={selectedSubmission.feedback || ""}
                          onBlur={async (e) => {
                            const feedback = e.target.value;
                            if (feedback !== selectedSubmission.feedback) {
                              try {
                                await api.patch("/projects", {
                                  projectId: selectedSubmission._id,
                                  feedback: feedback,
                                });
                                toast.success("Feedback updated");
                              } catch (error) {
                                toast.error("Failed to update feedback");
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Voted Section */}
      {votingStats && votingStats.topVoted.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Top Voted Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {votingStats.topVoted.slice(0, 6).map((project, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-800"
                          : index === 1
                          ? "bg-gray-100 text-gray-800"
                          : index === 2
                          ? "bg-orange-100 text-orange-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {project.projectTitle}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      by {project.candidate}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <HeartIcon className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {project.votes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
