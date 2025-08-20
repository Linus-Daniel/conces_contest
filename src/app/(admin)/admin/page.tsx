"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  FileText,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw,
  Calendar,
  Eye,
  LucideIcon,
} from "lucide-react";

// Type definitions
interface StatsData {
  contestants: {
    total: number;
    qualified: number;
    disqualified: number;
    contestPackSent: number;
    contestPackPending: number;
  };
  projects: {
    total: number;
    byStatus: {
      draft: number;
      submitted: number;
      reviewed: number;
      selected: number;
      rejected: number;
    };
    totalVoted: number;
    totalSubmissions: number;
    averageVote: number;
    withMockup: number;
    withFeedback: number;
  };
  engagement: {
    submissionRate: string;
    qualificationRate: string;
    completionRate: string;
  };
  recentActivity: {
    newContestants: number;
    newSubmissions: number;
  };
  summary: {
    totalCandidates: number;
    totalSubmissions: number;
    totalVoted: number;
    qualified: number;
    disqualified: number;
  };
}

interface ApiResponse {
  message: string;
  data: StatsData;
  timestamp: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: string;
  color?: "blue" | "green" | "orange" | "red" | "purple" | "indigo";
}

interface ProgressBarProps {
  label: string;
  current: number;
  total: number;
  color?: "blue" | "green" | "orange" | "red" | "purple";
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  color = "blue",
}) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    red: "bg-red-50 border-red-200 text-red-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-800",
  };

  return (
    <div
      className={`p-6 rounded-lg border-2 ${colorClasses[color]} transition-all hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-70">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-sm opacity-60 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{trend}</span>
            </div>
          )}
        </div>
        <Icon className="w-8 h-8 opacity-60" />
      </div>
    </div>
  );
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  current,
  total,
  color = "blue",
}) => {
  const percentage = total > 0 ? ((current / total) * 100).toFixed(1) : "0";

  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">
          {current}/{total} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colorClasses[color]} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const AdminStatsDashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchStats = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch("/api/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      const data: ApiResponse = await response.json();
      setStats(data.data);
      setLastUpdated(data.timestamp);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-gray-800 font-medium">Error loading dashboard</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Contest Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor contest statistics and participant activity
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <div className="text-sm text-gray-500 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Updated: {new Date(lastUpdated).toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {stats && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <StatCard
                title="Total Candidates"
                value={stats.summary.totalCandidates}
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Total Submissions"
                value={stats.summary.totalSubmissions}
                icon={FileText}
                color="green"
              />
              <StatCard
                title="Projects Voted"
                value={stats.summary.totalVoted}
                icon={Award}
                color="purple"
              />
              <StatCard
                title="Qualified"
                value={stats.summary.qualified}
                icon={CheckCircle}
                color="green"
              />
              <StatCard
                title="Disqualified"
                value={stats.summary.disqualified}
                icon={XCircle}
                color="red"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Contestant Details */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Contestant Overview
                </h2>
                <div className="space-y-4">
                  <ProgressBar
                    label="Qualified Contestants"
                    current={stats.contestants.qualified}
                    total={stats.contestants.total}
                    color="green"
                  />
                  <ProgressBar
                    label="Contest Pack Sent"
                    current={stats.contestants.contestPackSent}
                    total={stats.contestants.total}
                    color="blue"
                  />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-800">
                        {stats.contestants.qualified}
                      </p>
                      <p className="text-sm text-green-600">Qualified</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-800">
                        {stats.contestants.disqualified}
                      </p>
                      <p className="text-sm text-red-600">Disqualified</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Status */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Project Status
                </h2>
                <div className="space-y-3">
                  {Object.entries(stats.projects.byStatus).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="flex justify-between items-center"
                      >
                        <span className="capitalize text-gray-700 font-medium">
                          {status}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-semibold">
                          {count}
                        </span>
                      </div>
                    )
                  )}
                </div>
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Average Vote Score:</span>
                    <span className="font-semibold">
                      {stats.projects.averageVote.toFixed(1)}/100
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Submission Rate"
                value={`${stats.engagement.submissionRate}%`}
                icon={TrendingUp}
                subtitle="Contestants who submitted"
                color="blue"
              />
              <StatCard
                title="Qualification Rate"
                value={`${stats.engagement.qualificationRate}%`}
                icon={CheckCircle}
                subtitle="Qualified contestants"
                color="green"
              />
              <StatCard
                title="Completion Rate"
                value={`${stats.engagement.completionRate}%`}
                icon={Award}
                subtitle="Projects completed"
                color="purple"
              />
            </div>

            {/* Additional Metrics & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Project Metrics
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Projects with Mockups:
                    </span>
                    <span className="font-semibold">
                      {stats.projects.withMockup}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Projects with Feedback:
                    </span>
                    <span className="font-semibold">
                      {stats.projects.withFeedback}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Voted Projects:</span>
                    <span className="font-semibold">
                      {stats.projects.totalVoted}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Score:</span>
                    <span className="font-semibold">
                      {stats.projects.averageVote.toFixed(1)}/100
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Recent Activity (7 days)
                </h2>
                <div className="space-y-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-800">
                      {stats.recentActivity.newContestants}
                    </p>
                    <p className="text-blue-600">New Contestants</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-800">
                      {stats.recentActivity.newSubmissions}
                    </p>
                    <p className="text-green-600">New Submissions</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminStatsDashboard;
