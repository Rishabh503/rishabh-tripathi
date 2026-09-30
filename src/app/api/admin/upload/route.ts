import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyAdminPassword, verifySessionToken } from "@/lib/admin-auth";

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

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Admin authentication required." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "projects";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided." },
        { status: 400 }
      );
    }

    // Validate file type
    const mimeType = file.type;
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!validTypes.includes(mimeType) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
      return NextResponse.json(
        { success: false, error: "Invalid file format. Please upload JPG, PNG, WEBP, GIF, or SVG." },
        { status: 400 }
      );
    }

    // Limit file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 10MB limit." },
        { status: 400 }
      );
    }

    // Target upload directory
    const sanitizedFolder = folder === "uploads" ? "uploads" : "projects";
    const uploadDir = path.join(process.cwd(), "public", sanitizedFolder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Create safe unique filename
    const originalName = file.name;
    const ext = path.extname(originalName) || ".png";
    const baseName = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();
    const filename = `${baseName}_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/${sanitizedFolder}/${filename}`;

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      filename,
      message: "Image uploaded successfully.",
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to upload file." },
      { status: 500 }
    );
  }
}
