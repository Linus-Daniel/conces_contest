// app/api/users/emails/last-call-all/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendLastCallEmailsToAllUsers } from "@/lib/email/send-last";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const {
      batchSize = 30,
      delayBetweenBatches = 2000,
      onlyQualified = true,
      updateDatabase = true,
    } = body;

    console.log("Starting bulk last call email send with options:", {
      batchSize,
      delayBetweenBatches,
      onlyQualified,
      updateDatabase,
    });

    const result = await sendLastCallEmailsToAllUsers({
      batchSize,
      delayBetweenBatches,
      onlyQualified,
      updateDatabase,
    });

    const statusCode = result.success ? 200 : 207; // 207 = Multi-Status (partial success)

    return NextResponse.json(
      {
        success: result.success,
        message: `Last call emails bulk send completed`,
        summary: {
          totalUsers: result.totalUsers,
          sent: result.sent,
          failed: result.failed,
          skipped: result.skipped,
          updatedInDatabase: result.updatedInDatabase,
        },
        details: {
          errors: result.errors,
          updatedUserIds: result.updatedUserIds,
        },
      },
      { status: statusCode }
    );
  } catch (error) {
    console.error("Error in bulk last call email API:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
