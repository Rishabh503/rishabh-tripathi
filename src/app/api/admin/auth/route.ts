import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminPassword,
  verifySessionToken,
  generateSessionToken,
  VERIFIED_ADMIN_EMAIL,
} from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get("portfolio_admin_token")?.value;
  const headerPassword = req.headers.get("x-admin-password");

  let isAuthenticated = false;

  if (sessionToken && verifySessionToken(sessionToken)) {
    isAuthenticated = true;
  } else if (headerPassword && verifyAdminPassword(headerPassword)) {
    isAuthenticated = true;
  }

  return NextResponse.json({
    authenticated: isAuthenticated,
    verifiedEmail: VERIFIED_ADMIN_EMAIL,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json(
        { success: false, error: "Invalid admin password. Access denied." },
        { status: 401 }
      );
    }

    const token = generateSessionToken(password);

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful.",
      token,
      verifiedEmail: VERIFIED_ADMIN_EMAIL,
    });

    // Save token in cookies for 7 days
    response.cookies.set("portfolio_admin_token", token, {
      httpOnly: false, // accessible to client context if needed, and sent automatically with fetch
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Authentication error." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  response.cookies.set("portfolio_admin_token", "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
