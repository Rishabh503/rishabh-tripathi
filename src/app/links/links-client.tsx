"use client";

import { motion } from "motion/react";
import { Icons } from "@/components/icons";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  isEnabled: boolean;
  order: number;
}

interface LinksClientProps {
  initialLinks: LinkItem[];
  profile: {
    name: string;
    avatarUrl: string;
    initials: string;
    description: string;
  };
}

function getIcon(iconName: string) {
  const name = iconName.toLowerCase();
  switch (name) {
    case "github":
      return <Icons.github className="size-5" />;
    case "linkedin":
      return <Icons.linkedin className="size-5" />;
    case "leetcode":
      return <Icons.leetcode className="size-5" />;
    case "resume":
      return <Icons.resume className="size-5" />;
    case "email":
    case "mail":
      return <Icons.email className="size-5" />;
    default:
      return <Icons.globe className="size-5" />;
  }
}

// Brand-specific gradient classes for hover borders/backgrounds
function getBrandStyle(iconName: string) {
  const name = iconName.toLowerCase();
  switch (name) {
    case "github":
      return "hover:border-neutral-500 dark:hover:border-neutral-400 hover:shadow-[0_0_15px_rgba(115,115,115,0.2)]";
    case "linkedin":
      return "hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]";
    case "email":
    case "mail":
      return "hover:border-rose-500 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]";
    case "leetcode":
      return "hover:border-amber-500 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]";
    case "resume":
      return "hover:border-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]";
    default:
      return "hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]";
  }
}

export default function LinksClient({ initialLinks, profile }: LinksClientProps) {
  // Only show enabled links
  const activeLinks = initialLinks
    .filter((l) => l.isEnabled)
    .sort((a, b) => a.order - b.order);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } },
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto min-h-[80vh] py-8 px-4">
      {/* Header Info */}
      <div className="flex flex-col items-center text-center mb-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
          className="mb-4"
        >
          <Avatar className="size-24 md:size-28 border shadow-lg ring-4 ring-muted">
            <AvatarImage alt={profile.name} src={profile.avatarUrl} />
            <AvatarFallback>{profile.initials}</AvatarFallback>
          </Avatar>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          {profile.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-3 text-sm sm:text-base text-muted-foreground max-w-sm leading-relaxed"
        >
          {profile.description}
        </motion.p>
      </div>

      {/* Links List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full space-y-4"
      >
        {activeLinks.map((link) => {
          const brandStyle = getBrandStyle(link.icon);
          return (
            <motion.div key={link.id} variants={itemVariants}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-4 rounded-2xl border bg-card/60 backdrop-blur-md transition-all duration-300 group ${brandStyle}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="text-foreground/80 group-hover:scale-110 transition-transform duration-300">
                    {getIcon(link.icon)}
                  </div>
                  <span className="font-medium text-foreground/90 group-hover:text-foreground text-sm sm:text-base transition-colors">
                    {link.title}
                  </span>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
              </a>
            </motion.div>
          );
        })}

        {activeLinks.length === 0 && (
          <motion.div
            variants={itemVariants}
            className="text-center py-12 border border-dashed rounded-2xl text-muted-foreground"
          >
            No active links. Add some in the admin panel!
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
