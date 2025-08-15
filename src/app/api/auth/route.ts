import Enroll from "@/models/Enroll";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    const { authToken } = data;
    console.log(authToken)

    if (!authToken) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const candidate = await Enroll.findOne({ authToken });
    console.log("Existing Enrollment:", candidate,authToken);

    if (!candidate) {
      return NextResponse.json(
        { message: "Candidate not found" },

        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Auth token verifird",
        candidate
       },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during enrollment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
