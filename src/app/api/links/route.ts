import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "links.json"
);

function getLinksFromFile() {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      return [];
    }
    const fileContents = fs.readFileSync(DATA_FILE_PATH, "utf8");
    const links = JSON.parse(fileContents);
    return links.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error("Error reading links file:", error);
    return [];
  }
}

function saveLinksToFile(links: any[]) {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(links, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing links file:", error);
    return false;
  }
}

export async function GET(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const isPasswordProtected = !!adminPassword;

  if (isPasswordProtected) {
    const { searchParams } = new URL(request.url);
    const clientPassword = request.headers.get("x-admin-password") || searchParams.get("password");

    if (clientPassword !== adminPassword) {
      return NextResponse.json({
        success: true,
        links: [],
        isPasswordProtected,
        isAuthorized: false,
      });
    }
  }

  const links = getLinksFromFile();
  return NextResponse.json({
    success: true,
    links,
    isPasswordProtected,
    isAuthorized: true,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { links, password } = body;

    // Optional environment variable password protection
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminPassword && password !== adminPassword) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Invalid password." },
        { status: 401 }
      );
    }

    if (!Array.isArray(links)) {
      return NextResponse.json(
        { success: false, error: "Invalid data format. Expected an array of links." },
        { status: 400 }
      );
    }

    const saved = saveLinksToFile(links);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: "Failed to persist changes." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, links });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
