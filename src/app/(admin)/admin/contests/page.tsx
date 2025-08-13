// src/app/contests/[id]/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeftIcon,
  CalendarIcon,
  TrophyIcon,
  UserGroupIcon,
  EyeIcon,
  DocumentArrowUpIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

interface ContestDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "upcoming" | "active" | "completed";
  startDate: string;
  endDate: string;
  prize: string;
  participants: number;
  submissions: number;
  views: number;
  organizer: {
    name: string;
    avatar: string;
    company: string;
  };
  requirements: string[];
  guidelines: string[];
  judingCriteria: string[];
}

const contestDetails: ContestDetails = {
  id: "1",
  title: "Brand Identity Challenge 2024",
  description:
    "Design a modern and memorable logo for our innovative tech startup. We are looking for creative designs that represent innovation, growth, and trustworthiness. The logo should work well in both digital and print formats and be scalable across various applications.",
  category: "Logo Design",
  status: "active",
  startDate: "2024-01-01",
  endDate: "2024-02-15",
  prize: "$5,000 + Design Contract",
  participants: 156,
  submissions: 89,
  views: 2847,
  organizer: {
    name: "TechVision Inc.",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
    company: "Technology Startup",
  },
  requirements: [
    "Original design only - no stock images or pre-made templates",
    "Must include both icon and text versions",
    "Provide files in SVG, PNG, and AI formats",
    "Include color and monochrome versions",
    "Minimum resolution: 300 DPI for print files",
  ],
  guidelines: [
    "Logo should be simple, memorable, and scalable",
    "Avoid overly complex designs or too many colors",
    "Consider how the logo will look on different backgrounds",
    "Think about the company values: innovation, trust, growth",
    "Logo should work well in digital and print media",
  ],
  judingCriteria: [
    "Creativity and originality (30%)",
    "Relevance to brand values (25%)",
    "Technical execution (20%)",
    "Scalability and versatility (15%)",
    "Overall visual impact (10%)",
  ],
};

export default function ContestDetails() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "submissions" | "rules"
  >("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDaysRemaining = () => {
    const endDate = new Date(contestDetails.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/contests" className="mr-4">
              <ArrowLeftIcon className="w-5 h-5 text-gray-600 hover:text-gray-900" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {contestDetails.title}
                  </h1>
                  <div className="flex items-center mt-1 space-x-4">
                    <span
                      className={`px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                        contestDetails.status
                      )}`}
                    >
                      {contestDetails.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {contestDetails.category}
                    </span>
                    {contestDetails.status === "active" && (
                      <span className="text-sm text-orange-600 font-medium">
                        {getDaysRemaining()} days remaining
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    <ShareIcon className="w-4 h-4 mr-2" />
                    Share
                  </button>
                  <Link
                    href={`/contests/${contestDetails.id}/submissions`}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    <EyeIcon className="w-4 h-4 mr-2" />
                    View Submissions
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "submissions", label: "Submissions" },
                  { id: "rules", label: "Rules & Guidelines" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as "overview" | "submissions" | "rules")}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    About This Contest
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {contestDetails.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Recent Submissions
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="bg-white rounded-lg border border-gray-200 p-3"
                      >
                        <div className="aspect-square bg-gray-100 rounded-md mb-2 relative">
                          <Image
                            src={`https://images.unsplash.com/photo-161122492385${i}?w=200&h=200&fit=crop`}
                            alt={`Submission ${i}`}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Design #{i}
                        </p>
                        <p className="text-xs text-gray-500">By Designer {i}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/admin/contests/${contestDetails.id}/submissions`}
                      className="text-primary-600 hover:text-primary-900 font-medium"
                    >
                      View all submissions →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "submissions" && (
              <div className="text-center py-12">
                <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  View All Submissions
                </h3>
                <p className="text-gray-500 mb-4">
                  See all {contestDetails.submissions} submissions from talented
                  designers
                </p>
                <Link
                  href={`/contests/${contestDetails.id}/submissions`}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  View Submissions
                </Link>
              </div>
            )}

            {activeTab === "rules" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Requirements
                  </h3>
                  <ul className="space-y-2">
                    {contestDetails.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-600">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Design Guidelines
                  </h3>
                  <ul className="space-y-2">
                    {contestDetails.guidelines.map((guideline, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-600">{guideline}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Judging Criteria
                  </h3>
                  <ul className="space-y-2">
                    {contestDetails.judingCriteria.map((criteria, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-600">{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contest Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contest Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrophyIcon className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-600">Prize</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {contestDetails.prize}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserGroupIcon className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-600">Participants</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {contestDetails.participants}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DocumentArrowUpIcon className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600">Submissions</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {contestDetails.submissions}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <EyeIcon className="w-5 h-5 text-purple-500 mr-2" />
                    <span className="text-sm text-gray-600">Views</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {contestDetails.views.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Start Date
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(contestDetails.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      End Date
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(contestDetails.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Organizer */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Organizer
              </h3>
              <div className="flex items-center">
                <Image
                  src={contestDetails.organizer.avatar}
                  alt={contestDetails.organizer.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">
                    {contestDetails.organizer.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {contestDetails.organizer.company}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            {contestDetails.status === "active" && (
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Ready to Submit?</h3>
                <p className="text-primary-100 text-sm mb-4">
                  Join {contestDetails.participants} other designers competing
                  for the prize.
                </p>
                <button className="w-full bg-white text-primary-600 py-2 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors">
                  Submit Your Design
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
