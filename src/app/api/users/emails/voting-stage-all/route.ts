// /api/users/emails/voting-stage-all/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Enroll from "@/models/Enroll";
import { sendVotingStageEmail } from "@/lib/email/emailService";
import Project from "@/models/Project";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      batchSize = 15, 
      delayBetweenBatches = 2000,
      updateDatabase = true 
    } = body;

    console.log("📧 Starting bulk voting stage email send...");
    console.log(`Configuration: batchSize=${batchSize}, delay=${delayBetweenBatches}ms, updateDB=${updateDatabase}`);

    // Connect to database
    await connectDB();

    // Get all qualified enrollees who haven't received voting stage email
    const query = updateDatabase 
      ? { 
          isQualified: true, 
          receivedQualifiedEmail: { $ne: true } 
        }
      : { 
          isQualified: true 
        };

    const enrollees = await Project.find({status:"selected"})
      .populate("candidate"," fullName email receivedQualifiedEmail")
      .lean();

    if (enrollees.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No qualified candidates found who need voting stage emails",
        summary: {
          totalUsers: 0,
          sent: 0,
          failed: 0,
          skipped: 0,
        },
        details: {
          errors: [],
        },
      });
    }

    console.log(`Found ${enrollees.length} qualified candidates for voting stage emails`);

    // Track results
    const result = {
      success: true,
      message: "",
      summary: {
        totalUsers: enrollees.length,
        sent: 0,
        failed: 0,
        skipped: 0,
        updatedInDatabase: 0,
      },
      details: {
        errors: [] as Array<{ email: string; error: string; userId: string }>,
        updatedUserIds: [] as string[],
      },
    };

    // Process in batches
    for (let i = 0; i < enrollees.length; i += batchSize) {
      const batch = enrollees.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(enrollees.length / batchSize);
      
      console.log(`Processing batch ${batchNumber}/${totalBatches}`);

      // Process batch concurrently
      const batchPromises = batch.map(async (enrollee) => {
        try {
          // Skip if already sent (double-check)
          if (updateDatabase && enrollee.candidate?.receivedQualifiedEmail) {
            result.summary.skipped++;
            console.log(`⏩ Skipping ${enrollee.candidate.email} - already sent`);
            return { 
              success: false, 
              skipped: true, 
              email: enrollee.candidate.email,
              userId: enrollee.candidate._id.toString()
            };
          }

          // Extract first name
          const firstName = enrollee.candidate.fullName.split(" ")[0];

          // Send the email
          const emailSent = await sendVotingStageEmail({
            email: enrollee.candidate.email,
            firstName: firstName,
          });

          if (emailSent) {
            result.summary.sent++;
            console.log(`✅ Voting stage email sent to ${enrollee.candidate.email}`);

            // Update database if enabled
            if (updateDatabase) {
              try {
                await Enroll.findByIdAndUpdate(
                  enrollee.candidate._id,
                  { 
                    receivedQualifiedEmail: true,
                    receivedQualifiedEmailAt: new Date()
                  }
                );
                result.summary.updatedInDatabase++;
                result.details.updatedUserIds.push(enrollee.candidate._id.toString());
                console.log(`📝 Database updated for ${enrollee.candidate.email}`);
              } catch (dbError) {
                console.error(`Failed to update DB for ${enrollee.candidate.email}:`, dbError);
                // Email sent but DB update failed - log but don't fail the whole operation
              }
            }

            return { 
              success: true, 
              email: enrollee.candidate.email,
              userId: enrollee.candidate._id.toString()
            };
          } else {
            throw new Error("Email service returned false");
          }
        } catch (error) {
          result.summary.failed++;
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          
          result.details.errors.push({
            email: enrollee.candidate.email,
            error: errorMessage,
            userId: enrollee.candidate._id.toString(),
          });
          
          console.error(`❌ Failed to send to ${enrollee.candidate.email}:`, errorMessage);
          
          return { 
            success: false, 
            email: enrollee.candidate.email, 
            error: errorMessage,
            userId: enrollee.candidate._id.toString()
          };
        }
      });

      // Wait for batch to complete
      await Promise.allSettled(batchPromises);

      // Add delay between batches (except for last batch)
      if (i + batchSize < enrollees.length) {
        console.log(`⏳ Waiting ${delayBetweenBatches}ms before next batch...`);
        await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
      }
    }

    // Determine overall success
    if (result.summary.failed > 0) {
      result.success = false;
      result.message = `Voting stage emails sent with some failures. Sent: ${result.summary.sent}, Failed: ${result.summary.failed}`;
    } else if (result.summary.sent === 0 && result.summary.skipped > 0) {
      result.message = `All qualified candidates have already received emails. Skipped: ${result.summary.skipped}`;
    } else {
      result.message = `Successfully sent emails to ${result.summary.sent} qualified candidates`;
    }

    console.log("✅ Voting stage email campaign completed");
    console.log(`📊 Results: Sent=${result.summary.sent}, Failed=${result.summary.failed}, Skipped=${result.summary.skipped}`);
    if (updateDatabase) {
      console.log(`📝 Database updated for ${result.summary.updatedInDatabase} users`);
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Critical error in voting stage email endpoint:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Critical error occurred while sending voting stage emails",
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
              userId: "system",
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
    const totalQualified = await Enroll.countDocuments({ isQualified: true });
    const qualifiedEmailsSent = await Enroll.countDocuments({ 
      isQualified: true, 
      receivedQualifiedEmail: true 
    });
    const qualifiedEmailsPending = totalQualified - qualifiedEmailsSent;

    return NextResponse.json({
      success: true,
      stats: {
        totalQualified,
        qualifiedEmailsSent,
        qualifiedEmailsPending,
        percentage: totalQualified > 0 
          ? Math.round((qualifiedEmailsSent / totalQualified) * 100) 
          : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching voting stage email stats:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch statistics" 
      },
      { status: 500 }
    );
  }
}