"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  HeartIcon,
  Search,
  ArrowUpIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MessageCircle,
  X,
  Share2,
  Wifi,
  WifiOff,
  TrendingUp,
  FileText,
  Download,
  ExternalLink,
  Filter,
  SortAsc,
  School,
} from "lucide-react";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import EmailOTPVotingModal from "@/components/EmailOtpVotingModal";
import api from "@/lib/axiosInstance";
import { useAdminAuth } from "@/context/AdminAuth";
import { useMaintenance, MaintenancePage } from "@/context/MaintenanceContext";
import { useTimer } from "@/context/CountdownContext";

interface Project {
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

interface SSEVoteUpdate {
  type: "connected" | "update" | "error";
  votes?: {
    id: string;
    votes: number;
  }[];
  totalVotes?: number;
  timestamp?: string;
  message?: string;
}

interface VotingClientComponentProps {
  initialProjects: Project[];
  initialVotingStats: any;
}

// PDF Viewer Component
function PDFViewer({ url, title }: { url: string; title: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      <div className="flex items-center justify-between p-4 bg-gray-100 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-red-500" />
          <span className="text-sm font-semibold text-gray-800 truncate">
            {title}
          </span>
        </div>
        <div className="flex gap-2">
          <a
            href={url}
            download
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            title="Download PDF"
          >
            <Download className="w-4 h-4 text-gray-600" />
          </a>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4 text-gray-600" />
          </a>
        </div>
      </div>
      <div className="flex-1 relative bg-white">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-conces-green"></div>
              <p className="text-sm text-gray-500">Loading PDF...</p>
            </div>
          </div>
        )}
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 p-6">
            <FileText className="w-16 h-16 text-gray-400" />
            <p className="text-gray-500 text-center text-sm">{error}</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-conces-blue hover:underline text-sm font-medium"
            >
              Open PDF directly
            </a>
          </div>
        ) : (
          <iframe
            src={url}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setError("Failed to load PDF preview");
              setIsLoading(false);
            }}
            title={title}
          />
        )}
      </div>
    </div>
  );
}

// Enhanced Image/PDF Renderer
function MediaRenderer({
  url,
  alt,
  className = "",
  onLoad,
}: {
  url: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPDF, setIsPDF] = useState(false);

  useEffect(() => {
    setIsPDF(
      url?.toLowerCase().endsWith(".pdf") || url?.includes("/pdf/") || false
    );
  }, [url]);

  if (isPDF) {
    return (
      <div className={`${className} relative`}>
        <PDFViewer url={url} title={alt} />
      </div>
    );
  }

  return (
    <div
      className={`${className} relative bg-gray-100 rounded-lg overflow-hidden`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conces-green"></div>
            <p className="text-xs text-gray-500">Loading image...</p>
          </div>
        </div>
      )}
      <img
        src={url}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-300"
        style={{ opacity: isLoading ? 0 : 1 }}
        onLoad={() => {
          setIsLoading(false);
          onLoad?.();
        }}
        onError={() => {
          setIsLoading(false);
        }}
      />
    </div>
  );
}

function useRealTimeVotes() {
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [totalVotes, setTotalVotes] = useState(0);

  const updateProjectVotes = (projects: Project[], voteUpdates: any[]) => {
    return projects.map((project) => {
      const update = voteUpdates.find((u) => u.id === project._id);
      return update ? { ...project, vote: update.votes } : project;
    });
  };

  const connectToSSE = (onVoteUpdate: (updates: any[]) => void) => {
    const eventSource = new EventSource("/api/vote/stream");

    eventSource.onopen = () => {
      setConnectionStatus("connected");
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SSEVoteUpdate = JSON.parse(event.data);

        switch (data.type) {
          case "connected":
            setConnectionStatus("connected");
            break;

          case "update":
            if (data.votes) {
              onVoteUpdate(data.votes);
              setTotalVotes(data.totalVotes || 0);
              setLastUpdate(new Date().toISOString());
            }
            break;

          case "error":
            console.error("SSE Error:", data.message);
            break;
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = () => {
      setConnectionStatus("disconnected");
      console.log("❌ Live vote tracking disconnected");
    };

    return eventSource;
  };

  return {
    connectionStatus,
    lastUpdate,
    totalVotes,
    updateProjectVotes,
    connectToSSE,
  };
}

export default function VotingClientComponent({
  initialProjects,
  initialVotingStats,
}: VotingClientComponentProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [filteredProjects, setFilteredProjects] =
    useState<Project[]>(initialProjects);
  const [votingStats, setVotingStats] = useState(initialVotingStats);
  const [votedProjects, setVotedProjects] = useState<Set<string>>(new Set());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"votes" | "newest" | "title">("votes");
  const [filterSchool, setFilterSchool] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const { user } = useAdminAuth();
  const { isMaintenanceMode } = useMaintenance();

  const [selectedProjectToVote, setSelectedProjectToVote] =
    useState<Project | null>(null);
  const { isVotingOpen } = useTimer();
  const {
    connectionStatus,
    lastUpdate,
    totalVotes,
    updateProjectVotes,
    connectToSSE,
  } = useRealTimeVotes();

  const handleVoteClick = (project: Project) => {
    if (!isVotingOpen) {
      toast.error("Voting is currently closed");
      return;
    }
    setSelectedProjectToVote(project);
    setShowOTPModal(true);
  };

  const handleVoteSuccess = (newVoteCount: number) => {
    if (!selectedProjectToVote) return;
    const newVoted = new Set(votedProjects);
    newVoted.add(selectedProjectToVote._id);
    setVotedProjects(newVoted);
    setProjects((prev) =>
      prev.map((p) =>
        p._id === selectedProjectToVote._id ? { ...p, vote: newVoteCount } : p
      )
    );
    setShowOTPModal(false);
    setSelectedProjectToVote(null);
    toast.success("Vote confirmed successfully! 🎉");
  };

  useEffect(() => {
    const stored = localStorage.getItem("votedProjects");
    if (stored) {
      setVotedProjects(new Set(JSON.parse(stored)));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("votedProjects", JSON.stringify([...votedProjects]));
  }, [votedProjects]);

  useEffect(() => {
    if (projects.length === 0) return;
    const eventSource = connectToSSE((voteUpdates) => {
      setProjects((prev) => updateProjectVotes(prev, voteUpdates));
    });
    return () => {
      eventSource.close();
    };
  }, [projects.length]);

  useEffect(() => {
    let filtered = [...projects];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.candidate.fullName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          p.candidate.schoolName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          p.designConcept.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // School filter
    if (filterSchool !== "all") {
      filtered = filtered.filter(
        (p) => p.candidate.schoolName === filterSchool
      );
    }

    // Sort
    switch (sortBy) {
      case "votes":
        filtered.sort((a, b) => (b.vote || 0) - (a.vote || 0));
        break;
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
        );
        break;
      case "title":
        filtered.sort((a, b) => a.projectTitle.localeCompare(b.projectTitle));
        break;
    }

    setFilteredProjects(filtered);
  }, [searchTerm, sortBy, filterSchool, projects]);

  const schools = Array.from(
    new Set(projects.map((p) => p.candidate.schoolName))
  ).sort();

  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <header className="relative bg-gradient-to-br from-conces-blue via-blue-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-6xl mx-auto"
          >
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Design Showcase
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl lg:text-2xl text-blue-100 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Vote for the most innovative designs and help shape the future
            </motion.p>

            {/* Stats Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 max-w-4xl mx-auto px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20 shadow-lg">
                <div className="text-2xl sm:text-3xl font-bold text-conces-gold mb-2">
                  {projects.length}
                </div>
                <div className="text-blue-100 font-medium text-sm sm:text-base">
                  Total Designs
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20 shadow-lg relative">
                <div className="text-2xl sm:text-3xl font-bold text-conces-gold mb-2 flex items-center justify-center gap-2">
                  {totalVotes ||
                    projects.reduce((sum, p) => sum + (p.vote || 0), 0)}
                  {connectionStatus === "connected" && (
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-300 animate-pulse" />
                  )}
                </div>
                <div className="text-blue-100 font-medium text-sm sm:text-base">
                  Total Votes
                </div>
                {lastUpdate && connectionStatus === "connected" && (
                  <div className="text-xs text-green-300 mt-2 font-medium">
                    Live • Updated {new Date(lastUpdate).toLocaleTimeString()}
                  </div>
                )}
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20 shadow-lg">
                <div className="text-2xl sm:text-3xl font-bold text-conces-gold mb-2">
                  {schools.length}
                </div>
                <div className="text-blue-100 font-medium text-sm sm:text-base">
                  Schools
                </div>
              </div>
            </motion.div>

            {/* Voting Status */}
            {!isVotingOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-4 border border-white/20 shadow-lg mb-6"
              >
                <WifiOff className="w-6 h-6 text-yellow-300" />
                <div className="text-left">
                  <div className="font-bold text-white text-lg">
                    Voting Closed
                  </div>
                  <div className="text-blue-100 text-sm">
                    The voting period has ended, stay tuned for the next phase of the Contest. Good Luck!
                  </div>
                </div>
              </motion.div>
            )}

            {/* Connection Status */}
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div
                className={`inline-flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold backdrop-blur-lg border ${
                  connectionStatus === "connected"
                    ? "bg-green-500/20 text-green-100 border-green-400/30"
                    : connectionStatus === "connecting"
                    ? "bg-yellow-500/20 text-yellow-100 border-yellow-400/30"
                    : "bg-red-500/20 text-red-100 border-red-400/30"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full animate-pulse ${
                    connectionStatus === "connected"
                      ? "bg-green-400"
                      : connectionStatus === "connecting"
                      ? "bg-yellow-400"
                      : "bg-red-400"
                  }`}
                />
                <span>
                  {connectionStatus === "connected"
                    ? "Live Updates Active"
                    : connectionStatus === "connecting"
                    ? "Connecting..."
                    : "Reconnecting..."}
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Fraud Cleanup Notice */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-b border-amber-200 shadow-sm"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start gap-4 max-w-6xl mx-auto">
            <div className="flex-shrink-0 bg-amber-100 rounded-full p-2 mt-0.5">
              <svg
                className="w-5 h-5 text-amber-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-amber-800 mb-1 text-sm sm:text-base">
                Notice: Vote Count Adjustments
              </h4>
              <p className="text-xs sm:text-sm text-amber-700 leading-relaxed">
                If you notice a reduction in vote counts for any candidate, this
                is due to our recent cleanup of{" "}
                <strong className="font-medium">
                  fraudulent voting activities
                </strong>{" "}
                including the removal of votes from disposable email addresses
                and attempts to bypass the one-vote-per-person system. This
                ensures fair competition and maintains the integrity of the
                voting process.
              </p>
            </div>
            <button
              onClick={() => {
                const notice = document.querySelector(
                  '[data-notice="fraud-cleanup"]'
                );
                if (notice) notice.remove();
              }}
              className="flex-shrink-0 text-amber-600 hover:text-amber-800 p-1 rounded-full hover:bg-amber-100 transition-colors duration-200"
              data-notice="fraud-cleanup"
              aria-label="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Filters Section */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search designs, designers, or schools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-conces-blue/20 focus:border-conces-blue transition-all duration-200 shadow-sm text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Filters Toggle for Mobile */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
              >
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium">Filters</span>
              </button>
            </div>

            {/* Filters - Desktop */}
            <div className="hidden lg:flex gap-3">
              <div className="relative">
                <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="pl-10 pr-8 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-conces-blue/20 focus:border-conces-blue transition-all duration-200 shadow-sm min-w-[160px] text-sm"
                >
                  <option value="votes">Most Votes</option>
                  <option value="newest">Newest First</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
              <div className="relative">
                <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterSchool}
                  onChange={(e) => setFilterSchool(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-conces-blue/20 focus:border-conces-blue transition-all duration-200 shadow-sm min-w-[180px] text-sm"
                >
                  <option value="all">All Schools</option>
                  {schools.map((school) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile Filters Dropdown */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden col-span-2 bg-white border border-gray-200 rounded-xl p-4 shadow-lg"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-conces-blue/20 focus:border-conces-blue text-sm"
                      >
                        <option value="votes">Most Votes</option>
                        <option value="newest">Newest First</option>
                        <option value="title">Title A-Z</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by School
                      </label>
                      <select
                        value={filterSchool}
                        onChange={(e) => setFilterSchool(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-conces-blue/20 focus:border-conces-blue text-sm"
                      >
                        <option value="all">All Schools</option>
                        {schools.map((school) => (
                          <option key={school} value={school}>
                            {school}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 sm:py-20"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-600 mb-3">
              No designs found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto text-sm sm:text-base">
              Try adjusting your search criteria or filters to see more results.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project._id}
                project={project}
                index={index}
                onVote={() => handleVoteClick(project)}
                onView={() => setSelectedProject(project)}
                isLiveConnected={connectionStatus === "connected"}
                isVoted={votedProjects.has(project._id)}
                isVotingOpen={isVotingOpen}
              />
            ))}
          </motion.div>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showOTPModal && selectedProjectToVote && (
          <EmailOTPVotingModal
            projectId={selectedProjectToVote._id}
            projectTitle={selectedProjectToVote.projectTitle}
            candidateName={selectedProjectToVote.candidate.fullName}
            onClose={() => {
              setShowOTPModal(false);
              setSelectedProjectToVote(null);
            }}
            onSuccess={handleVoteSuccess}
          />
        )}

        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            isVoted={votedProjects.has(selectedProject._id)}
            onClose={() => setSelectedProject(null)}
            onVote={() => {
              handleVoteClick(selectedProject);
              setSelectedProject(null);
            }}
            isVotingOpen={isVotingOpen}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectCard({
  project,
  index,
  onVote,
  onView,
  isLiveConnected,
  isVoted,
  isVotingOpen,
}: {
  project: Project;
  index: number;
  onVote: () => void;
  onView: () => void;
  isLiveConnected: boolean;
  isVoted: boolean;
  isVotingOpen: boolean;
}) {
  const [previousVotes, setPreviousVotes] = useState(project.vote || 0);
  const [showVoteAnimation, setShowVoteAnimation] = useState(false);

  useEffect(() => {
    const currentVotes = project.vote || 0;
    if (currentVotes > previousVotes && isLiveConnected) {
      setShowVoteAnimation(true);
      setTimeout(() => setShowVoteAnimation(false), 2000);
    }
    setPreviousVotes(currentVotes);
  }, [project.vote, previousVotes, isLiveConnected]);

  const isPDF = project.primaryFileUrls?.[0]?.toLowerCase().endsWith(".pdf");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 300,
        damping: 24,
      }}
      whileHover={{
        y: -4,
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl overflow-hidden group relative border border-gray-200/60 transition-all duration-300"
    >
      <AnimatePresence>
        {showVoteAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-green-500/20 backdrop-blur-sm rounded-2xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="font-bold text-xs">New Vote!</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Container */}
      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {isPDF && (
          <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-lg">
            <FileText className="w-3 h-3" />
            PDF
          </div>
        )}

        <MediaRenderer
          url={project.primaryFileUrls?.[0] || "/placeholder-image.jpg"}
          alt={project.projectTitle}
          className="w-full h-full"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="absolute bottom-4 left-4 right-4">
            <motion.button
              onClick={onView}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-white text-conces-blue py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg border border-white/20 backdrop-blur-sm text-sm"
            >
              View Details
            </motion.button>
          </div>
        </div>

        {/* Vote Count */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg border border-white/20">
          <ArrowUpIcon
            className={`w-3 h-3 text-conces-green ${
              showVoteAnimation ? "animate-bounce" : ""
            }`}
          />
          <motion.span
            key={project.vote}
            initial={{ scale: showVoteAnimation ? 1.5 : 1 }}
            animate={{ scale: 1 }}
            className="font-bold text-gray-800 text-xs"
          >
            {project.vote || 0}
          </motion.span>
          {isLiveConnected && (
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-conces-blue transition-colors text-sm sm:text-base min-h-[2.5rem]">
          {project.projectTitle}
        </h3>

        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-conces-green font-semibold text-xs sm:text-sm mb-1 truncate">
              by {project.candidate.fullName}
            </p>
            <p className="text-xs text-gray-500 line-clamp-1">
              {project.candidate.schoolName}
            </p>
          </div>
          <div className="flex-shrink-0 ml-3">
            <Image
              src={project.candidate?.avatar || "/placeholder-avatar.jpg"}
              width={40}
              height={40}
              className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm"
              alt={project.candidate.fullName}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <motion.button
            onClick={onVote}
            disabled={isVoted || !isVotingOpen}
            whileHover={!isVoted && isVotingOpen ? { scale: 1.02 } : {}}
            whileTap={!isVoted && isVotingOpen ? { scale: 0.98 } : {}}
            className={`flex-1 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
              isVoted
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : !isVotingOpen
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-conces-green to-emerald-600 text-white hover:shadow-lg shadow-md"
            }`}
          >
            {isVoted ? (
              <>
                <HeartSolidIcon className="w-4 h-4" />
                Voted
              </>
            ) : !isVotingOpen ? (
              <>
                <WifiOff className="w-4 h-4" />
                Closed
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                Vote Now
              </>
            )}
          </motion.button>
          <motion.button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: project.projectTitle,
                  text: `Check out "${project.projectTitle}" by ${project.candidate.fullName}`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(
                  `${window.location.href}/candidate/${project._id}`
                );
                toast.success("Link copied to clipboard!");
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isVotingOpen}
          >
            <Share2 className="w-4 h-4 text-gray-600" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function ProjectDetailModal({
  project,
  isVoted,
  onClose,
  onVote,
  isVotingOpen,
}: {
  project: Project;
  isVoted: boolean;
  onClose: () => void;
  onVote: () => void;
  isVotingOpen: boolean;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const allMedia = [
    ...(project.primaryFileUrls || []),
    ...(project.mockupUrls || []),
  ].filter(Boolean);

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % allMedia.length);
  const prevImage = () =>
    setCurrentImageIndex(
      (prev) => (prev - 1 + allMedia.length) % allMedia.length
    );

  const currentMedia = allMedia[currentImageIndex];
  const isPDF = currentMedia?.toLowerCase().endsWith(".pdf");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
          duration: 0.3,
        }}
        className="bg-white rounded-3xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col lg:flex-row h-full max-h-[95vh]">
          {/* Media Section */}
          <div className="lg:w-3/5 bg-gradient-to-br from-gray-50 to-gray-100 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-lg rounded-2xl p-2 hover:bg-white hover:scale-110 transition-all duration-200 shadow-xl border border-gray-200/60 group"
            >
              <X className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
            </button>

            <div className="relative h-80 sm:h-96 lg:h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <MediaRenderer
                    url={currentMedia}
                    alt={`${project.projectTitle} - Media ${
                      currentImageIndex + 1
                    }`}
                    className="w-full h-full"
                  />
                </motion.div>
              </AnimatePresence>

              {allMedia.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-lg rounded-2xl p-3 hover:bg-white hover:scale-110 transition-all duration-200 shadow-xl border border-gray-200/60 group"
                    aria-label="Previous media"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-lg rounded-2xl p-3 hover:bg-white hover:scale-110 transition-all duration-200 shadow-xl border border-gray-200/60 group"
                    aria-label="Next media"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-lg text-white px-4 py-2 rounded-2xl text-xs font-semibold border border-white/20">
                    {currentImageIndex + 1} / {allMedia.length}
                    {isPDF && <span className="ml-1 text-red-300">• PDF</span>}
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 py-2 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
                    {allMedia.map((media, idx) => {
                      const thumbIsPDF = media.toLowerCase().endsWith(".pdf");
                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden transition-all duration-200 border-2 ${
                            idx === currentImageIndex
                              ? "ring-2 ring-conces-green scale-105 border-transparent"
                              : "opacity-60 hover:opacity-100 hover:scale-105 border-gray-200"
                          }`}
                        >
                          {thumbIsPDF ? (
                            <div className="w-full h-full bg-red-50 flex items-center justify-center border">
                              <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-red-400" />
                            </div>
                          ) : (
                            <img
                              src={media}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:w-2/5 flex flex-col max-h-[60vh] lg:max-h-full">
            {/* Header */}
            <div className="bg-gradient-to-br from-conces-blue to-blue-600 text-white p-6">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">
                {project.projectTitle}
              </h2>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg text-white/95 mb-1">
                    {project.candidate.fullName}
                  </p>
                  <p className="text-white/80 text-sm mb-1">
                    {project.candidate.schoolName}
                  </p>
                  <p className="text-xs text-white/70">
                    {project.candidate.department}
                  </p>
                </div>
                <div className="flex flex-col items-center bg-white/20 backdrop-blur-lg rounded-2xl px-4 py-3 border border-white/30">
                  <ArrowUpIcon className="w-5 h-5 text-conces-gold mb-1" />
                  <div className="text-2xl font-bold text-white">
                    {project.vote || 0}
                  </div>
                  <div className="text-xs text-white/80 font-medium">votes</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-2xl border border-blue-200/60">
                <h3 className="font-bold text-conces-blue mb-2 flex items-center gap-2 text-base">
                  <div className="w-1.5 h-6 bg-conces-blue rounded-full"></div>
                  Design Concept
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {project.designConcept}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-2xl border border-purple-200/60">
                <h3 className="font-bold text-conces-blue mb-2 flex items-center gap-2 text-base">
                  <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                  Color Palette
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {project.colorPalette}
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 rounded-2xl border border-amber-200/60">
                <h3 className="font-bold text-conces-blue mb-2 flex items-center gap-2 text-base">
                  <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                  Inspiration
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {project.inspiration}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-4 bg-gradient-to-t from-gray-50 to-transparent border-t border-gray-200/60">
              <div className="flex gap-3">
                <motion.button
                  onClick={onVote}
                  disabled={isVoted || !isVotingOpen}
                  whileHover={!isVoted && isVotingOpen ? { scale: 1.02 } : {}}
                  whileTap={!isVoted && isVotingOpen ? { scale: 0.98 } : {}}
                  className={`flex-1 py-3 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm ${
                    isVoted
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                      : !isVotingOpen
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                      : "bg-gradient-to-r from-conces-green to-emerald-600 text-white hover:shadow-xl border border-transparent"
                  }`}
                >
                  {isVoted ? (
                    <>
                      <HeartSolidIcon className="w-5 h-5" />
                      <span>Already Voted</span>
                    </>
                  ) : !isVotingOpen ? (
                    <>
                      <WifiOff className="w-5 h-5" />
                      <span>Voting Closed</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5" />
                      <span>Vote Now</span>
                    </>
                  )}
                </motion.button>
                <motion.button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: project.projectTitle,
                        text: `Check out "${project.projectTitle}" by ${project.candidate.fullName} - ${project.designConcept}`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Design link copied to clipboard!");
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-3 bg-white border-2 border-gray-300 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isVotingOpen}
                >
                  <ShareIcon className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
