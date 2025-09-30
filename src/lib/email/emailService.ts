import nodemailer from "nodemailer";
import {
  getWelcomeEmailHTML,
  getWelcomeEmailText,
  getMotivationalEmailHTML,
  getMotivationalEmailText,
  EmailTemplateData,
  MotivationalEmailData,
  LastCallEmailData,
  getLastCallEmailText,
  getLastCallEmailHTML,
} from "./templates";

// Types for bulk email operations
interface BulkEmailResult {
  success: boolean;
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}

interface BulkEmailData {
  recipients: MotivationalEmailData[];
  batchSize?: number;
  delayBetweenBatches?: number; // milliseconds
}

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    pool: true,
    maxConnections: 5, // Increased for bulk sending
    rateDelta: 20000,
    rateLimit: 14, // Gmail's rate limit (around 14 emails per second)
  });
};

// Single welcome email function
export async function sendWelcomeEmail(
  data: EmailTemplateData
): Promise<boolean> {
  try {
    const transporter = createTransporter();

    // Verify connection configuration
    await transporter.verify();
    console.log("SMTP connection verified successfully");

    const mailOptions = {
      from: {
        name: "CONCES Rebrand Challenge",
        address:
          process.env.EMAIL_USER ||
          process.env.SMTP_FROM ||
          "noreply@conces.org",
      },
      to: data.email,
      subject: "🎉 You're in! Here's your CONCES Rebrand Challenge Pack",
      text: getWelcomeEmailText(data),
      html: getWelcomeEmailHTML(data),
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", info.messageId);

    if (process.env.NODE_ENV !== "production") {
      console.log("Gmail email sent. Check the recipient inbox.");
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return false;
  }
}

// Single motivational email function
export async function sendMotivationalEmail(
  data: MotivationalEmailData
): Promise<boolean> {
  try {
    const transporter = createTransporter();

    // Verify connection
    await transporter.verify();

    const mailOptions = {
      from: {
        name: "CONCES Rebrand Challenge",
        address:
          process.env.EMAIL_USER ||
          process.env.SMTP_FROM ||
          "noreply@conces.org",
      },
      to: data.email,
      subject: "500 Reasons to Bring Your Best 🎯",
      text: getMotivationalEmailText(data),
      html: getMotivationalEmailHTML(data),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Motivational email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending motivational email:", error);
    return false;
  }
}

// Bulk motivational email function
export async function sendBulkMotivationalEmails(
  bulkData: BulkEmailData
): Promise<BulkEmailResult> {
  const { recipients, batchSize = 10, delayBetweenBatches = 2000 } = bulkData;
  const result: BulkEmailResult = {
    success: true,
    sent: 0,
    failed: 0,
    errors: [],
  };

  console.log(`Starting bulk email send to ${recipients.length} recipients`);
  console.log(
    `Batch size: ${batchSize}, Delay between batches: ${delayBetweenBatches}ms`
  );

  try {
    const transporter = createTransporter();

    // Verify connection before starting bulk send
    await transporter.verify();
    console.log("SMTP connection verified for bulk sending");

    // Process recipients in batches
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          recipients.length / batchSize
        )}`
      );

      // Send emails concurrently within batch
      const batchPromises = batch.map(async (recipient) => {
        try {
          const mailOptions = {
            from: {
              name: "CONCES Rebrand Challenge",
              address:
                process.env.EMAIL_USER ||
                process.env.SMTP_FROM ||
                "noreply@conces.org",
            },
            to: recipient.email,
            subject: "500 Reasons to Bring Your Best 🎯",
            text: getMotivationalEmailText(recipient),
            html: getMotivationalEmailHTML(recipient),
          };

          const info = await transporter.sendMail(mailOptions);
          console.log(`✅ Email sent to ${recipient.email}: ${info.messageId}`);
          return { success: true, email: recipient.email };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error(
            `❌ Failed to send email to ${recipient.email}:`,
            errorMessage
          );
          return {
            success: false,
            email: recipient.email,
            error: errorMessage,
          };
        }
      });

      // Wait for all emails in this batch to complete
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
            });
          }
        } else {
          result.failed++;
          result.errors.push({
            email: "unknown",
            error: batchResult.reason,
          });
        }
      });

      // Add delay between batches (except for the last batch)
      if (i + batchSize < recipients.length) {
        console.log(`Waiting ${delayBetweenBatches}ms before next batch...`);
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenBatches)
        );
      }
    }

    // Close the transporter
    transporter.close();

    console.log(
      `Bulk email completed: ${result.sent} sent, ${result.failed} failed`
    );

    if (result.failed > 0) {
      result.success = false;
      console.log("Failed emails:", result.errors);
    }

    return result;
  } catch (error) {
    console.error("Critical error in bulk email sending:", error);
    result.success = false;
    result.errors.push({
      email: "bulk_process",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return result;
  }
}

// Utility function to send bulk emails from array of email addresses and names
export async function sendBulkMotivationalEmailsSimple(
  emailList: Array<{ email: string; firstName: string }>,
  options?: {
    batchSize?: number;
    delayBetweenBatches?: number;
  }
): Promise<BulkEmailResult> {
  const recipients: MotivationalEmailData[] = emailList.map((item) => ({
    email: item.email,
    firstName: item.firstName,
  }));

  return sendBulkMotivationalEmails({
    recipients,
    batchSize: options?.batchSize,
    delayBetweenBatches: options?.delayBetweenBatches,
  });
}

// Existing functions...
export async function sendReminderEmail(
  email: string,
  fullName: string,
  daysLeft: number
): Promise<boolean> {
  try {
    const transporter = createTransporter();

    // Verify connection
    await transporter.verify();

    const mailOptions = {
      from: {
        name: "CONCES Rebrand Challenge",
        address:
          process.env.EMAIL_USER ||
          process.env.SMTP_FROM ||
          "noreply@conces.org",
      },
      to: email,
      subject: `⏰ ${daysLeft} days left to submit your design!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #002B5B;">Hi ${fullName},</h2>
          <p>Just a friendly reminder that you have <strong>${daysLeft} days</strong> left to submit your design for the CONCES Logo Rebrand Challenge!</p>
          <p>Don't miss your chance to win ₦500,000!</p>
          <a href="https://brandchallenge.conces.org/submit" style="display: inline-block; background-color: #00B894; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Submit Your Design</a>
        </div>
      `,
      text: `Hi ${fullName}, Just a reminder that you have ${daysLeft} days left to submit your design for the CONCES Logo Rebrand Challenge!`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Reminder email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending reminder email:", error);
    return false;
  }
}

// Test email function for debugging
export async function testEmailConnection(): Promise<boolean> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email connection test successful");
    return true;
  } catch (error) {
    console.error("❌ Email connection test failed:", error);
    return false;
  }
}

// Progress tracking for bulk emails
export function createBulkEmailProgress() {
  let progress = {
    total: 0,
    sent: 0,
    failed: 0,
    currentBatch: 0,
    totalBatches: 0,
    isRunning: false,
  };

  return {
    getProgress: () => ({ ...progress }),
    updateProgress: (update: Partial<typeof progress>) => {
      progress = { ...progress, ...update };
    },
    reset: () => {
      progress = {
        total: 0,
        sent: 0,
        failed: 0,
        currentBatch: 0,
        totalBatches: 0,
        isRunning: false,
      };
    },
  };
}

export async function sendLastCallEmail(
  data: LastCallEmailData
): Promise<boolean> {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: "CONCES Rebrand Challenge",
        address: process.env.EMAIL_USER || "noreply@conces.org",
      },
      to: data.email,
      subject: "⏰ Last Call: Submit Your Entry — Contest Ends in 7 Days!",
      text: getLastCallEmailText(data),
      html: getLastCallEmailHTML(data),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Last call email sent to ${data.email}: ${info.messageId}`);

    return true;
  } catch (error) {
    console.error(`❌ Failed to send last call email to ${data.email}:`, error);
    return false;
  }
}

// Bulk send to qualified enrollees
export async function sendLastCallEmailsToQualified(
  options: {
    batchSize?: number;
    delayBetweenBatches?: number;
  } = {}
): Promise<{
  success: boolean;
  totalSent: number;
  totalFailed: number;
  errors: Array<{ email: string; error: string }>;
}> {
  const { batchSize = 15, delayBetweenBatches = 2000 } = options;

  const result = {
    success: true,
    totalSent: 0,
    totalFailed: 0,
    errors: [] as Array<{ email: string; error: string }>,
  };

  try {
    // Import Enroll model
    const { default: Enroll } = await import("@/models/Enroll");
    const { connectDB } = await import("@/lib/mongodb");

    await connectDB();

    // Get all qualified enrollees
    const enrollees = await Enroll.find({ isQualified: true })
      .select("fullName email")
      .lean();

    console.log(
      `📧 Starting last call emails to ${enrollees.length} qualified candidates`
    );

    if (enrollees.length === 0) {
      console.log("No qualified enrollees found");
      return result;
    }

    // Process in batches
    for (let i = 0; i < enrollees.length; i += batchSize) {
      const batch = enrollees.slice(i, i + batchSize);
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          enrollees.length / batchSize
        )}`
      );

      const batchPromises = batch.map(async (enrollee) => {
        try {
          const firstName = enrollee.fullName.split(" ")[0];

          const emailSent = await sendLastCallEmail({
            email: enrollee.email,
            firstName: firstName,
          });

          if (emailSent) {
            console.log(`✅ Last call email sent to ${enrollee.email}`);
            return { success: true, email: enrollee.email };
          } else {
            throw new Error("Email service returned false");
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error(
            `❌ Failed to send to ${enrollee.email}:`,
            errorMessage
          );
          return { success: false, email: enrollee.email, error: errorMessage };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((batchResult) => {
        if (batchResult.status === "fulfilled") {
          if (batchResult.value.success) {
            result.totalSent++;
          } else {
            result.totalFailed++;
            result.errors.push({
              email: batchResult.value.email,
              error: batchResult.value.error || "Unknown error",
            });
          }
        } else {
          result.totalFailed++;
          result.errors.push({
            email: "unknown",
            error: batchResult.reason,
          });
        }
      });

      // Delay between batches
      if (i + batchSize < enrollees.length) {
        console.log(`⏳ Waiting ${delayBetweenBatches}ms before next batch...`);
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenBatches)
        );
      }
    }

    if (result.totalFailed > 0) {
      result.success = false;
    }

    console.log(
      `✅ Last call emails completed: ${result.totalSent} sent, ${result.totalFailed} failed`
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