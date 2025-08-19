import Enroll from "@/models/Enroll";
import Project from "@/models/Project";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const contestants = await Enroll.find({});
    const projects = await Project.find({});

    if (!contestants || !projects) {
      console.log("Stats are not complete");
      return NextResponse.json(
        {
          message: "Some stats are not available",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Fetch Successful",
        contestants: contestants.length,
        projects: projects.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "An unexpected error occurred",
        error,
      },
      {
        status: 500,
      }
    );
  }
}
