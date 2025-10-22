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
  getVotingStageEmailText,
  getVotingStageEmailHTML,
  VotingStageEmailData,
  VotingCardEmailData,
  getVotingCardEmailHTML,
  getVotingCardEmailText,
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
    maxConnections: 2, // Increased for bulk sending
    rateDelta: 60000,
    rateLimit: 5, // Gmail's rate limit (around 14 emails per second)
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



// Single voting stage email function
export async function sendVotingStageEmail(
  data: VotingStageEmailData
): Promise<boolean> {
  try {
    const transporter = createTransporter();

    // Verify connection
    await transporter.verify();

    const mailOptions = {
      from: {
        name: "CONCES Rebrand Challenge",
        address: process.env.EMAIL_USER || "noreply@conces.org",
      },
      to: data.email,
      subject: "You Made It! Time to Prepare for the Voting Stage 🗳️✨",
      text: getVotingStageEmailText(data),
      html: getVotingStageEmailHTML(data),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Voting stage email sent to ${data.email}: ${info.messageId}`);

    return true;
  } catch (error) {
    console.error(`❌ Failed to send voting stage email to ${data.email}:`, error);
    return false;
  }
}

// Bulk send to qualified candidates
export async function sendVotingStageEmailsToQualified(
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
      `📧 Starting voting stage emails to ${enrollees.length} qualified candidates`
    );

    if (enrollees.length === 0) {
      console.log("No qualified enrollees found");
      return result;
    }

    const transporter = createTransporter();
    await transporter.verify();
    console.log("SMTP connection verified for bulk voting stage emails");

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

          const emailSent = await sendVotingStageEmail({
            email: enrollee.email,
            firstName: firstName,
          });

          if (emailSent) {
            console.log(`✅ Voting stage email sent to ${enrollee.email}`);
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

    // Close the transporter
    transporter.close();

    if (result.totalFailed > 0) {
      result.success = false;
    }

    console.log(
      `✅ Voting stage emails completed: ${result.totalSent} sent, ${result.totalFailed} failed`
    );
    return result;
  } catch (error) {
    console.error("Critical error in bulk voting stage email sending:", error);
    result.success = false;
    result.errors.push({
      email: "bulk_process",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return result;
  }
}

// Single voting card email function
export async function sendVotingCardEmail(
  data: VotingCardEmailData
): Promise<boolean> {
  try {
    const transporter = createTransporter();

    // Verify connection
    await transporter.verify();

    const mailOptions = {
      from: {
        name: "CONCES Rebrand Challenge",
        address: process.env.EMAIL_USER || "noreply@conces.org",
      },
      to: data.email,
      subject: "🎉 Your CONCES Logo Rebrand Challenge Voting Card Is Ready!",
      text: getVotingCardEmailText(data),
      html: getVotingCardEmailHTML(data),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Voting card email sent to ${data.email}: ${info.messageId}`);

    return true;
  } catch (error) {
    console.error(`❌ Failed to send voting card email to ${data.email}:`, error);
    return false;
  }
}

// Bulk send voting card emails to selected contestants
export async function sendVotingCardEmailsToSelected(
  options: {
    batchSize?: number;
    delayBetweenBatches?: number;
    updateDatabase?: boolean;
  } = {}
): Promise<{
  success: boolean;
  totalSent: number;
  totalFailed: number;
  totalSkipped: number;
  updatedInDatabase: number;
  errors: Array<{ email: string; error: string }>;
}> {
  const { batchSize = 15, delayBetweenBatches = 2000, updateDatabase = true } = options;

  const result = {
    success: true,
    totalSent: 0,
    totalFailed: 0,
    totalSkipped: 0,
    updatedInDatabase: 0,
    errors: [] as Array<{ email: string; error: string }>,
  };

  try {
    // Import models
    const { default: Project } = await import("@/models/Project");
    const { connectDB } = await import("@/lib/mongodb");

    await connectDB();

    // Get selected projects with their candidates (avoid duplicates if updateDatabase is true)
    const query = updateDatabase 
      ? { 
          status: "selected", 
          votingCardEmailSent: { $ne: true } 
        }
      : { 
          status: "selected" 
        };

    const selectedProjects = await Project.find(query)
      .populate("candidate", "fullName email")
      .select("_id projectTitle candidate votingCardEmailSent")
      .lean();

    console.log(
      `📧 Starting voting card emails to ${selectedProjects.length} selected contestants`
    );

    if (selectedProjects.length === 0) {
      console.log("No selected projects found");
      return result;
    }

    const transporter = createTransporter();
    await transporter.verify();
    console.log("SMTP connection verified for bulk voting card emails");

    // Process in batches
    for (let i = 0; i < selectedProjects.length; i += batchSize) {
      const batch = selectedProjects.slice(i, i + batchSize);
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          selectedProjects.length / batchSize
        )}`
      );

      const batchPromises = batch.map(async (project) => {
        try {
          if (!project.candidate) {
            throw new Error("Project has no candidate");
          }

          const candidate = project.candidate as any;
          const firstName = candidate.fullName.split(" ")[0];

          // Skip if already sent (double-check)
          if (updateDatabase && project.votingCardEmailSent) {
            result.totalSkipped++;
            console.log(`⏩ Skipping ${candidate.email} - already sent voting card`);
            return { 
              success: false, 
              skipped: true, 
              email: candidate.email,
              projectId: project._id.toString()
            };
          }

          const emailSent = await sendVotingCardEmail({
            email: candidate.email,
            firstName: firstName,
            candidateName: candidate.fullName,
            projectTitle: project.projectTitle,
          });

          if (emailSent) {
            console.log(`✅ Voting card email sent to ${candidate.email}`);

            // Update database if enabled
            if (updateDatabase) {
              try {
                await Project.findByIdAndUpdate(
                  project._id,
                  { 
                    votingCardEmailSent: true,
                    votingCardEmailSentAt: new Date()
                  }
                );
                result.updatedInDatabase++;
                console.log(`📝 Database updated for ${candidate.email}`);
              } catch (dbError) {
                console.error(`Failed to update DB for ${candidate.email}:`, dbError);
                // Email sent but DB update failed - log but don't fail the whole operation
              }
            }

            return { success: true, email: candidate.email, projectId: project._id.toString() };
          } else {
            throw new Error("Email service returned false");
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error(
            `❌ Failed to send to ${project.candidate?.email}:`,
            errorMessage
          );
          return { 
            success: false, 
            email: project.candidate?.email || "unknown", 
            error: errorMessage,
            projectId: project._id?.toString() || "unknown"
          };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((batchResult) => {
        if (batchResult.status === "fulfilled") {
          if (batchResult.value.success) {
            result.totalSent++;
          } else if (batchResult.value.skipped) {
            // Already counted in totalSkipped above
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
      if (i + batchSize < selectedProjects.length) {
        console.log(`⏳ Waiting ${delayBetweenBatches}ms before next batch...`);
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenBatches)
        );
      }
    }

    // Close the transporter
    transporter.close();

    if (result.totalFailed > 0) {
      result.success = false;
    }

    console.log(
      `✅ Voting card emails completed: ${result.totalSent} sent, ${result.totalFailed} failed`
    );
    return result;
  } catch (error) {
    console.error("Critical error in bulk voting card email sending:", error);
    result.success = false;
    result.errors.push({
      email: "bulk_process",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return result;
  }
}

// Send OTP email for voting
export async function sendVotingOTPEmail(
  email: string,
  otpCode: string,
  projectTitle: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`📧 [Email Service] Sending OTP to ${email}`);

    const templateData = {
      email,
      otpCode,
      projectTitle,
      expiryTime: "5 minutes",
      companyName: "CONCES",
    };

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `🔐 Your CONCES Voting Verification Code: ${otpCode}`,
      html: getVotingOTPEmailTemplate(templateData),
      text: getVotingOTPEmailTextTemplate(templateData),
    };

    const transporter = createTransporter();
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ [Email Service] OTP sent successfully to ${email}`);
    
    return { success: true };
  } catch (error) {
    console.error(`❌ [Email Service] Failed to send OTP to ${email}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

// OTP Email Template
function getVotingOTPEmailTemplate(data: {
  email: string;
  otpCode: string;
  projectTitle: string;
  expiryTime: string;
  companyName: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Voting Verification Code</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1e40af 0%, #10b981 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .otp-box { background: #f8fafc; border: 2px dashed #1e40af; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
    .otp-code { font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 8px; margin: 10px 0; font-family: monospace; }
    .project-info { background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Voting Verification Code</h1>
      <p>Secure your vote for the ${data.companyName} Design Contest</p>
    </div>
    
    <div class="content">
      <p>Hi there!</p>
      
      <p>You have requested to vote for a project in our design contest. Use the verification code below to confirm your vote:</p>
      
      <div class="otp-box">
        <p><strong>Your Verification Code:</strong></p>
        <div class="otp-code">${data.otpCode}</div>
        <p><small>This code expires in ${data.expiryTime}</small></p>
      </div>
      
      <div class="project-info">
        <h3>🎨 Project Details:</h3>
        <p><strong>Project:</strong> ${data.projectTitle}</p>
        <p><strong>Email:</strong> ${data.email}</p>
      </div>
      
      <div class="warning">
        <h4>⚠️ Important Security Information:</h4>
        <ul>
          <li>Never share this code with anyone</li>
          <li>Our team will never ask for this code</li>
          <li>Each email and phone number can only vote once</li>
          <li>This code expires in ${data.expiryTime}</li>
        </ul>
      </div>
      
      <p>If you did not request this verification code, please ignore this email or contact our support team.</p>
      
      <p>Thank you for participating in the ${data.companyName} Design Contest!</p>
    </div>
    
    <div class="footer">
      <p>© 2024 ${data.companyName}. All rights reserved.</p>
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;
}

// OTP Email Text Template  
function getVotingOTPEmailTextTemplate(data: {
  email: string;
  otpCode: string;
  projectTitle: string;
  expiryTime: string;
  companyName: string;
}): string {
  return `🔐 VOTING VERIFICATION CODE

Hi there!

You have requested to vote for a project in our design contest. Use the verification code below to confirm your vote:

VERIFICATION CODE: ${data.otpCode}
(This code expires in ${data.expiryTime})

PROJECT DETAILS:
- Project: ${data.projectTitle}
- Email: ${data.email}

IMPORTANT SECURITY INFORMATION:
- Never share this code with anyone
- Our team will never ask for this code
- Each email and phone number can only vote once
- This code expires in ${data.expiryTime}

If you did not request this verification code, please ignore this email or contact our support team.

Thank you for participating in the ${data.companyName} Design Contest!

© 2024 ${data.companyName}. All rights reserved.
This is an automated message. Please do not reply to this email.`;
}
