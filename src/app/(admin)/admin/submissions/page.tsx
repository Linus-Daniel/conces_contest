"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  HeartIcon,
  ChatBubbleLeftEllipsisIcon,
  EyeIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CloudArrowDownIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

interface LogoSubmission {
  id: string;
  title: string;
  description: string;
  designer: {
    name: string;
    avatar: string;
    level: "Beginner" | "Intermediate" | "Expert";
    rating: number;
  };
  images: {
    thumbnail: string;
    full: string;
    variations?: string[];
  };
  submissionDate: string;
  votes: number;
  comments: number;
  views: number;
  tags: string[];
  status: "pending" | "approved" | "rejected";
  liked: boolean;
  fileFormat: string;
  fileSize: string;
}

const logoSubmissions: LogoSubmission[] = [
  {
    id: "1",
    title: "Modern Tech Logo",
    description:
      "A sleek and modern logo design featuring geometric shapes that represent innovation and technology. The design uses a vibrant gradient that symbolizes growth and progress.",
    designer: {
      name: "Sarah Johnson",
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg",
      level: "Expert",
      rating: 4.8,
    },
    images: {
      thumbnail:
        "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
      full: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop",
      variations: [
        "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=300&fit=crop",
      ],
    },
    submissionDate: "2024-01-15",
    votes: 245,
    comments: 18,
    views: 1420,
    tags: ["modern", "tech", "gradient", "minimal"],
    status: "approved",
    liked: true,
    fileFormat: "SVG, PNG",
    fileSize: "2.4 MB",
  },
  {
    id: "2",
    title: "Organic Brand Identity",
    description:
      "Nature-inspired logo design with organic curves and earth tones. Perfect for eco-friendly brands and sustainable businesses.",
    designer: {
      name: "Michael Chen",
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
      level: "Intermediate",
      rating: 4.5,
    },
    images: {
      thumbnail:
        "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=300&fit=crop",
      full: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=600&fit=crop",
      variations: [
        "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
      ],
    },
    submissionDate: "2024-01-14",
    votes: 187,
    comments: 12,
    views: 980,
    tags: ["organic", "nature", "eco", "curves"],
    status: "pending",
    liked: false,
    fileFormat: "AI, SVG",
    fileSize: "3.1 MB",
  },
  {
    id: "3",
    title: "Bold Typography Logo",
    description:
      "Strong typographic approach with custom lettering. The design focuses on readability while maintaining a unique character.",
    designer: {
      name: "Emma Wilson",
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
      level: "Expert",
      rating: 4.9,
    },
    images: {
      thumbnail:
        "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400&h=300&fit=crop",
      full: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&h=600&fit=crop",
    },
    submissionDate: "2024-01-13",
    votes: 156,
    comments: 8,
    views: 745,
    tags: ["typography", "bold", "custom", "clean"],
    status: "approved",
    liked: true,
    fileFormat: "SVG, EPS",
    fileSize: "1.8 MB",
  },
  {
    id: "4",
    title: "Minimalist Symbol",
    description:
      "Clean and minimal logo design focusing on simplicity and elegance. Uses negative space creatively to create memorable visual impact.",
    designer: {
      name: "David Rodriguez",
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
      level: "Intermediate",
      rating: 4.3,
    },
    images: {
      thumbnail:
        "https://images.unsplash.com/photo-1626785774625-0b1c2c4eab67?w=400&h=300&fit=crop",
      full: "https://images.unsplash.com/photo-1626785774625-0b1c2c4eab67?w=800&h=600&fit=crop",
    },
    submissionDate: "2024-01-12",
    votes: 203,
    comments: 15,
    views: 1120,
    tags: ["minimal", "clean", "symbol", "negative-space"],
    status: "rejected",
    liked: false,
    fileFormat: "SVG, PNG",
    fileSize: "900 KB",
  },
  {
    id: "5",
    title: "Vintage Inspired Design",
    description:
      "Retro-style logo with vintage typography and classic design elements. Perfect for brands looking for timeless appeal.",
    designer: {
      name: "Lisa Thompson",
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg",
      level: "Beginner",
      rating: 4.1,
    },
    images: {
      thumbnail:
        "https://images.unsplash.com/photo-1609126236404-55b15f1e5f6d?w=400&h=300&fit=crop",
      full: "https://images.unsplash.com/photo-1609126236404-55b15f1e5f6d?w=800&h=600&fit=crop",
    },
    submissionDate: "2024-01-11",
    votes: 134,
    comments: 6,
    views: 592,
    tags: ["vintage", "retro", "classic", "typography"],
    status: "pending",
    liked: false,
    fileFormat: "AI, PNG",
    fileSize: "4.2 MB",
  },
  {
    id: "6",
    title: "Abstract Geometric",
    description:
      "Contemporary abstract design using geometric patterns and vibrant colors. Represents creativity and innovation.",
    designer: {
      name: "James Smith",
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg",
      level: "Expert",
      rating: 4.7,
    },
    images: {
      thumbnail:
        "https://images.unsplash.com/photo-1614848637653-884830043a72?w=400&h=300&fit=crop",
      full: "https://images.unsplash.com/photo-1614848637653-884830043a72?w=800&h=600&fit=crop",
    },
    submissionDate: "2024-01-10",
    votes: 289,
    comments: 22,
    views: 1650,
    tags: ["abstract", "geometric", "colorful", "modern"],
    status: "approved",
    liked: true,
    fileFormat: "SVG, AI",
    fileSize: "2.8 MB",
  },
];

export default function LogoContestSubmissions() {
  const [selectedSubmission, setSelectedSubmission] =
    useState<LogoSubmission | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"votes" | "date" | "views">("votes");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleLike = (submissionId: string) => {
    setFavorites((prev) =>
      prev.includes(submissionId)
        ? prev.filter((id) => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case "pending":
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Expert":
        return "bg-purple-100 text-purple-800";
      case "Intermediate":
        return "bg-blue-100 text-blue-800";
      case "Beginner":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredSubmissions = logoSubmissions
    .filter((submission) => {
      if (filterStatus !== "all" && submission.status !== filterStatus)
        return false;
      if (
        searchTerm &&
        !submission.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !submission.designer.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "votes":
          return b.votes - a.votes;
        case "views":
          return b.views - a.views;
        case "date":
          return (
            new Date(b.submissionDate).getTime() -
            new Date(a.submissionDate).getTime()
          );
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
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
                  Logo Design Contest
                </h1>
                <p className="text-sm text-gray-500">
                  Brand Identity Challenge 2024
                </p>
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
                      ? "bg-primary-100 text-primary-700 border-primary-300"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  } rounded-l-md`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 text-sm font-medium border-t border-b border-r ${
                    viewMode === "list"
                      ? "bg-primary-100 text-primary-700 border-primary-300"
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
                placeholder="Search submissions or designers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as "all" | "pending" | "approved" | "rejected")}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="votes">Sort by Votes</option>
                <option value="date">Sort by Date</option>
                <option value="views">Sort by Views</option>
              </select>

              <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <FunnelIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => setSelectedSubmission(submission)}
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={submission.images.thumbnail}
                    alt={submission.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {getStatusIcon(submission.status)}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(submission.id);
                      }}
                      className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
                    >
                      {favorites.includes(submission.id) ? (
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
                    {submission.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {submission.description}
                  </p>

                  {/* Designer Info */}
                  <div className="flex items-center mb-3">
                    <Image
                      src={submission.designer.avatar}
                      alt={submission.designer.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <div className="ml-2 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {submission.designer.name}
                      </p>
                      <div className="flex items-center">
                        <span
                          className={`text-xs px-1 py-0.5 rounded ${getLevelColor(
                            submission.designer.level
                          )}`}
                        >
                          {submission.designer.level}
                        </span>
                        <div className="flex items-center ml-2">
                          <StarIcon className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-500 ml-1">
                            {submission.designer.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <HeartIcon className="w-4 h-4 mr-1" />
                        {submission.votes}
                      </div>
                      <div className="flex items-center">
                        <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mr-1" />
                        {submission.comments}
                      </div>
                      <div className="flex items-center">
                        <EyeIcon className="w-4 h-4 mr-1" />
                        {submission.views}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {submission.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {submission.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        +{submission.tags.length - 3}
                      </span>
                    )}
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
                  key={submission.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Image */}
                    <div className="relative w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={submission.images.thumbnail}
                        alt={submission.title}
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
                              {submission.title}
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
                            {submission.description}
                          </p>

                          {/* Designer Info */}
                          <div className="flex items-center mb-2">
                            <Image
                              src={submission.designer.avatar}
                              alt={submission.designer.name}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {submission.designer.name}
                            </span>
                            <span
                              className={`ml-2 text-xs px-2 py-1 rounded ${getLevelColor(
                                submission.designer.level
                              )}`}
                            >
                              {submission.designer.level}
                            </span>
                            <div className="flex items-center ml-2">
                              <StarIcon className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-500 ml-1">
                                {submission.designer.rating}
                              </span>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {submission.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(submission.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500"
                          >
                            {favorites.includes(submission.id) ? (
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
                          <div className="flex items-center">
                            <HeartIcon className="w-4 h-4 mr-1" />
                            {submission.votes} votes
                          </div>
                          <div className="flex items-center">
                            <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mr-1" />
                            {submission.comments} comments
                          </div>
                          <div className="flex items-center">
                            <EyeIcon className="w-4 h-4 mr-1" />
                            {submission.views} views
                          </div>
                          <div>
                            {submission.fileFormat} • {submission.fileSize}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(
                            submission.submissionDate
                          ).toLocaleDateString()}
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
                    {selectedSubmission.title}
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
                      src={selectedSubmission.images.full}
                      alt={selectedSubmission.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Variations */}
                  {selectedSubmission.images.variations && (
                    <div className="grid grid-cols-2 gap-2">
                      {selectedSubmission.images.variations.map(
                        (variation, index) => (
                          <div
                            key={index}
                            className="relative h-20 bg-gray-100 rounded overflow-hidden"
                          >
                            <Image
                              src={variation}
                              alt={`Variation ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div>
                  {/* Designer Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <Image
                        src={selectedSubmission.designer.avatar}
                        alt={selectedSubmission.designer.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="ml-3">
                        <p className="font-semibold text-gray-900">
                          {selectedSubmission.designer.name}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${getLevelColor(
                              selectedSubmission.designer.level
                            )}`}
                          >
                            {selectedSubmission.designer.level}
                          </span>
                          <div className="flex items-center">
                            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">
                              {selectedSubmission.designer.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-600">
                      {selectedSubmission.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedSubmission.votes}
                      </div>
                      <div className="text-sm text-gray-500">Votes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedSubmission.comments}
                      </div>
                      <div className="text-sm text-gray-500">Comments</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedSubmission.views}
                      </div>
                      <div className="text-sm text-gray-500">Views</div>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      File Information
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Format:</span>
                        <span className="text-gray-900">
                          {selectedSubmission.fileFormat}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span className="text-gray-900">
                          {selectedSubmission.fileSize}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Submitted:</span>
                        <span className="text-gray-900">
                          {new Date(
                            selectedSubmission.submissionDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubmission.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleLike(selectedSubmission.id)}
                      className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                        favorites.includes(selectedSubmission.id)
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {favorites.includes(selectedSubmission.id) ? (
                        <HeartIconSolid className="w-4 h-4 mr-2" />
                      ) : (
                        <HeartIcon className="w-4 h-4 mr-2" />
                      )}
                      {favorites.includes(selectedSubmission.id)
                        ? "Liked"
                        : "Like"}
                    </button>
                    <button className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                      <CloudArrowDownIcon className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>

                  {/* Admin Actions (if admin) */}
                  {selectedSubmission.status === "pending" && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Admin Actions
                      </h3>
                      <div className="flex space-x-3">
                        <button className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          Approve
                        </button>
                        <button className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                          <XCircleIcon className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
