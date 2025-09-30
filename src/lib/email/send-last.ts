// lib/email/send-last-call.ts
import { sendLastCallEmailsToQualified } from "./emailService";

interface LastCallEmailOptions {
  batchSize?: number;
  delayBetweenBatches?: number;
  onlyQualified?: boolean;
}

interface LastCallEmailResult {
  success: boolean;
  totalUsers: number;
  sent: number;
  failed: number;
  skipped: number;
  errors: Array<{ email: string; error: string }>;
}

export async function sendLastCallEmailsToAllUsers(
  options: LastCallEmailOptions = {}
): Promise<LastCallEmailResult> {
  const {
    batchSize = 15,
    delayBetweenBatches = 2000,
    onlyQualified = true,
  } = options;

  const result: LastCallEmailResult = {
    success: true,
    totalUsers: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // Import Enroll model
    const { default: Enroll } = await import("@/models/Enroll");
    const { connectDB } = await import("@/lib/mongodb");

    await connectDB();

    // Build query based on options
    const query = onlyQualified ? { isQualified: true } : {};

    // Get total count for reporting
    const totalUsers = await Enroll.countDocuments(query);
    result.totalUsers = totalUsers;

    console.log(
      `📧 Starting last call emails to ${totalUsers} ${
        onlyQualified ? "qualified" : "all"
      } users`
    );

    if (totalUsers === 0) {
      console.log("No users found matching criteria");
      return result;
    }

    // Use the existing sendLastCallEmailsToQualified function
    const emailResult = await sendLastCallEmailsToQualified({
      batchSize,
      delayBetweenBatches,
    });

    // Map the results
    result.sent = emailResult.totalSent;
    result.failed = emailResult.totalFailed;
    result.errors = emailResult.errors;
    result.success = emailResult.success;

    console.log(
      `✅ Last call emails completed: ${result.sent} sent, ${result.failed} failed`
    );

    return result;
  } catch (error) {
    console.error("Critical error in bulk last call email sending:", error);
    result.success = false;
    result.errors.push({
      email: "bulk_process",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return result;
  }
}
