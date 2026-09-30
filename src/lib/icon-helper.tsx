import React from "react";
import { Icons } from "@/components/icons";
import { ReactLight } from "@/components/ui/svgs/reactLight";
import { NextjsIconDark } from "@/components/ui/svgs/nextjsIconDark";
import { Typescript } from "@/components/ui/svgs/typescript";
import { Nodejs } from "@/components/ui/svgs/nodejs";
import { Python } from "@/components/ui/svgs/python";
import { Golang } from "@/components/ui/svgs/golang";
import { Postgresql } from "@/components/ui/svgs/postgresql";
import { Docker } from "@/components/ui/svgs/docker";
import { Kubernetes } from "@/components/ui/svgs/kubernetes";
import { Java } from "@/components/ui/svgs/java";
import { Csharp } from "@/components/ui/svgs/csharp";
import {
  Code,
  Globe,
  Database,
  Cpu,
  Server,
  Layers,
  Sparkles,
  Terminal,
  FileCode,
  FolderGit2,
  Boxes,
  Flame,
  Zap,
} from "lucide-react";

export const AVAILABLE_SKILL_ICONS: { id: string; label: string }[] = [
  { id: "react", label: "React" },
  { id: "nextjs", label: "Next.js" },
  { id: "typescript", label: "TypeScript" },
  { id: "nodejs", label: "Node.js" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "csharp", label: "C++ / C#" },
  { id: "postgresql", label: "PostgreSQL" },
  { id: "docker", label: "Docker / MongoDB" },
  { id: "kubernetes", label: "Kubernetes" },
  { id: "golang", label: "Golang" },
  { id: "tailwindcss", label: "Tailwind CSS" },
  { id: "code", label: "Code Generic" },
  { id: "database", label: "Database Generic" },
  { id: "server", label: "Server / Backend" },
  { id: "cpu", label: "AI / ML / Compute" },
  { id: "terminal", label: "Terminal / CLI" },
  { id: "zap", label: "Zap / Fast" },
  { id: "flame", label: "Flame / Firebase" },
  { id: "layers", label: "Layers / Architecture" },
];

export function getSkillIconComponent(iconId?: string): React.ComponentType<{ className?: string }> {
  if (!iconId) return Code;
  const id = iconId.toLowerCase().trim();

  switch (id) {
    case "react":
      return ReactLight;
    case "nextjs":
    case "next.js":
    case "next":
      return NextjsIconDark;
    case "typescript":
    case "ts":
      return Typescript;
    case "nodejs":
    case "node":
    case "node.js":
      return Nodejs;
    case "python":
    case "py":
      return Python;
    case "java":
      return Java;
    case "c++":
    case "cpp":
    case "csharp":
    case "c#":
      return Csharp;
    case "postgres":
    case "postgresql":
    case "sql":
      return Postgresql;
    case "docker":
    case "mongodb":
    case "mongo":
      return Docker;
    case "kubernetes":
    case "k8s":
      return Kubernetes;
    case "golang":
    case "go":
      return Golang;
    case "tailwindcss":
    case "tailwind":
      return Icons.tailwindcss as any;
    case "github":
      return Icons.github as any;
    case "database":
      return Database;
    case "server":
      return Server;
    case "cpu":
    case "ai":
      return Cpu;
    case "terminal":
      return Terminal;
    case "zap":
      return Zap;
    case "flame":
      return Flame;
    case "layers":
      return Layers;
    case "globe":
      return Globe;
    default:
      return Code;
  }
}

export function renderProjectLinkIcon(iconName?: string, className = "size-3") {
  if (!iconName) return <Globe className={className} />;
  const name = iconName.toLowerCase().trim();

  switch (name) {
    case "github":
    case "source":
    case "code":
      return <Icons.github className={className} />;
    case "linkedin":
      return <Icons.linkedin className={className} />;
    case "leetcode":
      return <Icons.leetcode className={className} />;
    case "resume":
      return <Icons.resume className={className} />;
    case "email":
    case "mail":
      return <Icons.email className={className} />;
    case "youtube":
      return <Icons.youtube className={className} />;
    case "website":
    case "globe":
    default:
      return <Icons.globe className={className} />;
  }
}
