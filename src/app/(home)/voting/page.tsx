"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  HeartIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  EyeIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import toast, { Toaster } from "react-hot-toast";
import OTPVotingModal from "@/components/OtpVotingModal";
import api from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";

interface Project {
  _id: string;
  candidate: {
    fullName: string;
    schoolName: string;
    department: string;
    avatar:string;
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

interface VoteData {
  projectId: string;
  voterEmail: string;
  voterPhone: string;
}

export default function VotingPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedProjects, setVotedProjects] = useState<Set<string>>(new Set());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"votes" | "newest" | "title">("votes");
  const [filterSchool, setFilterSchool] = useState<string>("all");
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [currentProjectToVote, setCurrentProjectToVote] = useState<
    string | null
  >(null);
  const [voterInfo, setVoterInfo] = useState({ email: "", phone: "" });
  const [isVoting, setIsVoting] = useState(false);

  const [showOTPModal, setShowOTPModal] = useState(true);
  const [selectedProjectToVote, setSelectedProjectToVote] =
    useState<Project | null>(null);

  // Handle vote button click
  const handleVoteClick = (project: Project) => {
    setSelectedProjectToVote(project);
    setShowOTPModal(true);
  };

  // Handle vote success
  const handleVoteSuccess = (projectId: string, newVoteCount: number) => {
    // Update voted projects
    const newVoted = new Set(votedProjects);
    newVoted.add(projectId);
    setVotedProjects(newVoted);
    localStorage.setItem("votedProjects", JSON.stringify(Array.from(newVoted)));

    // Update project votes in state
    setProjects((prev) =>
      prev.map((p) => (p._id === projectId ? { ...p, vote: newVoteCount } : p))
    );

    // Close modal
    setShowOTPModal(false);
    setSelectedProjectToVote(null);
  };

  // Load voted projects from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("votedProjects");
    if (stored) {
      setVotedProjects(new Set(JSON.parse(stored)));
    }
    fetchProjects();
  }, []);

  // Fetch projects
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

  // Filter and sort projects
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
            .includes(searchTerm.toLowerCase())
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

  // Handle voting
  const handleVote = async () => {
    if (!currentProjectToVote) return;

    setIsVoting(true);
    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: currentProjectToVote,
          voterEmail: voterInfo.email,
          voterPhone: voterInfo.phone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        const newVoted = new Set(votedProjects);
        newVoted.add(currentProjectToVote);
        setVotedProjects(newVoted);
        localStorage.setItem(
          "votedProjects",
          JSON.stringify(Array.from(newVoted))
        );

        // Update project votes
        setProjects((prev) =>
          prev.map((p) =>
            p._id === currentProjectToVote
              ? { ...p, vote: (p.vote || 0) + 1 }
              : p
          )
        );

        toast.success("Vote submitted successfully!");
        setShowVoteModal(false);
        setVoterInfo({ email: "", phone: "" });
      } else {
        toast.error(data.error || "Failed to submit vote");
      }
    } catch (error) {
      toast.error("An error occurred while voting");
    } finally {
      setIsVoting(false);
    }
  };

  // Get unique schools for filter
  const schools = Array.from(
    new Set(projects.map((p) => p.candidate.schoolName))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Toaster position="top-center" />

      {/* Header */}
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
            <p className="text-xl text-white/90">
              Help choose the new face of CONCES
            </p>
            <div className="mt-6 flex justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-conces-gold">
                  {projects.length}
                </div>
                <div className="text-sm text-white/80">Total Designs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-conces-gold">
                  {projects.reduce((sum, p) => sum + (p.vote || 0), 0)}
                </div>
                <div className="text-sm text-white/80">Total Votes</div>
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

      {/* Filters and Search */}
      <div className="sticky top-0 z-40 bg-white shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, designer, or school..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-conces-green"
                />
              </div>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-conces-green"
            >
              <option value="votes">Most Votes</option>
              <option value="newest">Newest First</option>
              <option value="title">Title A-Z</option>
            </select>

            {/* Filter by School */}
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

      {/* Projects Grid */}
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
                isVoted={votedProjects.has(project._id)}
                onVote={() => {
                  setCurrentProjectToVote(project._id);
                  setShowVoteModal(true);
                }}
                onView={() => setSelectedProject(project)}
              />
            ))}
          </motion.div>
        )}
      </div>

      {showOTPModal && selectedProjectToVote && (
        <OTPVotingModal
          projectId={selectedProjectToVote._id}
          projectTitle={selectedProjectToVote.projectTitle}
          onClose={() => {
            setShowOTPModal(false);
            setSelectedProjectToVote(null);
          }}
          onSuccess={(newVoteCount) =>
            handleVoteSuccess(selectedProjectToVote._id, newVoteCount)
          }
        />
      )}

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            isVoted={votedProjects.has(selectedProject._id)}
            onClose={() => setSelectedProject(null)}
            onVote={() => {
              setCurrentProjectToVote(selectedProject._id);
              setShowVoteModal(true);
              setSelectedProject(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Vote Modal */}
      <AnimatePresence>
        {showVoteModal && (
          <VoteModal
            onClose={() => {
              setShowVoteModal(false);
              setCurrentProjectToVote(null);
              setVoterInfo({ email: "", phone: "" });
            }}
            voterInfo={voterInfo}
            setVoterInfo={setVoterInfo}
            onSubmit={handleVote}
            isSubmitting={isVoting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectCard({
  project,
  index,
  isVoted,
  onVote,
  onView,
}: {
  project: Project;
  index: number;
  isVoted: boolean;
  onVote: () => void;
  onView: () => void;
}) {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden group"
    >
      {/* Image */}
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

        {/* Overlay on hover */}
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

        {/* Vote badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
          <ArrowUpIcon className="w-4 h-4 text-conces-green" />
          <span className="font-semibold text-sm">{project.vote || 0}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-conces-blue mb-1 line-clamp-1">
          {project.projectTitle}
        </h3>
        <div className="flex items-center justify-between ">
          <div>

          <p className="text-sm text-gray-600 mb-1">
            by {project.candidate.fullName}
          </p>
          <p className="text-xs text-gray-500 mb-3">
            {project.candidate.schoolName}
          </p>
          </div>
          <Image src={project.candidate?.avatar} width={500} height={500} className="w-12 h-12 rounded-full" alt="candidate image" />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onVote}
            disabled={isVoted}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              isVoted
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-conces-green text-white hover:bg-conces-green/90"
            }`}
          >
            {isVoted ? (
              <>
                <HeartSolidIcon className="w-5 h-5" />
                Voted
              </>
            ) : (
              <>
                <HeartIcon className="w-5 h-5" />
                Vote
              </>
            )}
          </button>
          <button
            onClick={() => {
              navigator
                .share({
                  title: project.projectTitle,
                  text: `Check out this design for the CONCES logo rebrand challenge!`,
                  url: window.location.href,
                })
                .catch(() => {
                  // Copy link fallback
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied to clipboard!");
                });
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShareIcon className="w-5 h-5" />
          </button>
        </div>
        
      </div>
    </motion.div>
  );
}

// Project Detail Modal
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
          {/* Image Section */}
          <div className="md:w-1/2 bg-gray-100 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Image Carousel */}
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

                  {/* Image indicators */}
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

          {/* Content Section */}
          <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto">
            <div className="space-y-6">
              {/* Header */}
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

              {/* Design Concept */}
              <div>
                <h3 className="font-semibold text-conces-blue mb-2">
                  Design Concept
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {project.designConcept}
                </p>
              </div>

              {/* Color Palette */}
              <div>
                <h3 className="font-semibold text-conces-blue mb-2">
                  Color Palette
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {project.colorPalette}
                </p>
              </div>

              {/* Inspiration */}
              <div>
                <h3 className="font-semibold text-conces-blue mb-2">
                  Inspiration
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {project.inspiration}
                </p>
              </div>

              {/* Actions */}
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
                      <HeartIcon className="w-5 h-5" />
                      Vote for this Design
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    navigator
                      .share({
                        title: project.projectTitle,
                        text: `Check out this design by ${project.candidate.fullName} for the CONCES logo rebrand challenge!`,
                        url: window.location.href,
                      })
                      .catch(() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("Link copied!");
                      });
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

// Vote Modal
function VoteModal({
  onClose,
  voterInfo,
  setVoterInfo,
  onSubmit,
  isSubmitting,
}: {
  onClose: () => void;
  voterInfo: { email: string; phone: string };
  setVoterInfo: (info: { email: string; phone: string }) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!voterInfo.email || !voterInfo.phone) {
      toast.error("Please fill in all fields");
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(voterInfo.email)) {
      toast.error("Please enter a valid email");
      return;
    }

    const phoneRegex = /^(\+234|0)[789]\d{9}$/;
    if (!phoneRegex.test(voterInfo.phone)) {
      toast.error("Please enter a valid Nigerian phone number");
      return;
    }

    onSubmit();
  };

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
        className="bg-white rounded-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-conces-blue mb-2">
          Cast Your Vote
        </h2>
        <p className="text-gray-600 mb-6">
          Please provide your details to vote. One vote per person.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={voterInfo.email}
              onChange={(e) =>
                setVoterInfo({ ...voterInfo, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-conces-green"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={voterInfo.phone}
              onChange={(e) =>
                setVoterInfo({ ...voterInfo, phone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-conces-green"
              placeholder="080XXXXXXXX"
              required
            />
          </div>

          <div className="bg-conces-blue/5 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> Your vote is anonymous and will be counted
              only once. We collect contact information solely to prevent
              duplicate voting.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-conces-green text-white hover:bg-conces-green/90"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Vote"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
