// src/components/ContestManagement.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  EyeIcon,
  PencilSquareIcon,
  NoSymbolIcon,
  CheckIcon,
  XMarkIcon,
  ChartBarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface Contest {
  id: string;
  title: string;
  category: string;
  description: string;
  submitter: {
    name: string;
    avatar: string;
  };
  submissionDate: string;
  status: "Active" | "Pending" | "Completed";
}

const contests: Contest[] = [
  {
    id: "1",
    title: "Summer Photo Contest",
    category: "Photography",
    description:
      "A photography contest celebrating summer moments. Submit your best summer photos and win exciting prizes.",
    submitter: {
      name: "David Rodriguez",
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
    },
    submissionDate: "May 15, 2023",
    status: "Active",
  },
  {
    id: "2",
    title: "Design Challenge 2023",
    category: "Graphic Design",
    description:
      "Create innovative designs for our brand. Winners will have their designs featured in our upcoming campaign.",
    submitter: {
      name: "Emma Wilson",
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
    },
    submissionDate: "June 2, 2023",
    status: "Pending",
  },
  {
    id: "3",
    title: "Essay Writing Competition",
    category: "Writing",
    description:
      'Write an essay on "The Future of Technology". Top essays will be published in our annual magazine.',
    submitter: {
      name: "Michael Chen",
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
    },
    submissionDate: "April 10, 2023",
    status: "Completed",
  },
];

export default function ContestManagement() {
  const [activeTab, setActiveTab] = useState("All Contests");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActionButtons = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <>
            <button className="text-sm text-yellow-600 hover:text-yellow-900 mr-3">
              <PencilSquareIcon className="w-4 h-4 inline mr-1" /> Edit
            </button>
            <button className="text-sm text-red-600 hover:text-red-900">
              <NoSymbolIcon className="w-4 h-4 inline mr-1" /> End
            </button>
          </>
        );
      case "Pending":
        return (
          <>
            <button className="text-sm text-green-600 hover:text-green-900 mr-3">
              <CheckIcon className="w-4 h-4 inline mr-1" /> Approve
            </button>
            <button className="text-sm text-red-600 hover:text-red-900">
              <XMarkIcon className="w-4 h-4 inline mr-1" /> Reject
            </button>
          </>
        );
      case "Completed":
        return (
          <>
            <button className="text-sm text-blue-600 hover:text-blue-900 mr-3">
              <ChartBarIcon className="w-4 h-4 inline mr-1" /> Results
            </button>
            <button className="text-sm text-green-600 hover:text-green-900">
              <ArrowPathIcon className="w-4 h-4 inline mr-1" /> Reopen
            </button>
          </>
        );
      default:
        return null;
    }
  };

  const tabs = ["All Contests", "Pending", "Active", "Completed"];

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contest Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and moderate contest submissions
        </p>
      </div>

      {/* Contest Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Contest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contests.map((contest) => (
          <div
            key={contest.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {contest.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {contest.category}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    contest.status
                  )}`}
                >
                  {contest.status}
                </span>
              </div>
            </div>

            <div className="px-4 py-3">
              <p className="text-sm text-gray-600 line-clamp-3">
                {contest.description}
              </p>
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm">
                <div>
                  <p className="text-gray-500">Submitted by:</p>
                  <div className="flex items-center mt-1">
                    <Image
                      src={contest.submitter.avatar}
                      alt="Submitter"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="ml-2 text-gray-900">
                      {contest.submitter.name}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-500">Submission Date:</p>
                  <p className="text-gray-900">{contest.submissionDate}</p>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-gray-200">
              <div className="flex justify-between">
                <button className="text-sm text-gray-600 hover:text-gray-900">
                  <EyeIcon className="w-4 h-4 inline mr-1" /> View
                </button>
                <div>{getActionButtons(contest.status)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
