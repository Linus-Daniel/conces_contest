// app/voting/candidate/[id]/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  HeartIcon,
  ShareIcon,
  MessageCircle,
  TrendingUp,
  Award,
  Calendar,
  School,
  BookOpen,
  Users,
  FileText,
  Download,
  ExternalLink,
  Video,
  File,
  Image as ImageIcon,
} from "lucide-react";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import OTPVotingModal from "@/components/OtpVotingModal";
import api from "@/lib/axiosInstance";

interface Candidate {
  _id: string;
  fullName: string;
  schoolName: string;
  department: string;
  avatar: string;
  email: string;
  phone: string;
  bio: string;
  year: string;
  submittedAt: string;
}

interface Project {
  _id: string;
  candidate: Candidate;
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

// Enhanced Media Renderer Component
function MediaRenderer({
  url,
  alt,
  className = "",
  onLoad,
  thumbnail = false,
}: {
  url: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  thumbnail?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<
    "image" | "pdf" | "video" | "document" | "unknown"
  >("unknown");

  useEffect(() => {
    // Determine file type from URL and extension
    const determineFileType = () => {
      if (!url) return "unknown";

      const lowerUrl = url.toLowerCase();

      // Check for PDF
      if (
        lowerUrl.endsWith(".pdf") ||
        lowerUrl.includes("/pdf/") ||
        lowerUrl.includes("application/pdf")
      ) {
        return "pdf";
      }

      // Check for images
      const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".svg",
        ".bmp",
        ".tiff",
      ];
      if (imageExtensions.some((ext) => lowerUrl.includes(ext))) {
        return "image";
      }

      // Check for videos
      const videoExtensions = [
        ".mp4",
        ".avi",
        ".mov",
        ".wmv",
        ".flv",
        ".webm",
        ".mkv",
      ];
      if (videoExtensions.some((ext) => lowerUrl.includes(ext))) {
        return "video";
      }

      // Check for documents
      const documentExtensions = [".doc", ".docx", ".txt", ".rtf", ".odt"];
      if (documentExtensions.some((ext) => lowerUrl.includes(ext))) {
        return "document";
      }

      return "unknown";
    };

    setFileType(determineFileType());
  }, [url]);

  const getFileIcon = () => {
    switch (fileType) {
      case "pdf":
        return <FileText className="w-8 h-8 text-red-500" />;
      case "video":
        return <Video className="w-8 h-8 text-purple-500" />;
      case "document":
        return <File className="w-8 h-8 text-blue-500" />;
      case "unknown":
        return <File className="w-8 h-8 text-gray-500" />;
      default:
        return null;
    }
  };

  const getFileTypeLabel = () => {
    switch (fileType) {
      case "pdf":
        return "PDF";
      case "video":
        return "Video";
      case "document":
        return "Document";
      case "unknown":
        return "File";
      default:
        return "";
    }
  };

  // PDF Viewer
  if (fileType === "pdf") {
    return (
      <div
        className={`${className} w-full h-full flex flex-col bg-gray-50 rounded-lg overflow-hidden border`}
      >
        <div className="flex items-center justify-between p-3 bg-gray-100 border-b">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-gray-700 truncate">
              {alt}
            </span>
          </div>
          <div className="flex gap-2">
            <a
              href={url}
              download
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Download PDF"
            >
              <Download className="w-4 h-4 text-gray-600" />
            </a>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4 text-gray-600" />
            </a>
          </div>
        </div>
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conces-green"></div>
            </div>
          )}
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 p-4">
              <FileText className="w-12 h-12 text-gray-400" />
              <p className="text-gray-500 text-center text-sm">{error}</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-conces-blue hover:underline text-sm"
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
              title={alt}
            />
          )}
        </div>
      </div>
    );
  }

  // Video Player
  if (fileType === "video") {
    return (
      <div
        className={`${className} relative bg-gray-100 rounded-lg overflow-hidden`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conces-green"></div>
          </div>
        )}
        <video
          src={url}
          controls
          className="w-full h-full object-contain"
          onLoadStart={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        >
          Your browser does not support the video tag.
        </video>
        {thumbnail && (
          <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Video
          </div>
        )}
      </div>
    );
  }

  // Document/Other File Types
  if (fileType === "document" || fileType === "unknown") {
    return (
      <div
        className={`${className} bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center flex-col p-6`}
      >
        {getFileIcon()}
        <div className="mt-3 text-center">
          <div className="font-semibold text-gray-700">
            {getFileTypeLabel()}
          </div>
          <div className="text-sm text-gray-500 mt-1 truncate max-w-[200px]">
            {alt}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <a
            href={url}
            download
            className="flex items-center gap-1 px-3 py-1 bg-conces-blue text-white rounded text-sm hover:bg-blue-600 transition-colors"
          >
            <Download className="w-3 h-3" />
            Download
          </a>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Open
          </a>
        </div>
      </div>
    );
  }

  // Image Renderer (default)
  return (
    <div
      className={`${className} relative bg-gray-100 rounded-lg overflow-hidden`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conces-green"></div>
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
          setError("Failed to load image");
        }}
      />
      {thumbnail && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
          Image
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 bg-gray-100">
          <ImageIcon className="w-8 h-8 text-gray-400" />
          <span className="text-gray-500 text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
}

// Logo Grid Component to render all logos
function LogoGrid({
  project,
  onVote,
  isVoted,
}: {
  project: Project;
  onVote: () => void;
  isVoted: boolean;
}) {
  const allLogos = [
    ...(project.primaryFileUrls || []),
    ...(project.mockupUrls || []),
  ].filter(Boolean);

  if (allLogos.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center border border-gray-200">
        <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No logos available for this project</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Logo Preview */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm">
        <h3 className="font-bold text-lg text-gray-900 mb-4">Main Logo</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {project.primaryFileUrls?.map((url, index) => (
            <div key={index} className="space-y-3">
              <MediaRenderer
                url={url}
                alt={`${project.projectTitle} - Main Logo ${index + 1}`}
                className="h-64 lg:h-80"
              />
              <div className="text-center text-sm text-gray-600">
                Logo Variation {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mockups Section */}
      {project.mockupUrls && project.mockupUrls.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm">
          <h3 className="font-bold text-lg text-gray-900 mb-4">
            Logo Mockups ({project.mockupUrls.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.mockupUrls.map((url, index) => (
              <div key={index} className="space-y-3">
                <MediaRenderer
                  url={url}
                  alt={`${project.projectTitle} - Mockup ${index + 1}`}
                  className="h-48"
                  thumbnail
                />
                <div className="text-center text-sm text-gray-600">
                  Mockup {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Files Grid */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm">
        <h3 className="font-bold text-lg text-gray-900 mb-4">
          All Project Files ({allLogos.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allLogos.map((url, index) => (
            <div key={index} className="group relative">
              <MediaRenderer
                url={url}
                alt={`${project.projectTitle} - File ${index + 1}`}
                className="h-32"
                thumbnail
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                <div className="text-white text-center text-sm p-2">
                  View File {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vote Section */}
      <div className="bg-gradient-to-r from-conces-green to-emerald-600 rounded-2xl p-6 text-center">
        <h3 className="text-white font-bold text-xl mb-3">Like this design?</h3>
        <p className="text-white/90 mb-4">
          Show your support by voting for this project!
        </p>
        <motion.button
          onClick={onVote}
          disabled={isVoted}
          whileHover={!isVoted ? { scale: 1.05 } : {}}
          whileTap={!isVoted ? { scale: 0.95 } : {}}
          className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 mx-auto ${
            isVoted
              ? "bg-white/20 text-white/70 cursor-not-allowed"
              : "bg-white text-conces-green hover:shadow-lg"
          }`}
        >
          {isVoted ? (
            <>
              <HeartSolidIcon className="w-6 h-6" />
              Already Voted
            </>
          ) : (
            <>
              <MessageCircle className="w-6 h-6" />
              Vote for this Project
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedProjects, setVotedProjects] = useState<Set<string>>(new Set());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [selectedProjectToVote, setSelectedProjectToVote] =
    useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<"projects" | "about">("projects");

  useEffect(() => {
    const stored = localStorage.getItem("votedProjects");
    if (stored) {
      setVotedProjects(new Set(JSON.parse(stored)));
    }
    fetchCandidateData();
  }, [candidateId]);

  const fetchCandidateData = async () => {
    try {
      setLoading(true);
      const [candidateResponse, projectsResponse] = await Promise.all([
        api.get(`/candidates/${candidateId}`),
        api.get(`/projects?candidateId=${candidateId}`),
      ]);

      setCandidate(candidateResponse.data.candidate);
      setProjects(projectsResponse.data.projects);
    } catch (error) {
      toast.error("Failed to load candidate data");
      console.error("Error fetching candidate data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteClick = (project: Project) => {
    setSelectedProjectToVote(project);
    setShowOTPModal(true);
  };

  const handleVoteSuccess = (newVoteCount: number) => {
    if (!selectedProjectToVote) return;

    const newVoted = new Set(votedProjects);
    newVoted.add(selectedProjectToVote._id);
    setVotedProjects(newVoted);
    localStorage.setItem("votedProjects", JSON.stringify([...newVoted]));

    setProjects((prev) =>
      prev.map((p) =>
        p._id === selectedProjectToVote._id ? { ...p, vote: newVoteCount } : p
      )
    );

    setShowOTPModal(false);
    setSelectedProjectToVote(null);
    toast.success("Vote confirmed successfully! 🎉");
  };

  const totalVotes = projects.reduce(
    (sum, project) => sum + (project.vote || 0),
    0
  );
  const totalProjects = projects.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-conces-green"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            Candidate Not Found
          </h2>
          <button
            onClick={() => router.push("/voting")}
            className="bg-conces-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Voting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-conces-blue via-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              onClick={() => router.push("/voting")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-lg rounded-2xl px-4 py-3 hover:bg-white/30 transition-colors border border-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Voting</span>
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row gap-8 items-start"
          >
            {/* Candidate Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-3xl border-4 border-white/20 shadow-2xl overflow-hidden">
                  <Image
                    src={candidate.avatar}
                    alt={candidate.fullName}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-conces-gold text-white rounded-2xl px-3 py-1 text-sm font-bold shadow-lg">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  {totalVotes} votes
                </div>
              </div>
            </div>

            {/* Candidate Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {candidate.fullName}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                  <School className="w-6 h-6 text-conces-gold" />
                  <div>
                    <div className="text-white/80 text-sm">School</div>
                    <div className="font-semibold text-white">
                      {candidate.schoolName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                  <BookOpen className="w-6 h-6 text-conces-gold" />
                  <div>
                    <div className="text-white/80 text-sm">Department</div>
                    <div className="font-semibold text-white">
                      {candidate.department}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                  <Award className="w-6 h-6 text-conces-gold" />
                  <div>
                    <div className="text-white/80 text-sm">Projects</div>
                    <div className="font-semibold text-white">
                      {totalProjects}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {candidate.bio && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold text-white mb-2 text-lg">
                    About Me
                  </h3>
                  <p className="text-white/90 leading-relaxed">
                    {candidate.bio}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("projects")}
              className={`py-4 px-1 border-b-2 font-semibold text-lg transition-all duration-200 ${
                activeTab === "projects"
                  ? "border-conces-blue text-conces-blue"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Projects ({totalProjects})
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`py-4 px-1 border-b-2 font-semibold text-lg transition-all duration-200 ${
                activeTab === "about"
                  ? "border-conces-blue text-conces-blue"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <BookOpen className="w-5 h-5 inline mr-2" />
              About Candidate
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === "projects" ? (
          <div className="space-y-8">
            {projects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl shadow-lg border border-gray-200/60 overflow-hidden"
              >
                {/* Project Header */}
                <div className="bg-gradient-to-r from-conces-blue to-blue-600 text-white p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                        {project.projectTitle}
                      </h2>
                      <p className="text-blue-100 text-lg">
                        {project.designConcept}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">
                          {project.vote || 0}
                        </div>
                        <div className="text-blue-200 text-sm">Votes</div>
                      </div>
                      <motion.button
                        onClick={() => handleVoteClick(project)}
                        disabled={votedProjects.has(project._id)}
                        whileHover={
                          !votedProjects.has(project._id) ? { scale: 1.05 } : {}
                        }
                        whileTap={
                          !votedProjects.has(project._id) ? { scale: 0.95 } : {}
                        }
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                          votedProjects.has(project._id)
                            ? "bg-white/20 text-white/70 cursor-not-allowed"
                            : "bg-white text-conces-blue hover:shadow-lg"
                        }`}
                      >
                        {votedProjects.has(project._id) ? "Voted" : "Vote Now"}
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Project Content */}
                <div className="p-6 lg:p-8">
                  <LogoGrid
                    project={project}
                    onVote={() => handleVoteClick(project)}
                    isVoted={votedProjects.has(project._id)}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200/60 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Candidate Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <School className="w-8 h-8 text-conces-blue" />
                  <div>
                    <div className="text-gray-600 text-sm">School</div>
                    <div className="font-semibold text-gray-900">
                      {candidate.schoolName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <BookOpen className="w-8 h-8 text-conces-blue" />
                  <div>
                    <div className="text-gray-600 text-sm">Department</div>
                    <div className="font-semibold text-gray-900">
                      {candidate.department}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <Calendar className="w-8 h-8 text-conces-blue" />
                  <div>
                    <div className="text-gray-600 text-sm">Year</div>
                    <div className="font-semibold text-gray-900">
                      {candidate.year || "Not specified"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <Award className="w-8 h-8 text-conces-blue" />
                  <div>
                    <div className="text-gray-600 text-sm">Total Projects</div>
                    <div className="font-semibold text-gray-900">
                      {totalProjects}
                    </div>
                  </div>
                </div>
              </div>

              {candidate.bio && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/60">
                  <h3 className="font-bold text-conces-blue mb-4 text-xl">
                    Personal Bio
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {candidate.bio}
                  </p>
                </div>
              )}

              <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200/60">
                <h3 className="font-bold text-conces-green mb-3 text-xl">
                  Voting Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-conces-green">
                      {totalVotes}
                    </div>
                    <div className="text-gray-600">Total Votes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-conces-blue">
                      {totalProjects}
                    </div>
                    <div className="text-gray-600">Projects Submitted</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
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
    </div>
  );
}
