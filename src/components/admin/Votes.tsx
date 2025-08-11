// src/components/VoteManagement.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

// Dynamically import Highcharts to avoid SSR issues
const Highcharts = dynamic(() => import("highcharts-react-official"), {
  ssr: false,
});

interface VoteData {
  contestant: string;
  contest: string;
  votes: number;
  lastVote: string;
  avatar: string;
  id: string;
}

const votesData: VoteData[] = [
  {
    id: "1",
    contestant: "Sarah Johnson",
    contest: "Summer Photo Contest",
    votes: 2451,
    lastVote: "2 minutes ago",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg",
  },
  {
    id: "2",
    contestant: "James Smith",
    contest: "Summer Photo Contest",
    votes: 1983,
    lastVote: "5 minutes ago",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg",
  },
  {
    id: "3",
    contestant: "David Rodriguez",
    contest: "Design Challenge 2023",
    votes: 1526,
    lastVote: "12 minutes ago",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
  },
];

const topContestants = [
  {
    name: "Sarah Johnson",
    votes: 2451,
    percentage: 85,
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg",
  },
  {
    name: "James Smith",
    votes: 1983,
    percentage: 70,
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg",
  },
  {
    name: "David Rodriguez",
    votes: 1526,
    percentage: 55,
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
  },
  {
    name: "Lisa Thompson",
    votes: 1245,
    percentage: 45,
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg",
  },
  {
    name: "Robert Davis",
    votes: 952,
    percentage: 35,
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg",
  },
];

const recentActivity = [
  {
    user: "User123",
    contestant: "Sarah Johnson",
    time: "2 minutes ago",
    type: "vote",
  },
  {
    user: "User456",
    contestant: "James Smith",
    time: "5 minutes ago",
    type: "vote",
  },
  {
    user: "User789",
    contestant: "Sarah Johnson",
    time: "12 minutes ago",
    type: "vote",
  },
  {
    user: "Admin",
    contestant: "David Rodriguez",
    time: "25 minutes ago",
    type: "adjustment",
  },
  {
    user: "User234",
    contestant: "Lisa Thompson",
    time: "35 minutes ago",
    type: "vote",
  },
];

export default function VoteManagement() {
  const [chartOptions, setChartOptions] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const options = {
        chart: {
          type: "pie",
          height: 250,
        },
        title: {
          text: "",
        },
        plotOptions: {
          pie: {
            innerSize: "50%",
            dataLabels: {
              enabled: false,
            },
          },
        },
        series: [
          {
            name: "Votes",
            data: [
              { name: "Sarah Johnson", y: 2451, color: "#0ea5e9" },
              { name: "James Smith", y: 1983, color: "#3b82f6" },
              { name: "David Rodriguez", y: 1526, color: "#8b5cf6" },
              { name: "Others", y: 8568, color: "#e5e7eb" },
            ],
          },
        ],
      };
      setChartOptions(options);
    }
  }, []);

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vote Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor and manage voting activity across all contests
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Vote Summary Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Vote Summary
          </h3>
          <div className="h-64">
            {chartOptions && (
              <Highcharts
                highcharts={require("highcharts")}
                options={chartOptions}
              />
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500">Total Votes</p>
              <p className="text-xl font-semibold text-gray-900">14,528</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500">Active Contests</p>
              <p className="text-xl font-semibold text-gray-900">7</p>
            </div>
          </div>
        </div>

        {/* Top Contestants Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Top Contestants
            </h3>
            <select className="text-sm border-gray-300 rounded-md">
              <option>All Contests</option>
              <option>Summer Photo Contest</option>
              <option>Design Challenge 2023</option>
            </select>
          </div>
          <div className="space-y-4">
            {topContestants.map((contestant, index) => (
              <div key={index} className="flex items-center">
                <Image
                  src={contestant.avatar}
                  alt={contestant.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {contestant.name}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {contestant.votes.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full"
                      style={{ width: `${contestant.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Voting Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex">
                <div className="flex-shrink-0">
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-full ${
                      activity.type === "vote"
                        ? "bg-primary-100 text-primary-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {activity.type === "vote" ? (
                      <CheckBadgeIcon className="w-4 h-4" />
                    ) : (
                      <PencilSquareIcon className="w-4 h-4" />
                    )}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span>{" "}
                    {activity.type === "vote"
                      ? "voted for"
                      : "adjusted votes for"}{" "}
                    <span className="font-medium">{activity.contestant}</span>
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vote Management Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search contestants or voters..."
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            <div className="flex gap-3">
              <select className="pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                <option>All Contests</option>
                <option>Summer Photo Contest</option>
                <option>Design Challenge 2023</option>
              </select>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                <PencilSquareIcon className="w-4 h-4 mr-2" />
                Adjust Votes
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contestant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Votes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Vote
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {votesData.map((vote) => (
                <tr key={vote.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Image
                          className="h-10 w-10 rounded-full"
                          src={vote.avatar}
                          alt={vote.contestant}
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {vote.contestant}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: #{vote.id}5781
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{vote.contest}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {vote.votes.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vote.lastVote}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900">
                      Adjust
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 ml-3">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
