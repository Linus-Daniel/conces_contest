"use client";

import React, { useState, useEffect } from "react";

interface UserStats {
  totalUsers: number;
  qualifiedUsers: number;
  unqualifiedUsers: number;
  welcomeEmailsSent: number;
  welcomeEmailsPending: number;
  lastCallEmailsSent: number;
  lastCallEmailsPending: number;
  welcomeEmailProgress: {
    sent: number;
    pending: number;
    percentage: number;
  };
  lastCallEmailProgress: {
    sent: number;
    pending: number;
    percentage: number;
  };
}

interface BulkEmailResult {
  success: boolean;
  message: string;
  summary: {
    totalUsers: number;
    sent: number;
    failed: number;
    skipped: number;
    updatedInDatabase?: number;
  };
  details: {
    errors: Array<{ email: string; error: string; userId: string }>;
    updatedUserIds?: string[];
  };
}

export default function BulkEmailDashboard() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [lastResult, setLastResult] = useState<BulkEmailResult | null>(null);

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      const response = await fetch("/api/users/emails/stats");
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      } else {
        setResult(`❌ Failed to fetch stats: ${data.error}`);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setResult(`❌ Error fetching stats: ${error}`);
    }
  };

  // Load stats on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Send welcome emails to all users
  const sendWelcomeEmails = async () => {
    setIsLoading(true);
    setResult("🚀 Starting bulk welcome email send...");
    setLastResult(null);

    try {
      const response = await fetch("/api/users/emails/welcome-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchSize: 10,
          delayBetweenBatches: 2000,
          onlyQualified: true,
          updateDatabase: true,
        }),
      });

      const data: BulkEmailResult = await response.json();
      setLastResult(data);

      if (data.success) {
        setResult(`✅ Welcome emails sent successfully! 
          📧 Sent: ${data.summary.sent} 
          ❌ Failed: ${data.summary.failed}
          📝 Database updated: ${data.summary.updatedInDatabase || 0} users`);
      } else {
        setResult(`⚠️ Partial success: 
          📧 Sent: ${data.summary.sent} 
          ❌ Failed: ${data.summary.failed}
          📝 Database updated: ${data.summary.updatedInDatabase || 0} users`);
      }

      // Refresh stats after sending
      await fetchStats();
    } catch (error) {
      console.error("Error sending welcome emails:", error);
      setResult(`❌ Error sending welcome emails: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Send motivational emails to all users
  const sendMotivationalEmails = async () => {
    setIsLoading(true);
    setResult("🚀 Starting bulk motivational email send...");
    setLastResult(null);

    try {
      const response = await fetch("/api/users/emails/motivational-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchSize: 15,
          delayBetweenBatches: 2000,
          onlyQualified: true,
        }),
      });

      const data: BulkEmailResult = await response.json();
      setLastResult(data);

      if (data.success) {
        setResult(`✅ Motivational emails sent successfully! 
          📧 Sent: ${data.summary.sent} 
          ❌ Failed: ${data.summary.failed}`);
      } else {
        setResult(`⚠️ Partial success: 
          📧 Sent: ${data.summary.sent} 
          ❌ Failed: ${data.summary.failed}`);
      }
    } catch (error) {
      console.error("Error sending motivational emails:", error);
      setResult(`❌ Error sending motivational emails: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Send last call emails to all users
  const sendLastCallEmails = async () => {
    setIsLoading(true);
    setResult("🚀 Starting bulk last call email send...");
    setLastResult(null);

    try {
      const response = await fetch("/api/users/emails/last-call-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchSize: 15,
          delayBetweenBatches: 2000,
          onlyQualified: true,
          updateDatabase: true,
        }),
      });

      const data: BulkEmailResult = await response.json();
      setLastResult(data);

      if (data.success) {
        setResult(`✅ Last call emails sent successfully! 
          📧 Sent: ${data.summary.sent} 
          ❌ Failed: ${data.summary.failed}
          📝 Database updated: ${data.summary.updatedInDatabase || 0} users`);
      } else {
        setResult(`⚠️ Partial success: 
          📧 Sent: ${data.summary.sent} 
          ❌ Failed: ${data.summary.failed}
          📝 Database updated: ${data.summary.updatedInDatabase || 0} users`);
      }

      // Refresh stats after sending
      await fetchStats();
    } catch (error) {
      console.error("Error sending last call emails:", error);
      setResult(`❌ Error sending last call emails: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset email status (for testing)
  const resetEmailStatus = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all email statuses? This will mark all users as not having received welcome emails."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/users/emails/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset-status",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(`✅ ${data.message}`);
        await fetchStats(); // Refresh stats
      } else {
        setResult(`❌ Failed to reset: ${data.error}`);
      }
    } catch (error) {
      console.error("Error resetting email status:", error);
      setResult(`❌ Error resetting status: ${error}`);
    }
  };

  // Mark all as sent (for testing)
  const markAllAsSent = async () => {
    if (
      !confirm(
        "Are you sure you want to mark all qualified users as having received welcome emails?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/users/emails/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mark-sent",
          onlyQualified: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(`✅ ${data.message}`);
        await fetchStats(); // Refresh stats
      } else {
        setResult(`❌ Failed to mark as sent: ${data.error}`);
      }
    } catch (error) {
      console.error("Error marking as sent:", error);
      setResult(`❌ Error marking as sent: ${error}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        CONCES Email Dashboard
      </h1>

      {/* User Statistics */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">User Statistics</h2>

        {stats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalUsers}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <div className="text-2xl font-bold text-green-600">
                {stats.qualifiedUsers}
              </div>
              <div className="text-sm text-gray-600">Qualified Users</div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <div className="text-2xl font-bold text-red-600">
                {stats.unqualifiedUsers}
              </div>
              <div className="text-sm text-gray-600">Unqualified Users</div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <div className="text-2xl font-bold text-green-600">
                {stats.welcomeEmailsSent}
              </div>
              <div className="text-sm text-gray-600">Welcome Emails Sent</div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <div className="text-2xl font-bold text-orange-600">
                {stats.welcomeEmailsPending}
              </div>
              <div className="text-sm text-gray-600">
                Welcome Emails Pending
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <div className="text-2xl font-bold text-purple-600">
                {stats.welcomeEmailProgress.percentage}%
              </div>
              <div className="text-sm text-gray-600">
                Welcome Email Progress
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <div className="text-2xl font-bold text-red-600">
                {stats.lastCallEmailsSent}
              </div>
              <div className="text-sm text-gray-600">Last Call Emails Sent</div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.lastCallEmailsPending}
              </div>
              <div className="text-sm text-gray-600">
                Last Call Emails Pending
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <div className="text-2xl font-bold text-pink-600">
                {stats.lastCallEmailProgress.percentage}%
              </div>
              <div className="text-sm text-gray-600">
                Last Call Email Progress
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">Loading statistics...</div>
        )}

        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          🔄 Refresh Stats
        </button>
      </div>

      {/* Email Actions */}
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            📧 Send Welcome Emails
          </h3>
          <p className="text-blue-700 mb-4">
            Send welcome emails to all qualified users who haven't received them
            yet. This will also update the database to track sent emails.
          </p>
          <button
            onClick={sendWelcomeEmails}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? "Sending Welcome Emails..."
              : "Send Welcome Emails to All"}
          </button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3">
            🎯 Send Motivational Emails
          </h3>
          <p className="text-green-700 mb-4">
            Send the "500 Reasons to Bring Your Best" motivational email to all
            qualified users. This can be sent multiple times to remind and
            motivate participants.
          </p>
          <button
            onClick={sendMotivationalEmails}
            disabled={isLoading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? "Sending Motivational Emails..."
              : "Send Motivational Emails to All"}
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-3">
            ⏰ Send Last Call Emails
          </h3>
          <p className="text-red-700 mb-4">
            Send the urgent "Last Call - 7 Days Left!" email to all qualified
            users who haven't received it yet. This will also update the
            database to track sent emails.
          </p>
          <button
            onClick={sendLastCallEmails}
            disabled={isLoading}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? "Sending Last Call Emails..."
              : "Send Last Call Emails to All"}
          </button>
        </div>

        {/* Admin Actions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">
            🛠️ Admin Actions (Testing)
          </h3>
          <div className="space-x-4">
            <button
              onClick={resetEmailStatus}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Reset Email Status
            </button>
            <button
              onClick={markAllAsSent}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Mark All as Sent
            </button>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {result && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Last Operation Result:</h3>
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}

      {/* Detailed Results */}
      {lastResult && lastResult.details.errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-red-800 font-semibold mb-2">
            Failed Emails ({lastResult.details.errors.length}):
          </h4>
          <div className="max-h-40 overflow-y-auto">
            {lastResult.details.errors.map((error, index) => (
              <div key={index} className="text-sm text-red-700 mb-1">
                <strong>{error.email}:</strong> {error.error}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
