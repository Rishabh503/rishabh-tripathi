import fs from "fs";
import path from "path";

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

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "portfolio.json");

export function getPortfolioData(): PortfolioData {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const content = fs.readFileSync(DATA_FILE_PATH, "utf8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error reading portfolio.json:", error);
  }

  // Fallback defaults
  return {
    name: "Rishabh Tripathi",
    initials: "RT",
    url: "https://rishabhtripathi.vercel.app",
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
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error saving portfolio.json:", error);
    return false;
  }
}
