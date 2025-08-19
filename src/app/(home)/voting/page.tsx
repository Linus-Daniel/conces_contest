// Enhanced VotingPage with SSE integration
"use client";
import React, { useState, useEffect } from "react";
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
  Share,
  Share2,
  Wifi,
  WifiOff,
  TrendingUp,
} from "lucide-react";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import OTPVotingModal from "@/components/OtpVotingModal";
import api from "@/lib/axiosInstance";

// Your existing Project interface
interface Project {
  _id: string;
  candidate: {
    fullName: string;
    schoolName: string;
    department: string;
    avatar: string;
  };
  projectTitle: string;
  designConcept: string;
  colorPalette: string;
  inspiration: string;
  primaryFileUrl: string;
  mockupUrl?: string;
  vote: number;
  status: string;
  submittedAt: string;
}

// SSE Data interface
interface SSEVoteUpdate {
  type: "connected" | "voteUpdate" | "error";
  projects?: {
    id: string;
    title: string;
    votes: number;
    candidate: any;
  }[];
  totalVotes?: number;
  timestamp?: string;
  message?: string;
}

// Custom hook for SSE vote updates
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
      console.log("🔴 Live vote tracking connected");
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SSEVoteUpdate = JSON.parse(event.data);

        switch (data.type) {
          case "connected":
            setConnectionStatus("connected");
            break;

          case "voteUpdate":
            if (data.projects) {
              onVoteUpdate(data.projects);
              setTotalVotes(data.totalVotes || 0);
              setLastUpdate(data.timestamp || "");
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

export default function VotingPage() {
  // Your existing state variables
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedProjects, setVotedProjects] = useState<Set<string>>(new Set());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"votes" | "newest" | "title">("votes");
  const [filterSchool, setFilterSchool] = useState<string>("all");

  // OTP modal states
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [selectedProjectToVote, setSelectedProjectToVote] =
    useState<Project | null>(null);

  // SSE hook
  const {
    connectionStatus,
    lastUpdate,
    totalVotes,
    updateProjectVotes,
    connectToSSE,
  } = useRealTimeVotes();

  // Handle vote button click
  const handleVoteClick = (project: Project) => {
    setSelectedProjectToVote(project);
    setShowOTPModal(true);
  };

  // Handle vote success from OTP modal
  const handleVoteSuccess = (newVoteCount: number) => {
    if (!selectedProjectToVote) return;

    // Update voted projects
    const newVoted = new Set(votedProjects);
    newVoted.add(selectedProjectToVote._id);
    setVotedProjects(newVoted);
    // localStorage.setItem("votedProjects", JSON.stringify(Array.from(newVoted)));

    // Update project votes in state (SSE will also update this, but we do it immediately for better UX)
    setProjects((prev) =>
      prev.map((p) =>
        p._id === selectedProjectToVote._id ? { ...p, vote: newVoteCount } : p
      )
    );

    // Close modal
    setShowOTPModal(false);
    setSelectedProjectToVote(null);

    toast.success("Vote confirmed successfully! 🎉");
  };

  // Initialize and fetch projects
  useEffect(() => {
    const stored = localStorage.getItem("votedProjects");
    if (stored) {
      setVotedProjects(new Set(JSON.parse(stored)));
    }
    fetchProjects();
  }, []);

  // Set up SSE connection
  useEffect(() => {
    if (projects.length === 0) return;

    const eventSource = connectToSSE((voteUpdates) => {
      setProjects((prev) => updateProjectVotes(prev, voteUpdates));
    });

    return () => {
      eventSource.close();
    };
  }, [projects.length > 0]);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects");
      const data = await response.data;
      console.log(data);
      setProjects(data.projects);
      setFilteredProjects(data.projects);
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort logic (existing)
  useEffect(() => {
    let filtered = [...projects];

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.candidate.fullName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          p.candidate.schoolName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (filterSchool !== "all") {
      filtered = filtered.filter(
        (p) => p.candidate.schoolName === filterSchool
      );
    }

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
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Enhanced header with live status */}
      <header className="bg-gradient-to-r from-conces-blue to-conces-blue/90 text-white">
        <div className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Vote for Your Favorite Design
            </h1>
            <p className="text-xl text-white/90 mb-2">
              Help choose the new face of CONCES
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-white/80 mb-6">
              <span> secure and instant!</span>
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-500/20 text-green-200"
                    : connectionStatus === "connecting"
                    ? "bg-yellow-500/20 text-yellow-200"
                    : "bg-red-500/20 text-red-200"
                }`}
              >
                {connectionStatus === "connected" ? (
                  <>
                    <Wifi className="w-4 h-4" />
                    <span>Live Updates</span>
                  </>
                ) : connectionStatus === "connecting" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            </div>

            {/* Enhanced stats with live indicator */}
            <div className="mt-6 flex justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-conces-gold">
                  {projects.length}
                </div>
                <div className="text-sm text-white/80">Total Designs</div>
              </div>
              <div className="text-center relative">
                <div className="text-3xl font-bold text-conces-gold flex items-center justify-center gap-2">
                  {totalVotes ||
                    projects.reduce((sum, p) => sum + (p.vote || 0), 0)}
                  {connectionStatus === "connected" && (
                    <TrendingUp className="w-5 h-5 text-green-400 animate-pulse" />
                  )}
                </div>
                <div className="text-sm text-white/80">
                  Total Votes
                  {lastUpdate && connectionStatus === "connected" && (
                    <div className="text-xs text-green-200 mt-1">
                      Updated {new Date(lastUpdate).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-conces-gold">
                  {schools.length}
                </div>
                <div className="text-sm text-white/80">Schools</div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Your existing filters and search (unchanged) */}
      <div className="sticky top-0 z-40 bg-white shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, designer, or school..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-conces-green"
                />
              </div>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-conces-green"
            >
              <option value="votes">Most Votes</option>
              <option value="newest">Newest First</option>
              <option value="title">Title A-Z</option>
            </select>
            <select
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-conces-green"
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
      </div>

      {/* Projects grid (your existing code) */}
      <div className="container mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-conces-green"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No designs found matching your criteria
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project._id}
                project={project}
                index={index}
                // isVoted={votedProjects.has(project._id)}
                onVote={() => handleVoteClick(project)}
                onView={() => setSelectedProject(project)}
                isLiveConnected={connectionStatus === "connected"}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Your existing modals */}
      {showOTPModal && selectedProjectToVote && (
        <OTPVotingModal
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

      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            isVoted={votedProjects.has(selectedProject._id)}
            onClose={() => setSelectedProject(null)}
            onVote={() => {
              handleVoteClick(selectedProject);
              setSelectedProject(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Enhanced ProjectCard with live update animations
function ProjectCard({
  project,
  index,
  // isVoted,
  onVote,
  onView,
  isLiveConnected,
}: {
  project: Project;
  index: number;
  // isVoted: boolean;
  onVote: () => void;
  onView: () => void;
  isLiveConnected: boolean;
}) {
  const [imageLoading, setImageLoading] = useState(true);
  const [previousVotes, setPreviousVotes] = useState(project.vote || 0);
  const [showVoteAnimation, setShowVoteAnimation] = useState(false);

  // Animate vote count changes
  useEffect(() => {
    const currentVotes = project.vote || 0;
    if (currentVotes > previousVotes && isLiveConnected) {
      setShowVoteAnimation(true);
      setTimeout(() => setShowVoteAnimation(false), 2000);
    }
    setPreviousVotes(currentVotes);
  }, [project.vote, previousVotes, isLiveConnected]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden group relative"
    >
      {/* Vote animation overlay */}
      <AnimatePresence>
        {showVoteAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-green-500/20 backdrop-blur-sm"
          >
            <div className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="font-bold">New Vote!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Your existing image and content code */}
      <div className="relative h-64 bg-gray-100">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conces-green"></div>
          </div>
        )}
        <img
          src={project.primaryFileUrl}
          alt={project.projectTitle}
          className="w-full h-full object-cover"
          onLoad={() => setImageLoading(false)}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={onView}
              className="w-full bg-white text-conces-blue py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Enhanced vote counter with live indicator */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
          <ArrowUpIcon
            className={`w-4 h-4 text-conces-green ${
              showVoteAnimation ? "animate-bounce" : ""
            }`}
          />
          <motion.span
            key={project.vote} // Re-animate on vote change
            initial={{ scale: showVoteAnimation ? 1.2 : 1 }}
            animate={{ scale: 1 }}
            className="font-semibold text-sm"
          >
            {project.vote || 0}
          </motion.span>
          {isLiveConnected && (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-1" />
          )}
        </div>
      </div>

      {/* Your existing content section */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-conces-blue mb-1 line-clamp-1">
          {project.projectTitle}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              by {project.candidate.fullName}
            </p>
            <p className="text-xs text-gray-500 mb-3">
              {project.candidate.schoolName}
            </p>
          </div>
          <Image
            src={project.candidate?.avatar}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover"
            alt="candidate"
          />
        </div>

        {/* Your existing vote button */}
        <div className="flex gap-2">
          <button
            onClick={onVote}
            // disabled={isVoted}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            
                 "bg-conces-green text-white hover:bg-conces-green/90"
            }`}
          >
          
              <>
                <MessageCircle className="w-4 h-4" />
                Vote
              </>
          
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: project.projectTitle,
                  text: `Check out this design for the CONCES logo rebrand challenge!`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard!");
              }
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Your existing ProjectDetailModal (unchanged)
function ProjectDetailModal({
  project,
  isVoted,
  onClose,
  onVote,
}: {
  project: Project;
  isVoted: boolean;
  onClose: () => void;
  onVote: () => void;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [project.primaryFileUrl, project.mockupUrl].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row h-full">
          {/* Your existing modal content - keeping it the same */}
          <div className="md:w-1/2 bg-gray-100 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative h-96 md:h-full">
              <img
                src={images[currentImageIndex]}
                alt={project.projectTitle}
                className="w-full h-full object-contain"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex(
                        (prev) => (prev - 1 + images.length) % images.length
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) => (prev + 1) % images.length)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          idx === currentImageIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-conces-blue mb-2">
                  {project.projectTitle}
                </h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700 font-medium">
                      {project.candidate.fullName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {project.candidate.schoolName} •{" "}
                      {project.candidate.department}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-conces-green">
                      {project.vote || 0}
                    </div>
                    <div className="text-xs text-gray-500">votes</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-conces-blue mb-2">
                  Design Concept
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {project.designConcept}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-conces-blue mb-2">
                  Color Palette
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {project.colorPalette}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-conces-blue mb-2">
                  Inspiration
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {project.inspiration}
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={onVote}
                  disabled={isVoted}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    isVoted
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-conces-green text-white hover:bg-conces-green/90"
                  }`}
                >
                  {isVoted ? (
                    <>
                      <HeartSolidIcon className="w-5 h-5" />
                      Already Voted
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5" />
                      Vote via WhatsApp
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: project.projectTitle,
                        text: `Check out this design by ${project.candidate.fullName} for the CONCES logo rebrand challenge!`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied!");
                    }
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ShareIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
