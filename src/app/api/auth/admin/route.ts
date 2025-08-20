
// app/api/admin/auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    const adminCode = process.env.ADMIN_CODE;

    if (!adminCode) {
      return NextResponse.json(
        { message: "Admin code not configured" },
        { status: 500 }
      );
    }

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { message: "Please enter a 6-digit code" },
        { status: 400 }
      );
    }

    if (code !== adminCode) {
      return NextResponse.json(
        { message: "Invalid admin code" },
        { status: 401 }
      );
    }

    // Set secure cookie for admin session
    const cookieStore = await cookies();
    cookieStore.set("admin-session", adminCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.json(
      { message: "Authentication successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
