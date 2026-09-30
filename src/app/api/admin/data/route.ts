import { NextRequest, NextResponse } from "next/server";
import {
  getPortfolioData,
  savePortfolioData,
  PortfolioData,
} from "@/lib/portfolio-data";
import {
  verifyAdminPassword,
  verifySessionToken,
} from "@/lib/admin-auth";

function isAuthorized(req: NextRequest): boolean {
  const sessionToken = req.cookies.get("portfolio_admin_token")?.value;
  const headerPassword = req.headers.get("x-admin-password");

  if (sessionToken && verifySessionToken(sessionToken)) {
    return true;
  }
  if (headerPassword && verifyAdminPassword(headerPassword)) {
    return true;
  }
  return false;
}

export async function GET(req: NextRequest) {
  // Public GET can fetch portfolio data, or we can check auth for private fields
  const data = getPortfolioData();
  const authorized = isAuthorized(req);

  return NextResponse.json({
    success: true,
    data,
    isAuthorized: authorized,
  });
}

export async function POST(req: NextRequest) {
  try {
    const authorized = isAuthorized(req);
    const body = await req.json();

    // Check auth from body password as well
    const providedPass = body.password;
    const bodyAuthorized = providedPass && verifyAdminPassword(providedPass);

    if (!authorized && !bodyAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Valid admin credentials required." },
        { status: 401 }
      );
    }

    const { data } = body as { data: PortfolioData };

    if (!data || !data.projects || !Array.isArray(data.projects)) {
      return NextResponse.json(
        { success: false, error: "Invalid data payload structure." },
        { status: 400 }
      );
    }

    const saved = savePortfolioData(data);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: "Failed to write changes to portfolio storage." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Portfolio data updated successfully.",
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
