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
  Palette,
  Lightbulb,
  Target,
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
  institution: string;
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

// PDF Viewer Component
function PDFViewer({ url, title }: { url: string; title: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 rounded-lg overflow-hidden border">
      <div className="flex items-center justify-between p-3 bg-gray-100 border-b">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-red-500" />
          <span className="text-sm font-medium text-gray-700 truncate">
            {title}
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
            title={title}
          />
        )}
      </div>
    </div>
  );
}

// Media Renderer Component
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
      />
    </div>
  );
}

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [votedProjects, setVotedProjects] = useState<Set<string>>(new Set());
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"project" | "about">("project");

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
      const response = await api.get(`/projects/${candidateId}`);
      console.log(response.data);

      setProject(response.data.project);
      setCandidate(response.data.project.candidate);
    } catch (error) {
      toast.error("Failed to load candidate data");
      console.error("Error fetching candidate data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteClick = () => {
    if (!project) return;
    setShowOTPModal(true);
  };

  const handleVoteSuccess = (newVoteCount: number) => {
    if (!project) return;

    const newVoted = new Set(votedProjects);
    newVoted.add(project._id);
    setVotedProjects(newVoted);
    localStorage.setItem("votedProjects", JSON.stringify([...newVoted]));

    setProject((prev) => (prev ? { ...prev, vote: newVoteCount } : null));
    setShowOTPModal(false);
    toast.success("Vote confirmed successfully! 🎉");
  };

  const totalVotes = project?.vote || 0;
  const isVoted = project ? votedProjects.has(project._id) : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-conces-green"></div>
      </div>
    );
  }

  if (!project || !candidate) {
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

  const allMedia = [
    ...(project.primaryFileUrls || []),
    ...(project.mockupUrls || []),
  ].filter(Boolean);

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
                    <div className="text-white/80 text-sm">Institution</div>
                    <div className="font-semibold text-white">
                      {candidate.institution}
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
                    <div className="text-white/80 text-sm">Matric Number</div>
                    <div className="font-semibold text-white">
                      {candidate.matricNumber}
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
              onClick={() => setActiveTab("project")}
              className={`py-4 px-1 border-b-2 font-semibold text-lg transition-all duration-200 ${
                activeTab === "project"
                  ? "border-conces-blue text-conces-blue"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Target className="w-5 h-5 inline mr-2" />
              Project Details
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
        {activeTab === "project" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Project Header */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200/60 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    {project.projectTitle}
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-conces-green/10 text-conces-green px-4 py-2 rounded-full">
                      <Award className="w-5 h-5" />
                      <span className="font-semibold">{project.status}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-5 h-5" />
                      <span>
                        Submitted:{" "}
                        {new Date(project.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <motion.button
                  onClick={handleVoteClick}
                  disabled={isVoted}
                  whileHover={!isVoted ? { scale: 1.05 } : {}}
                  whileTap={!isVoted ? { scale: 0.95 } : {}}
                  className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center gap-3 shadow-lg ${
                    isVoted
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                      : "bg-gradient-to-r from-conces-green to-emerald-600 text-white hover:shadow-xl border border-transparent"
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

            {/* Project Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Design Concept */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200/60 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Lightbulb className="w-8 h-8 text-conces-blue" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      Design Concept
                    </h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {project.designConcept}
                    </p>
                  </div>
                </div>

                {/* Color Palette */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200/60 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Palette className="w-8 h-8 text-conces-blue" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      Color Palette
                    </h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {project.colorPalette}
                    </p>
                  </div>
                </div>

                {/* Inspiration */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200/60 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Target className="w-8 h-8 text-conces-blue" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      Inspiration
                    </h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {project.inspiration}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Vote Stats */}
                <div className="bg-gradient-to-br from-conces-blue to-blue-600 text-white rounded-3xl p-8 shadow-lg">
                  <div className="text-center">
                    <HeartIcon className="w-12 h-12 mx-auto mb-4 text-conces-gold" />
                    <div className="text-5xl font-bold mb-2">{totalVotes}</div>
                    <div className="text-xl font-semibold opacity-90">
                      Total Votes
                    </div>
                    <div className="mt-4 text-sm opacity-80">
                      {isVoted
                        ? "You've voted for this project"
                        : "Cast your vote now!"}
                    </div>
                  </div>
                </div>

                {/* Project Files */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200/60 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Project Files
                  </h3>
                  <div className="space-y-3">
                    {allMedia.map((file, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedMedia(file)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-conces-blue hover:bg-blue-50 transition-colors"
                      >
                        <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {file.split("/").pop()}
                        </span>
                        <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project Status */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200/60 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Project Status
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          project.status === "selected"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Submitted</span>
                      <span className="text-gray-900 font-medium">
                        {new Date(project.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="text-gray-900 font-medium">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
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
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200/60 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Candidate Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <School className="w-8 h-8 text-conces-blue" />
                  <div>
                    <div className="text-gray-600 text-sm">Institution</div>
                    <div className="font-semibold text-gray-900">
                      {candidate.institution}
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
                    <div className="text-gray-600 text-sm">Matric Number</div>
                    <div className="font-semibold text-gray-900">
                      {candidate.matricNumber}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <Award className="w-8 h-8 text-conces-blue" />
                  <div>
                    <div className="text-gray-600 text-sm">
                      Qualification Status
                    </div>
                    <div className="font-semibold text-gray-900">
                      {candidate.isQualified ? "Qualified" : "Not Qualified"}
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
                    <div className="text-3xl font-bold text-conces-blue">1</div>
                    <div className="text-gray-600">Project Submitted</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Media Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedMedia.split("/").pop()}
                </h3>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <div className="h-[calc(90vh-80px)]">
                <MediaRenderer
                  url={selectedMedia}
                  alt="Project Media"
                  className="w-full h-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OTP Modal */}
      {showOTPModal && project && (
        <OTPVotingModal
          projectId={project._id}
          projectTitle={project.projectTitle}
          candidateName={candidate.fullName}
          onClose={() => setShowOTPModal(false)}
          onSuccess={handleVoteSuccess}
        />
      )}
    </div>
  );
}
