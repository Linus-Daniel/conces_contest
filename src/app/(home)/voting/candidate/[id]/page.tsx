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
  Mail,
  Phone,
  WifiOff,
  User,
  Palette,
  Lightbulb,
} from "lucide-react";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import EmailOTPVotingModal from "@/components/EmailOtpVotingModal";
import { useMaintenance, MaintenancePage } from "@/context/MaintenanceContext";
import api from "@/lib/axiosInstance";
import { useTimer } from "@/context/CountdownContext";

interface Candidate {
  _id: string;
  fullName: string;
  avatar: string;
  email: string;
  phone: string;
  institution: string;
  department: string;
  matricNumber: string;
  isQualified: boolean;
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
  createdAt: string;
  updatedAt: string;
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
    const determineFileType = () => {
      if (!url) return "unknown";

      const lowerUrl = url.toLowerCase();

      if (
        lowerUrl.endsWith(".pdf") ||
        lowerUrl.includes("/pdf/") ||
        lowerUrl.includes("application/pdf")
      ) {
        return "pdf";
      }

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
        return <FileText className="w-6 h-6 text-red-500" />;
      case "video":
        return <Video className="w-6 h-6 text-purple-500" />;
      case "document":
        return <File className="w-6 h-6 text-blue-500" />;
      case "unknown":
        return <File className="w-6 h-6 text-gray-500" />;
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
        className={`${className} w-full h-full flex flex-col bg-gray-50 rounded-xl overflow-hidden border border-gray-200`}
      >
        <div className="flex items-center justify-between p-3 bg-gray-100 border-b border-gray-200">
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
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              title="Download PDF"
            >
              <Download className="w-4 h-4 text-gray-600" />
            </a>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4 text-gray-600" />
            </a>
          </div>
        </div>
        <div className="flex-1 relative bg-white">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conces-green"></div>
                <p className="text-sm text-gray-500">Loading PDF...</p>
              </div>
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
        className={`${className} relative bg-gray-100 rounded-xl overflow-hidden`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conces-green"></div>
              <p className="text-sm text-gray-500">Loading video...</p>
            </div>
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
          <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
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
        className={`${className} bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center flex-col p-4`}
      >
        {getFileIcon()}
        <div className="mt-2 text-center">
          <div className="font-semibold text-gray-700 text-sm">
            {getFileTypeLabel()}
          </div>
          <div className="text-xs text-gray-500 mt-1 truncate max-w-[150px]">
            {alt}
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <a
            href={url}
            download
            className="flex items-center gap-1 px-2 py-1 bg-conces-blue text-white rounded-lg text-xs hover:bg-blue-600 transition-colors duration-200"
          >
            <Download className="w-3 h-3" />
            Download
          </a>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-300 transition-colors duration-200"
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
      className={`${className} relative bg-gray-100 rounded-xl overflow-hidden`}
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
          setError("Failed to load image");
        }}
      />
      {thumbnail && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
          Image
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 bg-gray-100">
          <ImageIcon className="w-6 h-6 text-gray-400" />
          <span className="text-gray-500 text-xs">Failed to load image</span>
        </div>
      )}
    </div>
  );
}

// Logo Grid Component
function LogoGrid({
  project,
  onVote,
  isVoted,
  isVotingOpen,
}: {
  project: Project;
  onVote: () => void;
  isVoted: boolean;
  isVotingOpen: boolean;
}) {
  const allLogos = [
    ...(project.primaryFileUrls || []),
    ...(project.mockupUrls || []),
  ].filter(Boolean);

  if (allLogos.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 sm:p-8 text-center border border-gray-200">
        <File className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">
          No logos available for this project
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Logo Preview */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-sm">
        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-conces-blue" />
          Main Logo Design
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {project.primaryFileUrls?.map((url, index) => (
            <div key={index} className="space-y-3">
              <MediaRenderer
                url={url}
                alt={`${project.projectTitle} - Main Logo ${index + 1}`}
                className="h-48 sm:h-64 lg:h-72"
              />
              <div className="text-center text-sm text-gray-600 font-medium">
                Logo Variation {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mockups Section */}
      {project.mockupUrls && project.mockupUrls.length > 0 && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-sm">
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-conces-green" />
            Logo Mockups ({project.mockupUrls.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {project.mockupUrls.map((url, index) => (
              <div key={index} className="space-y-3">
                <MediaRenderer
                  url={url}
                  alt={`${project.projectTitle} - Mockup ${index + 1}`}
                  className="h-40 sm:h-48"
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
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200/60 shadow-sm">
        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-conces-blue" />
          All Project Files ({allLogos.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {allLogos.map((url, index) => (
            <div key={index} className="group relative">
              <MediaRenderer
                url={url}
                alt={`${project.projectTitle} - File ${index + 1}`}
                className="h-28 sm:h-32"
                thumbnail
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                <div className="text-white text-center text-xs p-2 font-medium">
                  View File {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vote Section */}
      <div className="bg-gradient-to-r from-conces-green to-emerald-600 rounded-2xl p-6 text-center">
        <h3 className="text-white font-bold text-lg sm:text-xl mb-3">
          Like this design?
        </h3>
        <p className="text-white/90 mb-4 text-sm sm:text-base">
          Show your support by voting for this project!
        </p>
        <motion.button
          onClick={onVote}
          disabled={isVoted || !isVotingOpen}
          whileHover={!isVoted && isVotingOpen ? { scale: 1.05 } : {}}
          whileTap={!isVoted && isVotingOpen ? { scale: 0.95 } : {}}
          className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-3 mx-auto ${
            isVoted
              ? "bg-white/20 text-white/70 cursor-not-allowed"
              : !isVotingOpen
              ? "bg-white/20 text-white/70 cursor-not-allowed"
              : "bg-white text-conces-green hover:shadow-lg"
          }`}
        >
          {isVoted ? (
            <>
              <HeartSolidIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              Already Voted
            </>
          ) : !isVotingOpen ? (
            <>
              <WifiOff className="w-5 h-5 sm:w-6 sm:h-6" />
              Voting Closed
            </>
          ) : (
            <>
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
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
  const projectId = params.id as string;
  const { isMaintenanceMode } = useMaintenance();
  const { isVotingOpen } = useTimer();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [votedProjects, setVotedProjects] = useState<Set<string>>(new Set());
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [selectedProjectToVote, setSelectedProjectToVote] =
    useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<"project" | "about">("project");

  useEffect(() => {
    const stored = localStorage.getItem("votedProjects");
    if (stored) {
      setVotedProjects(new Set(JSON.parse(stored)));
    }
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects/${projectId}`);
      setProject(response.data.project);
    } catch (error) {
      toast.error("Failed to load project data");
      console.error("Error fetching project data:", error);
    } finally {
      setLoading(false);
    }
  };

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
    localStorage.setItem("votedProjects", JSON.stringify([...newVoted]));

    setProject((prev) => (prev ? { ...prev, vote: newVoteCount } : null));

    setShowOTPModal(false);
    setSelectedProjectToVote(null);
    toast.success("Vote confirmed successfully! 🎉");
  };

  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-conces-green"></div>
          <p className="text-gray-600 font-medium">
            Loading project details...
          </p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-3xl p-8 shadow-lg border border-gray-200/60 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Project Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <motion.button
            onClick={() => router.push("/voting")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-conces-blue text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 w-full sm:w-auto"
          >
            Back to Voting
          </motion.button>
        </div>
      </div>
    );
  }

  const candidate = project.candidate;
  const isVoted = votedProjects.has(project._id);

  // if (!isVotingOpen) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
  //       <div className="text-center bg-white rounded-3xl p-8 shadow-lg border border-gray-200/60 max-w-md w-full">
  //         <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
  //           <WifiOff className="w-8 h-8 text-yellow-600" />
  //         </div>
  //         <h2 className="text-2xl font-bold text-gray-900 mb-4">
  //           Voting Closed
  //         </h2>
  //         <p className="text-gray-600 mb-6">
  //           The voting period has ended. Thank you for your interest and
  //           participation!
  //         </p>
  //         <motion.button
  //           onClick={() => router.push("/voting")}
  //           whileHover={{ scale: 1.05 }}
  //           whileTap={{ scale: 0.95 }}
  //           className="bg-conces-blue text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 w-full sm:w-auto"
  //         >
  //           Back to Voting Page
  //         </motion.button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-conces-blue via-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push("/voting")}
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors duration-200 mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Voting</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start"
          >
            {/* Candidate Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-2xl lg:rounded-3xl border-4 border-white/20 shadow-2xl overflow-hidden">
                  <Image
                    src={candidate.avatar}
                    alt={candidate.fullName}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-conces-gold text-white rounded-xl lg:rounded-2xl px-3 py-1 text-xs lg:text-sm font-bold shadow-lg">
                  <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1" />
                  {project.vote || 0} votes
                </div>
              </div>
            </div>

            {/* Candidate & Project Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 lg:mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent leading-tight">
                {project.projectTitle}
              </h1>
              <p className="text-lg text-blue-100 mb-4 lg:mb-6 leading-relaxed line-clamp-2">
                {project.designConcept}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-white/20">
                  <School className="w-5 h-5 lg:w-6 lg:h-6 text-conces-gold" />
                  <div>
                    <div className="text-white/80 text-xs lg:text-sm">
                      School
                    </div>
                    <div className="font-semibold text-white text-sm lg:text-base truncate">
                      {candidate.institution}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-white/20">
                  <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-conces-gold" />
                  <div>
                    <div className="text-white/80 text-xs lg:text-sm">
                      Department
                    </div>
                    <div className="font-semibold text-white text-sm lg:text-base truncate">
                      {candidate.department}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-white/20">
                  <Award className="w-5 h-5 lg:w-6 lg:h-6 text-conces-gold" />
                  <div>
                    <div className="text-white/80 text-xs lg:text-sm">
                      Matric No
                    </div>
                    <div className="font-semibold text-white text-sm lg:text-base">
                      {candidate.matricNumber}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-white/20">
                  <Users className="w-5 h-5 lg:w-6 lg:h-6 text-conces-gold" />
                  <div>
                    <div className="text-white/80 text-xs lg:text-sm">
                      Designer
                    </div>
                    <div className="font-semibold text-white text-sm lg:text-base truncate">
                      {candidate.fullName}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("project")}
              className={`py-3 sm:py-4 px-1 border-b-2 font-semibold text-sm sm:text-base transition-all duration-200 whitespace-nowrap ${
                activeTab === "project"
                  ? "border-conces-blue text-conces-blue"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Award className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
              Project Details
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`py-3 sm:py-4 px-1 border-b-2 font-semibold text-sm sm:text-base transition-all duration-200 whitespace-nowrap ${
                activeTab === "about"
                  ? "border-conces-blue text-conces-blue"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
              About Designer
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === "project" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-gray-200/60 overflow-hidden"
          >
            {/* Project Header */}
            <div className="bg-gradient-to-r from-conces-blue to-blue-600 text-white p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
                    {project.projectTitle}
                  </h2>
                  <p className="text-blue-100 text-sm sm:text-base lg:text-lg line-clamp-2">
                    {project.designConcept}
                  </p>
                </div>
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      {project.vote || 0}
                    </div>
                    <div className="text-blue-200 text-xs sm:text-sm">
                      Votes
                    </div>
                  </div>
                  <motion.button
                    onClick={() => handleVoteClick(project)}
                    disabled={isVoted || !isVotingOpen}
                    whileHover={!isVoted && isVotingOpen ? { scale: 1.05 } : {}}
                    whileTap={!isVoted && isVotingOpen ? { scale: 0.95 } : {}}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all ${
                      isVoted
                        ? "bg-white/20 text-white/70 cursor-not-allowed"
                        : !isVotingOpen
                        ? "bg-white/20 text-white/70 cursor-not-allowed"
                        : "bg-white text-conces-blue hover:shadow-lg"
                    }`}
                  >
                    {isVoted ? "Voted" : !isVotingOpen ? "Closed" : "Vote Now"}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Project Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              <LogoGrid
                project={project}
                onVote={() => handleVoteClick(project)}
                isVoted={isVoted}
                isVotingOpen={isVotingOpen}
              />

              {/* Project Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Color Palette */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 sm:p-6 rounded-2xl border border-purple-200/60">
                  <h3 className="font-bold text-conces-blue mb-3 text-base sm:text-lg flex items-center gap-3">
                    <Palette className="w-5 h-5 text-purple-500" />
                    Color Palette
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {project.colorPalette}
                  </p>
                </div>

                {/* Inspiration */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 sm:p-6 rounded-2xl border border-amber-200/60">
                  <h3 className="font-bold text-conces-blue mb-3 text-base sm:text-lg flex items-center gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Inspiration
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {project.inspiration}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-gray-200/60 p-4 sm:p-6 lg:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-conces-blue" />
                Designer Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl">
                  <School className="w-6 h-6 sm:w-8 sm:h-8 text-conces-blue" />
                  <div>
                    <div className="text-gray-600 text-xs sm:text-sm">
                      Institution
                    </div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                      {candidate.institution}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl">
                  <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-conces-blue" />
                  <div>
                    <div className="text-gray-600 text-xs sm:text-sm">
                      Department
                    </div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                      {candidate.department}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-conces-blue" />
                  <div>
                    <div className="text-gray-600 text-xs sm:text-sm">
                      Matric Number
                    </div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                      {candidate.matricNumber}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-conces-blue" />
                  <div>
                    <div className="text-gray-600 text-xs sm:text-sm">
                      Submission Date
                    </div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                      {new Date(project.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl">
                  <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-conces-blue" />
                  <div>
                    <div className="text-gray-600 text-xs sm:text-sm">
                      Email
                    </div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      {candidate.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl">
                  <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-conces-blue" />
                  <div>
                    <div className="text-gray-600 text-xs sm:text-sm">
                      Phone
                    </div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                      {candidate.phone}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl border border-green-200/60">
                <h3 className="font-bold text-conces-green mb-3 text-lg sm:text-xl flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                  Project Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-conces-green">
                      {project.vote || 0}
                    </div>
                    <div className="text-gray-600 text-sm">Total Votes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-conces-blue">
                      {project.primaryFileUrls?.length || 0}
                    </div>
                    <div className="text-gray-600 text-sm">Logo Files</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* OTP Modal */}
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
      </AnimatePresence>
    </div>
  );
}
