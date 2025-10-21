// lib/user-email-service.ts
import Enroll, { IEnroll } from "@/models/Enroll";
import {
  sendBulkMotivationalEmailsSimple,
  sendWelcomeEmail,
  sendMotivationalEmail,
} from "./emailService";
import { EmailTemplateData, MotivationalEmailData } from "./templates";

interface BulkUserEmailResult {
  success: boolean;
  totalUsers: number;
  sent: number;
  failed: number;
  skipped: number;
  errors: Array<{ email: string; error: string; userId: string }>;
  updatedUsers: string[]; // IDs of users whose contestPack.sent was updated
}

interface BulkEmailOptions {
  batchSize?: number;
  delayBetweenBatches?: number;
  onlyQualified?: boolean;
  updateDatabase?: boolean;
  emailType?: "welcome" | "motivational";
}

// Get all users from database
export async function getAllUsers(
  filter: {
    isQualified?: boolean;
    contestPackSent?: boolean;
  } = {}
): Promise<IEnroll[]> {
  try {
    const query: any = {};

    if (filter.isQualified !== undefined) {
      query.isQualified = filter.isQualified;
    }

    if (filter.contestPackSent !== undefined) {
      query["contestPack.sent"] = filter.contestPackSent;
    }

    const users = await Enroll.find(query)
      .select(
        "fullName email institution department authToken isQualified contestPack"
      )
      .lean()
      .exec();

    console.log(`Found ${users.length} users matching filter:`, filter);
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users from database");
  }
}

// lib/email/send-motivational.ts (add this to your existing file)

export async function getUsersStats() {
  try {
    const { default: Enroll } = await import("@/models/Enroll");
    const { connectDB } = await import("@/lib/mongodb");

    await connectDB();

    // Get total counts
    const totalUsers = await Enroll.countDocuments({});
    const qualifiedUsers = await Enroll.countDocuments({ isQualified: true });
    const unqualifiedUsers = await Enroll.countDocuments({ isQualified: false });
    const qualifiedEmails = await Enroll.countDocuments({receivedQualifiedEmail:true});
    const qualifiedEmailsPending = await Enroll.countDocuments({receivedQualifiedEmail:false});

    // Welcome email stats
    const welcomeEmailsSent = await Enroll.countDocuments({
      "contestPack.sent": true,
    });
    const welcomeEmailsPending = await Enroll.countDocuments({
      $or: [
        { "contestPack.sent": false },
        { "contestPack.sent": { $exists: false } },
      ],
    });

    // Last call email stats
    const lastCallEmailsSent = await Enroll.countDocuments({
      lastmail: true,
    });
    const lastCallEmailsPending = await Enroll.countDocuments({
      $or: [
        { lastmail: false },
        { lastmail: { $exists: false } },
      ],
    });

    return {
      totalUsers,
      qualifiedUsers,
      unqualifiedUsers,
      welcomeEmailsSent,
      welcomeEmailsPending,
      lastCallEmailsSent,
      lastCallEmailsPending,
      qualifiedEmails,
      qualifiedEmailsPending,
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    throw error;
  }
}
// Send welcome emails to all users who haven't received them
export async function sendWelcomeEmailsToAllUsers(
  options: BulkEmailOptions = {}
): Promise<BulkUserEmailResult> {
  const {
    batchSize = 10,
    delayBetweenBatches = 2000,
    onlyQualified = true,
    updateDatabase = true,
  } = options;

  console.log("Starting bulk welcome email send...");

  const result: BulkUserEmailResult = {
    success: true,
    totalUsers: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    updatedUsers: [],
  };

  try {
    // Get users who haven't received welcome emails
    const users = await getAllUsers({
      isQualified: onlyQualified,
      contestPackSent: false,
    });

    result.totalUsers = users.length;
    console.log(`Processing ${result.totalUsers} users for welcome emails`);

    if (users.length === 0) {
      console.log("No users found who need welcome emails");
      return result;
    }

    // Process users in batches
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          users.length / batchSize
        )}`
      );

      // Send emails concurrently within batch
      const batchPromises = batch.map(async (user) => {
        try {
          const emailData: EmailTemplateData = {
            fullName: user.fullName,
            email: user.email,
            authToken: user.authToken,
            institution: user.institution,
            department: user.department,
          };

          const emailSent = await sendWelcomeEmail(emailData);

          if (emailSent) {
            // Update database if email was sent successfully
            if (updateDatabase) {
              await Enroll.findByIdAndUpdate(user._id, {
                "contestPack.sent": true,
                "contestPack.sentAt": new Date(),
              });
              result.updatedUsers.push(user._id.toString());
            }

            console.log(`✅ Welcome email sent to ${user.email}`);
            return {
              success: true,
              userId: user._id.toString(),
              email: user.email,
            };
          } else {
            throw new Error("Email service returned false");
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error(
            `❌ Failed to send welcome email to ${user.email}:`,
            errorMessage
          );
          return {
            success: false,
            userId: user._id.toString(),
            email: user.email,
            error: errorMessage,
          };
        }
      });

      // Wait for batch to complete
      const batchResults = await Promise.allSettled(batchPromises);

      // Process results
      batchResults.forEach((batchResult) => {
        if (batchResult.status === "fulfilled") {
          if (batchResult.value.success) {
            result.sent++;
          } else {
            result.failed++;
            result.errors.push({
              email: batchResult.value.email,
              error: batchResult.value.error || "Unknown error",
              userId: batchResult.value.userId,
            });
          }
        } else {
          result.failed++;
          result.errors.push({
            email: "unknown",
            error: batchResult.reason,
            userId: "unknown",
          });
        }
      });

      // Add delay between batches (except for last batch)
      if (i + batchSize < users.length) {
        console.log(`Waiting ${delayBetweenBatches}ms before next batch...`);
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenBatches)
        );
      }
    }

    if (result.failed > 0) {
      result.success = false;
    }

    console.log(
      `Welcome email bulk send completed: ${result.sent} sent, ${result.failed} failed`
    );
    return result;
  } catch (error) {
    console.error("Critical error in bulk welcome email sending:", error);
    result.success = false;
    result.errors.push({
      email: "bulk_process",
      error: error instanceof Error ? error.message : "Unknown error",
      userId: "system",
    });
    return result;
  }
}

// Send motivational emails to all qualified users
export async function sendMotivationalEmailsToAllUsers(
  options: BulkEmailOptions = {}
): Promise<BulkUserEmailResult> {
  const {
    batchSize = 15,
    delayBetweenBatches = 2000,
    onlyQualified = true,
  } = options;

  console.log("Starting bulk motivational email send...");

  const result: BulkUserEmailResult = {
    success: true,
    totalUsers: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    updatedUsers: [],
  };

  try {
    // Get all qualified users
    const users = await getAllUsers({
      isQualified: onlyQualified,
    });

    result.totalUsers = users.length;
    console.log(
      `Processing ${result.totalUsers} users for motivational emails`
    );

    if (users.length === 0) {
      console.log("No qualified users found");
      return result;
    }

    // Convert to MotivationalEmailData format
    const recipients: MotivationalEmailData[] = users.map((user) => ({
      email: user.email,
      firstName: user.fullName.split(" ")[0], // Get first name
    }));

    // Send bulk emails using existing service
    const bulkResult = await sendBulkMotivationalEmailsSimple(recipients, {
      batchSize,
      delayBetweenBatches,
    });

    // Map results
    result.sent = bulkResult.sent;
    result.failed = bulkResult.failed;
    result.success = bulkResult.success;
    result.errors = bulkResult.errors.map((error) => ({
      email: error.email,
      error: error.error,
      userId:
        users.find((u) => u.email === error.email)?._id.toString() || "unknown",
    }));

    console.log(
      `Motivational email bulk send completed: ${result.sent} sent, ${result.failed} failed`
    );
    return result;
  } catch (error) {
    console.error("Critical error in bulk motivational email sending:", error);
    result.success = false;
    result.errors.push({
      email: "bulk_process",
      error: error instanceof Error ? error.message : "Unknown error",
      userId: "system",
    });
    return result;
  }
}

// Send individual welcome email and update database
export async function sendWelcomeEmailToUser(
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const user = await Enroll.findById(userId);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (user.contestPack.sent) {
      return {
        success: false,
        message: "Welcome email already sent to this user",
      };
    }

    const emailData: EmailTemplateData = {
      fullName: user.fullName,
      email: user.email,
      authToken: user.authToken,
      institution: user.institution,
      department: user.department,
    };

    const emailSent = await sendWelcomeEmail(emailData);

    if (emailSent) {
      // Update database
      await Enroll.findByIdAndUpdate(userId, {
        "contestPack.sent": true,
        "contestPack.sentAt": new Date(),
      });

      return {
        success: true,
        message: `Welcome email sent successfully to ${user.email}`,
      };
    } else {
      return { success: false, message: "Failed to send welcome email" };
    }
  } catch (error) {
    console.error("Error sending welcome email to user:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Send individual motivational email
export async function sendMotivationalEmailToUser(
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const user = await Enroll.findById(userId);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (!user.isQualified) {
      return {
        success: false,
        message: "User is not qualified for the contest",
      };
    }

    const emailData: MotivationalEmailData = {
      email: user.email,
      firstName: user.fullName.split(" ")[0],
    };

    const emailSent = await sendMotivationalEmail(emailData);

    if (emailSent) {
      return {
        success: true,
        message: `Motivational email sent successfully to ${user.email}`,
      };
    } else {
      return { success: false, message: "Failed to send motivational email" };
    }
  } catch (error) {
    console.error("Error sending motivational email to user:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Mark all emails as sent (for testing or manual override)
export async function markAllEmailsAsSent(onlyQualified: boolean = true) {
  try {
    const filter: any = {};
    if (onlyQualified) {
      filter.isQualified = true;
    }

    const result = await Enroll.updateMany(
      { ...filter, "contestPack.sent": false },
      {
        "contestPack.sent": true,
        "contestPack.sentAt": new Date(),
      }
    );

    console.log(
      `Marked ${result.modifiedCount} users as having received emails`
    );
    return result.modifiedCount;
  } catch (error) {
    console.error("Error marking emails as sent:", error);
    throw error;
  }
}

// Reset email sent status (for testing)
export async function resetEmailSentStatus() {
  try {
    const result = await Enroll.updateMany(
      {},
      {
        "contestPack.sent": false,
        "contestPack.sentAt": undefined,
      }
    );

    console.log(`Reset email status for ${result.modifiedCount} users`);
    return result.modifiedCount;
  } catch (error) {
    console.error("Error resetting email status:", error);
    throw error;
  }
}

