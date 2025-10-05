import Project from "@/models/Project";
import { connectDB } from "@/lib/mongodb";
import Enroll, { IEnroll } from "@/models/Enroll";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const enroll = await Enroll.find();
    const project = await Project.findById(id).populate<{ candidate: IEnroll }>(
      "candidate",
      "_id fullName institution isQualified department email avatar matricNumber phone"
    );
    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }
    return NextResponse.json({project}, { status: 200 });
  } catch (error) {
    console.error("Error fetching project:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
