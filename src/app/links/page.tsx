import fs from "fs";
import path from "path";
import { DATA } from "@/data/resume";
import LinksClient from "./links-client";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Links | ${DATA.name}`,
  description: `Connect with ${DATA.name} through social media and other platforms.`,
};

function getLinks() {
  const filePath = path.join(process.cwd(), "src", "data", "links.json");
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const fileContents = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Error reading links file on server:", error);
    return [];
  }
}

export default async function LinksPage() {
  const links = getLinks();
  
  const profile = {
    name: DATA.name,
    avatarUrl: DATA.avatarUrl,
    initials: DATA.initials,
    description: DATA.description,
  };

  return <LinksClient initialLinks={links} profile={profile} />;
}
