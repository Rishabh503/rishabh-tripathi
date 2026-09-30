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

let linksMemoryCache: any[] | null = null;
const TMP_LINKS_PATH = path.join("/tmp", "links_cache.json");

function getLinksFromFile() {
  if (linksMemoryCache && linksMemoryCache.length > 0) {
    return linksMemoryCache;
  }

  try {
    if (fs.existsSync(TMP_LINKS_PATH)) {
      const fileContents = fs.readFileSync(TMP_LINKS_PATH, "utf8");
      const links = JSON.parse(fileContents);
      if (Array.isArray(links) && links.length > 0) {
        linksMemoryCache = links;
        return links.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      }
    }
  } catch (err) {
    // ignore tmp read error
  }

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
    linksMemoryCache = links;
    return links.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error("Error reading links file:", error);
    return DEFAULT_LINKS;
  }
}

function saveLinksToFile(links: any[]) {
  linksMemoryCache = links;

  // Sync to GitHub repo if GITHUB_TOKEN is available
  const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const repo = process.env.GITHUB_REPO || "Rishabh503/rishabh-tripathi";
  if (githubToken) {
    syncToGitHub(repo, "src/data/links.json", JSON.stringify(links, null, 2), githubToken).catch((e) =>
      console.warn("GitHub links sync warning:", e)
    );
  }

  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(links, null, 2), "utf8");
    return true;
  } catch (error) {
    try {
      if (!fs.existsSync("/tmp")) {
        fs.mkdirSync("/tmp", { recursive: true });
      }
      fs.writeFileSync(TMP_LINKS_PATH, JSON.stringify(links, null, 2), "utf8");
      return true;
    } catch (tmpErr) {
      console.warn("Could not write links to /tmp, kept in memory:", tmpErr);
      return true;
    }
  }
}

async function syncToGitHub(repo: string, filePath: string, content: string, token: string) {
  try {
    const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    let sha: string | undefined;
    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    }

    await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `chore: update ${filePath} from admin control hub`,
        content: Buffer.from(content).toString("base64"),
        sha,
      }),
    });
  } catch (err) {
    console.warn("Error during GitHub auto-commit for links:", err);
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

