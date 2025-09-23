// app/api/users/emails/motivational-all/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendMotivationalEmailsToAllUsers } from "@/lib/email/send-motivational";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const {
      batchSize = 15,
      delayBetweenBatches = 2000,
      onlyQualified = true,
    } = body;

    console.log("Starting bulk motivational email send with options:", {
      batchSize,
      delayBetweenBatches,
      onlyQualified,
    });

    const result = await sendMotivationalEmailsToAllUsers({
      batchSize,
      delayBetweenBatches,
      onlyQualified,
    });

    const statusCode = result.success ? 200 : 207; // 207 = Multi-Status (partial success)

    return NextResponse.json(
      {
        success: result.success,
        message: `Motivational emails bulk send completed`,
        summary: {
          totalUsers: result.totalUsers,
          sent: result.sent,
          failed: result.failed,
          skipped: result.skipped,
        },
        details: {
          errors: result.errors,
        },
      },
      { status: statusCode }
    );
  } catch (error) {
    console.error("Error in bulk motivational email API:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
