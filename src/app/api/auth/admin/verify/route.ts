// app/api/admin/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin-session");
    const adminCode = process.env.ADMIN_CODE;

    if (!adminSession || !adminCode) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (adminSession.value !== adminCode) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    return NextResponse.json(
      {
        message: "Authenticated",
        user: {
          role: "admin",
          authenticated: true,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
