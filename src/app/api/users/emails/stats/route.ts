// app/api/users/emails/stats/route.ts
import { NextResponse } from "next/server";
import { getUsersStats } from "@/lib/email/send-motivational";

export async function GET() {
  try {
    const stats = await getUsersStats();

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        welcomeEmailProgress: {
          sent: stats.welcomeEmailsSent,
          pending: stats.welcomeEmailsPending,
          percentage:
            stats.totalUsers > 0
              ? Math.round((stats.welcomeEmailsSent / stats.totalUsers) * 100)
              : 0,
        },
        lastCallEmailProgress: {
          sent: stats.lastCallEmailsSent,
          pending: stats.lastCallEmailsPending,
          percentage:
            stats.totalUsers > 0
              ? Math.round((stats.lastCallEmailsSent / stats.totalUsers) * 100)
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error getting user stats:", error);

    return NextResponse.json(
      {
        error: "Failed to get user statistics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
