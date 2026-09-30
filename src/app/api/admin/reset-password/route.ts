import { NextRequest, NextResponse } from "next/server";
import {
  requestPasswordResetOtp,
  verifyOtpAndChangePassword,
  VERIFIED_ADMIN_EMAIL,
} from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, otp, newPassword } = body;

    // Strict security: only allow recovery for the verified email
    if (email && email.toLowerCase().trim() !== VERIFIED_ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          error: `Access Denied: Password reset is restricted strictly to the verified administrator email (${VERIFIED_ADMIN_EMAIL}).`,
        },
        { status: 403 }
      );
    }

    if (action === "request-otp") {
      const result = await requestPasswordResetOtp();
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.message },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        message: result.message,
        verifiedEmail: VERIFIED_ADMIN_EMAIL,
        mockMode: result.mockMode,
      });
    }

    if (action === "verify-otp") {
      if (!otp || !newPassword) {
        return NextResponse.json(
          { success: false, error: "Please provide both OTP and a new password." },
          { status: 400 }
        );
      }

      const result = verifyOtpAndChangePassword(otp, newPassword);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: result.message,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action specified." },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
