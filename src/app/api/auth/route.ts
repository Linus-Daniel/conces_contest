import Enroll from "@/models/Enroll";
import Project from "@/models/Project"; // ✅ Import Project model
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    const { authToken } = data;
    console.log(authToken);

    if (!authToken) {
      return NextResponse.json(
        { error: "Auth token is required" },
        { status: 400 }
      );
    }

    const candidate = await Enroll.findOne({ authToken });
    console.log("Existing Enrollment:", candidate, authToken);

    if (!candidate) {
      return NextResponse.json(
        { message: "Candidate not found" },
        { status: 404 }
      );
    }

    // ✅ Check if candidate has submitted a project
    const existingProject = await Project.findOne({
      candidate: candidate._id,
    }).lean();

    // ✅ Add project submission status to response
    const responseData = {
      message: "Auth token verified",
      candidate: {
        ...candidate.toObject(),
        hasSubmittedProject: !!existingProject, // Boolean flag
        projectStatus: existingProject?.status || null, // Project status if exists
        projectId: existingProject?._id || null, // Project ID if exists
      },
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error during auth verification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
