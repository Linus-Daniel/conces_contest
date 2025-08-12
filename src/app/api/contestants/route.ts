import Enroll from "@/models/Enroll";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET(req: NextRequest, res: NextResponse) {
  await connectDB();

  try {
    const data = await Enroll.find({});
    if (!data) {
      console.log("No Enrollmennt found");
      return NextResponse.json({ message: "No Data found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.log(error);
  }
}
