// /api/users/emails/voting-cards/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import { sendVotingCardEmailsToSelectedWithResend } from "@/lib/email/resendService";
import Enroll from "@/models/Enroll";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { 
      batchSize = 15, 
      delayBetweenBatches = 2000,
      updateDatabase = true,
    } = body;

    console.log("📧 Starting bulk voting card email send...");
    console.log(`Configuration: batchSize=${batchSize}, delay=${delayBetweenBatches}ms`);

    // Connect to database
    await connectDB();

    // Get selected projects count
    const selectedProjectsCount = await Project.countDocuments({ status: "selected" });
    if (selectedProjectsCount === 0) {
      return NextResponse.json({
        success: true,
        message: "No selected projects found to send voting cards to",
        summary: {
          totalUsers: 0,
          sent: 0,
          failed: 0,
          skipped: 0,
          updatedInDatabase: 0,
        },
        details: {
          errors: [],
        },
      });
    }

    console.log(`Found ${selectedProjectsCount} selected projects for voting card emails`);

    // Send voting card emails to selected contestants using Resend
    const result = await sendVotingCardEmailsToSelectedWithResend({
      batchSize,
      delayBetweenBatches,
      updateDatabase,
    });

    // Determine overall success message
    let message = "";
    if (result.totalFailed > 0) {
      message = `Voting card emails sent with some failures. Sent: ${result.totalSent}, Failed: ${result.totalFailed}, Skipped: ${result.totalSkipped}`;
    } else if (result.totalSent === 0 && result.totalSkipped > 0) {
      message = `All selected contestants have already received voting card emails. Skipped: ${result.totalSkipped}`;
    } else if (result.totalSent === 0) {
      message = `No voting card emails were sent. Check if there are selected projects with valid candidates.`;
    } else {
      message = `Successfully sent voting card emails to ${result.totalSent} selected contestants`;
    }

    console.log("✅ Voting card email campaign completed");
    console.log(`📊 Results: Sent=${result.totalSent}, Failed=${result.totalFailed}, Skipped=${result.totalSkipped}`);

    return NextResponse.json({
      success: result.success,
      message,
      summary: {
        totalUsers: selectedProjectsCount,
        sent: result.totalSent,
        failed: result.totalFailed,
        skipped: result.totalSkipped,
        updatedInDatabase: result.updatedInDatabase || 0,
      },
      details: {
        errors: result.errors,
      },
    });

  } catch (error) {
    console.error("Critical error in voting card email endpoint:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Critical error occurred while sending voting card emails",
        summary: {
          totalUsers: 0,
          sent: 0,
          failed: 0,
          skipped: 0,
          updatedInDatabase: 0,
        },
        details: {
          errors: [
            {
              email: "system",
              error: error instanceof Error ? error.message : "Unknown error",
            },
          ],
        },
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check status
export async function GET() {
  try {
    await connectDB();

    // Get statistics
    const totalSelected = await Project.countDocuments({ status: "selected" });
    const votingCardEmailsSent = await Project.countDocuments({ 
      status: "selected", 
      votingCardEmailSent: true 
    });
    const votingCardEmailsPending = totalSelected - votingCardEmailsSent;
    
    return NextResponse.json({
      success: true,
      stats: {
        totalSelected,
        votingCardEmailsSent,
        votingCardEmailsPending,
        percentage: totalSelected > 0 
          ? Math.round((votingCardEmailsSent / totalSelected) * 100) 
          : 0,
        message: `${votingCardEmailsSent}/${totalSelected} selected projects have received voting card emails`,
      },
    });
  } catch (error) {
    console.error("Error fetching voting card email stats:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch statistics" 
      },
      { status: 500 }
    );
  }
}