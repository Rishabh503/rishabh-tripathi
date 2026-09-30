import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { verifyAdminPassword, verifySessionToken } from "@/lib/admin-auth";

// Configure Cloudinary if environment variables exist
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
    secure: true,
  });
}

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
    const mimeType = file.type || "image/png";
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!validTypes.includes(mimeType) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
      return NextResponse.json(
        { success: false, error: "Invalid file format. Please upload JPG, PNG, WEBP, GIF, or SVG." },
        { status: 400 }
      );
    }

    // Limit file size (15MB max)
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 15MB limit." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const sanitizedFolder = folder === "uploads" ? "uploads" : "projects";
    const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;

    // 1. Cloudinary Integration (if configured in env)
    const isCloudinaryConfigured =
      (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET) ||
      !!process.env.CLOUDINARY_URL;

    if (isCloudinaryConfigured) {
      try {
        const uploadRes = await cloudinary.uploader.upload(base64Data, {
          folder: `portfolio_${sanitizedFolder}`,
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        });

        return NextResponse.json({
          success: true,
          url: uploadRes.secure_url,
          filename: uploadRes.public_id,
          provider: "cloudinary",
          message: "Uploaded to Cloudinary CDN successfully!",
        });
      } catch (cloudErr: any) {
        console.error("Cloudinary upload failed, falling back:", cloudErr);
      }
    }

    // 2. Local Filesystem Write (when running locally / with write permissions)
    const uploadDir = path.join(process.cwd(), "public", sanitizedFolder);
    const originalName = file.name;
    const ext = path.extname(originalName) || ".png";
    const baseName = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();
    const filename = `${baseName}_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);
    const relativeUrl = `/${sanitizedFolder}/${filename}`;

    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      fs.writeFileSync(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: relativeUrl,
        filename,
        provider: "local",
        message: "Image saved to local storage.",
      });
    } catch (fsErr) {
      // 3. Serverless Read-Only Fallback (Data URI)
      return NextResponse.json({
        success: true,
        url: base64Data,
        filename,
        provider: "base64",
        message: "Image processed as data URI for serverless runtime.",
      });
    }
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to upload file." },
      { status: 500 }
    );
  }
}


