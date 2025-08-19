import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
      );

      // Set up interval to send vote updates
      const interval = setInterval(async () => {
        try {
          // Fetch latest vote counts
          const response = await fetch(
            `${process.env.NODE_ENV == "production"?"https://brandchallenge.conces.org/api/projects":"http://localhost:3000/api/projects/"}`
          );
          const data = await response.json();

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "update",
                votes: data.projects.map((p: any) => ({
                  id: p._id,
                  votes: p.vote,
                })),
              })}\n\n`
            )
          );
        } catch (error) {
          console.error("Error sending update:", error);
        }
      }, 5000); // Update every 5 seconds

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
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
