import { getResumeDataAsync, DATA } from "@/data/resume";
import { getDbStorageItem } from "@/lib/db";
import defaultLinks from "@/data/links.json";
import LinksClient from "./links-client";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: `Links | ${DATA.name}`,
  description: `Connect with ${DATA.name} through social media and other platforms.`,
};

export default async function LinksPage() {
  const [links, resumeData] = await Promise.all([
    getDbStorageItem<any[]>("links", defaultLinks),
    getResumeDataAsync(),
  ]);
  
  const profile = {
    name: resumeData.name,
    avatarUrl: resumeData.avatarUrl,
    initials: resumeData.initials,
    description: resumeData.description,
  };

  return <LinksClient initialLinks={links} profile={profile} />;
}

