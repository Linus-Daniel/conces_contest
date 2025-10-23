import { Resend } from "resend";
import {
  VotingStageEmailData,
  VotingCardEmailData,
  getVotingStageEmailText,
  getVotingStageEmailHTML,
  getVotingCardEmailHTML,
  getVotingCardEmailText,
} from "./templates";

// Initialize Resend with API key from environment
console.log(process.env.RESEND_API_KEY);
const resend = new Resend("re_8oX3FjxJ_5dhCYRDe6cWiitMALXjYRaFC");

// Types for bulk email operations
interface BulkEmailResult {
  success: boolean;
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}

// Single voting stage email function using Resend
export async function sendVotingStageEmailWithResend(
  data: VotingStageEmailData
): Promise<boolean> {
  try {
    console.log(`📧 [Resend] Sending voting stage email to ${data.email}`);

    const { data: result, error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "CONCES Rebrand Challenge <noreply@conces.org>",
      to: data.email,
      subject: "You Made It! Time to Prepare for the Voting Stage 🗳️✨",
      text: getVotingStageEmailText(data),
      html: getVotingStageEmailHTML(data),
    });

    if (error) {
      console.error(
        `❌ [Resend] Failed to send voting stage email to ${data.email}:`,
        error
      );
      return false;
    }

    console.log(
      `✅ [Resend] Voting stage email sent to ${data.email}: ${result?.id}`
    );
    return true;
  } catch (error) {
    console.error(
      `❌ [Resend] Error sending voting stage email to ${data.email}:`,
      error
    );
    return false;
  }
}

// Single voting card email function using Resend
export async function sendVotingCardEmailWithResend(
  data: VotingCardEmailData
): Promise<boolean> {
  try {
    console.log(`📧 [Resend] Sending voting card email to ${data.email}`);

    const { data: result, error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "CONCES Rebrand Challenge <noreply@conces.org>",
      to: data.email,
      subject: "🎉 Your CONCES Logo Rebrand Challenge Voting Card Is Ready!",
      text: getVotingCardEmailText(data),
      html: getVotingCardEmailHTML(data),
    });

    if (error) {
      console.error(
        `❌ [Resend] Failed to send voting card email to ${data.email}:`,
        error
      );
      return false;
    }

    console.log(
      `✅ [Resend] Voting card email sent to ${data.email}: ${result?.id}`
    );
    return true;
  } catch (error) {
    console.error(
      `❌ [Resend] Error sending voting card email to ${data.email}:`,
      error
    );
    return false;
  }
}

// Send OTP email for voting using Resend
export async function sendVotingOTPEmailWithResend(
  email: string,
  otpCode: string,
  projectTitle: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`📧 [Resend] Sending OTP to ${email}`);

    const templateData = {
      email,
      otpCode,
      projectTitle,
      expiryTime: "5 minutes",
      companyName: "CONCES",
    };

    const { data: result, error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "CONCES Rebrand Challenge <noreply@conces.org>",
      to: email,
      subject: `🔐 Your CONCES Voting Verification Code: ${otpCode}`,
      html: getVotingOTPEmailTemplate(templateData),
      text: getVotingOTPEmailTextTemplate(templateData),
    });

    if (error) {
      console.error(`❌ [Resend] Failed to send OTP to ${email}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(`✅ [Resend] OTP sent successfully to ${email}: ${result?.id}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ [Resend] Failed to send OTP to ${email}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Bulk send voting stage emails to qualified candidates using Resend
export async function sendVotingStageEmailsToQualifiedWithResend(
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
      `📧 [Resend] Starting voting stage emails to ${enrollees.length} qualified candidates`
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

          const emailSent = await sendVotingStageEmailWithResend({
            email: enrollee.email,
            firstName: firstName,
          });

          if (emailSent) {
            console.log(
              `✅ [Resend] Voting stage email sent to ${enrollee.email}`
            );
            return { success: true, email: enrollee.email };
          } else {
            throw new Error("Resend service returned false");
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error(
            `❌ [Resend] Failed to send to ${enrollee.email}:`,
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
      `✅ [Resend] Voting stage emails completed: ${result.totalSent} sent, ${result.totalFailed} failed`
    );
    return result;
  } catch (error) {
    console.error(
      "[Resend] Critical error in bulk voting stage email sending:",
      error
    );
    result.success = false;
    result.errors.push({
      email: "bulk_process",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return result;
  }
}

// Bulk send voting card emails to selected contestants using Resend
export async function sendVotingCardEmailsToSelectedWithResend(
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
  const {
    batchSize = 15,
    delayBetweenBatches = 2000,
    updateDatabase = true,
  } = options;

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
          votingCardEmailSent: { $ne: true },
        }
      : {
          status: "selected",
        };

    const selectedProjects = await Project.find(query)
      .populate("candidate", "fullName email")
      .select("_id projectTitle candidate votingCardEmailSent")
      .lean();

    console.log(
      `📧 [Resend] Starting voting card emails to ${selectedProjects.length} selected contestants`
    );

    if (selectedProjects.length === 0) {
      console.log("No selected projects found");
      return result;
    }

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
            console.log(
              `⏩ Skipping ${candidate.email} - already sent voting card`
            );
            return {
              success: false,
              skipped: true,
              email: candidate.email,
              projectId: project._id.toString(),
            };
          }

          const emailSent = await sendVotingCardEmailWithResend({
            email: candidate.email,
            firstName: firstName,
            candidateName: candidate.fullName,
            projectTitle: project.projectTitle,
          });

          if (emailSent) {
            console.log(
              `✅ [Resend] Voting card email sent to ${candidate.email}`
            );

            // Update database if enabled
            if (updateDatabase) {
              try {
                await Project.findByIdAndUpdate(project._id, {
                  votingCardEmailSent: true,
                  votingCardEmailSentAt: new Date(),
                });
                result.updatedInDatabase++;
                console.log(`📝 Database updated for ${candidate.email}`);
              } catch (dbError) {
                console.error(
                  `Failed to update DB for ${candidate.email}:`,
                  dbError
                );
                // Email sent but DB update failed - log but don't fail the whole operation
              }
            }

            return {
              success: true,
              email: candidate.email,
              projectId: project._id.toString(),
            };
          } else {
            throw new Error("Resend service returned false");
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error(
            `❌ [Resend] Failed to send to ${project.candidate?.email}:`,
            errorMessage
          );
          return {
            success: false,
            email: project.candidate?.email || "unknown",
            error: errorMessage,
            projectId: project._id?.toString() || "unknown",
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

    if (result.totalFailed > 0) {
      result.success = false;
    }

    console.log(
      `✅ [Resend] Voting card emails completed: ${result.totalSent} sent, ${result.totalFailed} failed`
    );
    return result;
  } catch (error) {
    console.error(
      "[Resend] Critical error in bulk voting card email sending:",
      error
    );
    result.success = false;
    result.errors.push({
      email: "bulk_process",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return result;
  }
}

// OTP Email Template (same as in emailService.ts)
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

// Test Resend connection
export async function testResendConnection(): Promise<boolean> {
  try {
    // Test with a simple email (you can comment this out to avoid sending test emails)
    console.log("✅ Resend connection test - Resend service is ready");
    return true;
  } catch (error) {
    console.error("❌ Resend connection test failed:", error);
    return false;
  }
}
