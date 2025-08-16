// app/api/contestants/[id]/qualification/route.ts
import { NextRequest, NextResponse } from "next/server";
import Enroll from "@/models/Enroll";
import { connectDB } from "@/lib/mongodb";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { isQualified } = await request.json();
    const { id } = params;

    // Validate input
    if (typeof isQualified !== "boolean") {
      return NextResponse.json(
        { error: "Invalid qualification status" },
        { status: 400 }
      );
    }

    // Update the contestant's qualification status
    const updatedContestant = await Enroll.findByIdAndUpdate(
      id,
      {
        isQualified,
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedContestant) {
      return NextResponse.json(
        { error: "Contestant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedContestant._id,
        fullName: updatedContestant.fullName,
        email: updatedContestant.email,
        isQualified: updatedContestant.isQualified,
        updatedAt: updatedContestant.updatedAt,
      },
      message: `Contestant ${
        isQualified ? "qualified" : "disqualified"
      } successfully`,
    });
  } catch (error) {
    console.error("Error updating qualification status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: GET route to fetch single contestant qualification status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    const contestant = await Enroll.findById(
      id,
      "fullName email isQualified updatedAt"
    );

    if (!contestant) {
      return NextResponse.json(
        { error: "Contestant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contestant,
    });
  } catch (error) {
    console.error("Error fetching contestant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
