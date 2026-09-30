import rawDefaultPortfolio from "@/data/portfolio.json";
import { getDbStorageItem, setDbStorageItem } from "@/lib/db";


export interface ProjectLink {
  type: string;
  href: string;
  icon?: string;
}

export interface ProjectItem {
  id?: string;
  title: string;
  href?: string;
  dates: string;
  active: boolean;
  description: string;
  technologies: string[];
  image?: string;
  video?: string;
  links: ProjectLink[];
}

export interface SkillItem {
  name: string;
  icon: string;
}

export interface WorkItem {
  company: string;
  href: string;
  badges?: string[];
  location: string;
  title: string;
  logoUrl: string;
  start: string;
  end?: string;
  description: string;
}

export interface EducationItem {
  school: string;
  href: string;
  degree: string;
  logoUrl: string;
  start: string;
  end: string;
}

export interface SocialItem {
  name: string;
  url: string;
  icon?: string;
  navbar?: boolean;
}

export interface PortfolioData {
  name: string;
  initials: string;
  url: string;
  location: string;
  locationLink: string;
  description: string;
  summary: string;
  avatarUrl: string;
  skills: SkillItem[];
  contact: {
    email: string;
    tel: string;
    social: Record<string, SocialItem>;
  };
  work: WorkItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  chatbot: {
    suggestions: string[];
    triviaFacts: string[];
  };
}

// In-memory runtime cache for serverless environments
let memoryCache: PortfolioData | null = null;

function getFsAndPath() {
  try {
    if (typeof window === "undefined" && typeof process !== "undefined" && process.versions?.node) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("fs");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require("path");
      return { fs, path };
    }
  } catch (e) {
    // Edge or browser runtime
  }
  return null;
}

export function getPortfolioData(): PortfolioData {
  // 1. Check in-memory cache
  if (memoryCache) {
    return memoryCache;
  }

  const nodeModules = getFsAndPath();
  if (nodeModules) {
    const { fs, path } = nodeModules;
    const TMP_FILE_PATH = path.join("/tmp", "portfolio_cache.json");
    const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "portfolio.json");

    // 2. Check /tmp cache (if available)
    try {
      if (fs.existsSync(TMP_FILE_PATH)) {
        const tmpContent = fs.readFileSync(TMP_FILE_PATH, "utf8");
        const parsed = JSON.parse(tmpContent);
        memoryCache = parsed;
        return parsed;
      }
    } catch (err) {
      // ignore tmp read error
    }

    // 3. Check persistent static file
    try {
      if (fs.existsSync(DATA_FILE_PATH)) {
        const content = fs.readFileSync(DATA_FILE_PATH, "utf8");
        const parsed = JSON.parse(content);
        memoryCache = parsed;
        return parsed;
      }
    } catch (error) {
      console.error("Error reading portfolio.json:", error);
    }
  }

  // Fallback to static imported json
  return (rawDefaultPortfolio as unknown as PortfolioData) || {
    name: "Rishabh Tripathi",
    initials: "RT",
    url: "https://rishabh-tripathi-xi.vercel.app",
    location: "New Delhi, India",
    locationLink: "https://www.google.com/maps/place/newdelhi",
    description: "B.Tech Student & Full-Stack Developer passionate about building AI-powered applications.",
    summary: "I'm a Computer Science and Technology student at MAIT, Delhi, with a passion for building AI agents and full-stack applications.",
    avatarUrl: "/image.png",
    skills: [],
    contact: {
      email: "rishabhtripathi2022@gmail.com",
      tel: "+919650594608",
      social: {},
    },
    work: [],
    education: [],
    projects: [],
    chatbot: {
      suggestions: [],
      triviaFacts: [],
    },
  };
}

export function savePortfolioData(data: PortfolioData): boolean {
  memoryCache = data;

  // 1. If GitHub Token is available, sync to GitHub repository in the background
  const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const repo = process.env.GITHUB_REPO || "Rishabh503/rishabh-tripathi";
  if (githubToken) {
    syncToGitHub(repo, "src/data/portfolio.json", JSON.stringify(data, null, 2), githubToken).catch((e) =>
      console.warn("GitHub auto-sync warning:", e)
    );
  }

  const nodeModules = getFsAndPath();
  if (nodeModules) {
    const { fs, path } = nodeModules;
    const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "portfolio.json");
    const TMP_FILE_PATH = path.join("/tmp", "portfolio_cache.json");

    // 2. Try writing to local project directory
    try {
      const dir = path.dirname(DATA_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
      return true;
    } catch (error) {
      // 3. Fallback to /tmp filesystem for serverless runtimes
      try {
        if (!fs.existsSync("/tmp")) {
          fs.mkdirSync("/tmp", { recursive: true });
        }
        fs.writeFileSync(TMP_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
        return true;
      } catch (tmpErr) {
        console.warn("Could not write to /tmp cache, retained in memoryCache:", tmpErr);
        return true;
      }
    }
  }

  return true;
}

export async function getPortfolioDataAsync(): Promise<PortfolioData> {
  const defaultData = getPortfolioData();
  try {
    const dbData = await getDbStorageItem<PortfolioData>("portfolio", defaultData);
    if (dbData && dbData.projects) {
      memoryCache = dbData;
      return dbData;
    }
  } catch (err) {
    console.warn("Could not fetch from Neon DB:", err);
  }
  return defaultData;
}

export async function savePortfolioDataAsync(data: PortfolioData): Promise<boolean> {
  savePortfolioData(data);
  try {
    const savedToDb = await setDbStorageItem("portfolio", data);
    if (savedToDb) {
      console.log("[NeonDB] Portfolio saved successfully to cloud database.");
    }
  } catch (err) {
    console.warn("Could not save to Neon DB:", err);
  }
  return true;
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

    const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
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

    if (!putRes.ok) {
      const errText = await putRes.text();
      console.warn("Failed to commit changes to GitHub repo:", errText);
    }
  } catch (err) {
    console.warn("Error during GitHub auto-commit:", err);
  }
}

