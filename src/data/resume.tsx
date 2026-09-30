import { Icons } from "@/components/icons";
import { HomeIcon } from "lucide-react";
import rawPortfolioData from "./portfolio.json";
import { getPortfolioData, getPortfolioDataAsync } from "@/lib/portfolio-data";
import { getSkillIconComponent, renderProjectLinkIcon } from "@/lib/icon-helper";
import React from "react";

export interface SkillEntry {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface WorkEntry {
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

export interface EducationEntry {
  school: string;
  href: string;
  degree: string;
  logoUrl: string;
  start: string;
  end: string;
}

export interface ProjectEntry {
  title: string;
  href: string;
  dates: string;
  active: boolean;
  description: string;
  technologies: string[];
  image: string;
  video: string;
  links: {
    type: string;
    href: string;
    icon: React.ReactNode;
  }[];
}

export interface SocialEntry {
  name: string;
  url: string;
  icon: React.ComponentType<any>;
  navbar: boolean;
}

// Dynamically resolve icons for skills
export function resolveSkills(skills: any[]): SkillEntry[] {
  if (!Array.isArray(skills)) return [];
  return skills.map((skill) => ({
    name: skill.name || "",
    icon: getSkillIconComponent(skill.icon),
  }));
}

// Dynamically resolve links for projects
export function resolveProjects(projects: any[]): ProjectEntry[] {
  if (!Array.isArray(projects)) return [];
  return projects.map((p) => ({
    title: p.title || "",
    href: p.href || "",
    dates: p.dates || "",
    active: p.active ?? true,
    description: p.description || "",
    technologies: p.technologies || [],
    image: p.image || "",
    video: p.video || "",
    links: (p.links || []).map((l: any) => ({
      type: l.type || "",
      href: l.href || "#",
      icon: renderProjectLinkIcon(l.icon || l.type, "size-3"),
    })),
  }));
}

// Dynamically resolve social icons
export function resolveSocial(socialMap: Record<string, any>): Record<string, SocialEntry> {
  const result: Record<string, SocialEntry> = {};
  if (!socialMap) return result;

  for (const [key, val] of Object.entries(socialMap)) {
    let iconComp = Icons.globe;
    const lowerKey = (val.icon || key).toLowerCase();
    if (lowerKey === "github") iconComp = Icons.github;
    else if (lowerKey === "linkedin") iconComp = Icons.linkedin;
    else if (lowerKey === "leetcode") iconComp = Icons.leetcode;
    else if (lowerKey === "resume") iconComp = Icons.resume;
    else if (lowerKey === "email" || lowerKey === "mail") iconComp = Icons.email;
    else if (lowerKey === "x") iconComp = Icons.x;
    else if (lowerKey === "youtube") iconComp = Icons.youtube;

    result[key] = {
      name: val.name || key,
      url: val.url || "#",
      icon: iconComp,
      navbar: val.navbar ?? false,
    };
  }
  return result;
}

export interface ResumeData {
  name: string;
  initials: string;
  url: string;
  location: string;
  locationLink: string;
  description: string;
  summary: string;
  avatarUrl: string;
  skills: SkillEntry[];
  navbar: { href: string; icon: React.ComponentType<any>; label: string }[];
  contact: {
    email: string;
    tel: string;
    social: Record<string, SocialEntry>;
  };
  work: WorkEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  hackathons: any[];
  chatbot: {
    suggestions: string[];
    triviaFacts: string[];
  };
}

export function buildResumeData(pData: any): ResumeData {
  return {
    name: pData?.name || "Rishabh Tripathi",
    initials: pData?.initials || "RT",
    url: pData?.url || "https://rishabhtripathi.vercel.app",
    location: pData?.location || "New Delhi, India",
    locationLink: pData?.locationLink || "https://www.google.com/maps/place/newdelhi",
    description: pData?.description || "",
    summary: pData?.summary || "",
    avatarUrl: pData?.avatarUrl || "/image.png",
    skills: resolveSkills(pData?.skills),
    navbar: [
      { href: "/", icon: HomeIcon, label: "Home" },
    ],
    contact: {
      email: pData?.contact?.email || "rishabhtripathi2022@gmail.com",
      tel: pData?.contact?.tel || "+919650594608",
      social: resolveSocial(pData?.contact?.social || {}),
    },
    work: (pData?.work || []) as WorkEntry[],
    education: (pData?.education || []) as EducationEntry[],
    projects: resolveProjects(pData?.projects || []),
    hackathons: [],
    chatbot: {
      suggestions: pData?.chatbot?.suggestions || [],
      triviaFacts: pData?.chatbot?.triviaFacts || [],
    },
  };
}

export function getResumeData(): ResumeData {
  try {
    const liveData = getPortfolioData();
    if (liveData && liveData.projects) {
      return buildResumeData(liveData);
    }
  } catch (err) {
    console.warn("Could not load dynamic portfolio data, falling back to static:", err);
  }
  return buildResumeData(rawPortfolioData);
}


export async function getResumeDataAsync(): Promise<ResumeData> {
  try {
    const liveData = await getPortfolioDataAsync();
    if (liveData && liveData.projects) {
      return buildResumeData(liveData);
    }
  } catch (err) {
    console.warn("Could not load async portfolio data, falling back:", err);
  }
  return getResumeData();
}

export const DATA: ResumeData = buildResumeData(rawPortfolioData);