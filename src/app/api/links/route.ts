import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyAdminPassword, verifySessionToken } from "@/lib/admin-auth";

const DATA_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "links.json"
);

const DEFAULT_LINKS = [
  {
    id: "github",
    title: "GitHub",
    url: "https://github.com/Rishabh503",
    icon: "github",
    isEnabled: true,
    order: 1,
  },
  {
    id: "leetcode",
    title: "LeetCode",
    url: "https://leetcode.com/u/Rishabh2906/",
    icon: "leetcode",
    isEnabled: true,
    order: 2,
  },
  {
    id: "portfolio",
    title: "Portfolio Website",
    url: "https://rishabh-tripathi-xi.vercel.app/",
    icon: "globe",
    isEnabled: true,
    order: 3,
  },
  {
    id: "resume",
    title: "Resume",
    url: "https://drive.google.com/file/d/1PReRNpW5eE_1fltAQ_gN_dgKUgVPAL7z/view?usp=drive_link",
    icon: "resume",
    isEnabled: true,
    order: 4,
  },
  {
    id: "linkedin",
    title: "LinkedIn",
    url: "https://www.linkedin.com/in/rishabh-tripathi-9985aa319/",
    icon: "linkedin",
    isEnabled: true,
    order: 5,
  },
  {
    id: "email",
    title: "Contact Email",
    url: "mailto:rishabhtripathi2022@gmail.com",
    icon: "email",
    isEnabled: true,
    order: 6,
  },
];

function getLinksFromFile() {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      saveLinksToFile(DEFAULT_LINKS);
      return DEFAULT_LINKS;
    }
    const fileContents = fs.readFileSync(DATA_FILE_PATH, "utf8");
    const links = JSON.parse(fileContents);
    if (!Array.isArray(links) || links.length === 0) {
      saveLinksToFile(DEFAULT_LINKS);
      return DEFAULT_LINKS;
    }
    return links.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error("Error reading links file:", error);
    return DEFAULT_LINKS;
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

export async function GET(request: NextRequest) {
  const links = getLinksFromFile();
  const authorized = isAuthorized(request);

  return NextResponse.json({
    success: true,
    links,
    isAuthorized: authorized,
  });
}

export async function POST(request: NextRequest) {
  try {
    const authorized = isAuthorized(request);
    const body = await request.json();
    const { links, password } = body;

    // Check body password if session cookie / header password wasn't set
    const bodyAuthorized = password && verifyAdminPassword(password);

    if (!authorized && !bodyAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Invalid password or expired session." },
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

