import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";

let lastVoteUpdate = 0;
let cachedVoteData: any = null;

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
      );

      // Set up interval to send vote updates with caching
      const interval = setInterval(async () => {
        try {
          const now = Date.now();
          
          // Only fetch from DB if we don't have recent cached data (cache for 30 seconds)
          if (!cachedVoteData || now - lastVoteUpdate > 30000) {
            await connectDB();
            
            // Only fetch vote counts, not full project data
            const projects = await Project.find({}, { _id: 1, vote: 1 })
              .populate("candidate", "isQualified")
              .lean();
            
            const qualifiedProjects = projects.filter(
              (project: any) => project.candidate?.isQualified === true
            );
            
            cachedVoteData = {
              votes: qualifiedProjects.map((p: any) => ({
                id: p._id.toString(),
                votes: p.vote || 0,
              })),
              totalVotes: qualifiedProjects.reduce((sum: number, p: any) => sum + (p.vote || 0), 0),
              timestamp: new Date().toISOString(),
            };
            lastVoteUpdate = now;
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "update",
                ...cachedVoteData,
              })}\n\n`
            )
          );
        } catch (error) {
          console.error("Error sending update:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message: "Failed to fetch vote updates",
              })}\n\n`
            )
          );
        }
      }, 10000); // Update every 10 seconds (reduced frequency)

      // Clean up on close
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
