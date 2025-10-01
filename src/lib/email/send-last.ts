import { sendLastCallEmail } from "./emailService";

interface LastCallEmailOptions {
  batchSize?: number;
  delayBetweenBatches?: number;
  onlyQualified?: boolean;
  updateDatabase?: boolean;
}

interface LastCallEmailResult {
  success: boolean;
  totalUsers: number;
  sent: number;
  failed: number;
  skipped: number;
  updatedInDatabase?: number;
  errors: Array<{ email: string; error: string; userId: string }>;
  updatedUserIds?: string[];
}

export async function sendLastCallEmailsToAllUsers(
  options: LastCallEmailOptions = {}
): Promise<LastCallEmailResult> {
  const {
    batchSize = 15,
    delayBetweenBatches = 2000,
    onlyQualified = true,
    updateDatabase = true,
  } = options;

  const result: LastCallEmailResult = {
    success: true,
    totalUsers: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    updatedInDatabase: 0,
    errors: [],
    updatedUserIds: [],
  };

  try {
    const { default: Enroll } = await import("@/models/Enroll");
    const { connectDB } = await import("@/lib/mongodb");
    await connectDB();

    const query: any = {
      $or: [{ lastmail: { $exists: false } }, { lastmail: false }],
    };
    if (onlyQualified) query.isQualified = true;

    const users = await Enroll.find(query).select("fullName email _id").lean();
    result.totalUsers = users.length;
    console.log(`📧 Starting last call emails to ${users.length} users`);

    if (users.length === 0) return result;

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      console.log(
        `📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          users.length / batchSize
        )}`
      );

      const batchPromises = batch.map(async (user) => {
        try {
          const firstName = user.fullName.split(" ")[0];
          const emailSent = await sendLastCallEmail({
            email: user.email,
            firstName,
          });

          if (!emailSent) throw new Error("Email service returned false");

          return {
            success: true,
            email: user.email,
            userId: user._id.toString(),
          };
        } catch (error: any) {
          const message = error?.message || "Unknown error";

          // 🚨 Detect Gmail auth or rate limit issues
          if (
            message.includes("Too many login attempts") ||
            message.includes("EAUTH") ||
            message.includes("quota exceeded") ||
            message.includes("Invalid login")
          ) {
            console.warn(
              "🚨 Gmail auth or rate limit issue. Pausing 10 minutes..."
            );
            await new Promise((r) => setTimeout(r, 10 * 60 * 1000));
          }

          console.error(`❌ Failed to send to ${user.email}: ${message}`);
          return {
            success: false,
            email: user.email,
            userId: user._id.toString(),
            error: message,
          };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      const successfulUserIds: string[] = [];

      batchResults.forEach((r) => {
        if (r.status === "fulfilled") {
          const v = r.value;
          if (v.success) {
            result.sent++;
            successfulUserIds.push(v.userId);
          } else {
            result.failed++;
            result.errors.push({
              email: v.email,
              userId: v.userId,
              error: v.error,
            });
          }
        } else {
          result.failed++;
          result.errors.push({
            email: "unknown",
            userId: "unknown",
            error: r.reason?.message || "Unknown rejection",
          });
        }
      });

      // 📝 Update DB
      if (updateDatabase && successfulUserIds.length > 0) {
        const updateResult = await Enroll.updateMany(
          { _id: { $in: successfulUserIds } },
          { $set: { lastmail: true, lastmailSentAt: new Date() } }
        );
        result.updatedInDatabase =
          (result.updatedInDatabase || 0) + updateResult.modifiedCount;
        result.updatedUserIds?.push(...successfulUserIds);
        console.log(`📝 Updated DB for ${updateResult.modifiedCount} users`);
      }

      if (i + batchSize < users.length) {
        console.log(`⏳ Waiting ${delayBetweenBatches}ms before next batch...`);
        await new Promise((r) => setTimeout(r, delayBetweenBatches));
      }
    }

    if (result.failed > 0) result.success = false;
    console.log(
      `✅ Done: ${result.sent} sent, ${result.failed} failed, ${result.updatedInDatabase} updated`
    );
    return result;
  } catch (err: any) {
    console.error("💥 Critical error:", err.message);
    result.success = false;
    result.errors.push({
      email: "bulk_process",
      userId: "bulk_process",
      error: err.message || "Unknown error",
    });
    return result;
  }
}
