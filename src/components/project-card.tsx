/* eslint-disable @next/next/no-img-element */
"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Markdown from "react-markdown";

function normalizeImagePath(src?: string): string {
  if (!src) return "";
  if (src.startsWith("./")) return src.substring(1);
  return src;
}

function ProjectImage({ src, alt }: { src: string; alt: string }) {
  const [imageError, setImageError] = useState(false);
  const normalizedSrc = normalizeImagePath(src);

  if (!normalizedSrc || imageError) {
    return (
      <div className="w-full h-48 bg-muted/30 flex items-center justify-center text-xs text-muted-foreground border-b border-border/60">
        No Preview Available
      </div>
    );
  }

  return (
    <div className="relative w-full bg-muted/40 p-2.5 sm:p-3 pb-0 border-b border-border/60">
      <div className="relative w-full rounded-t-xl overflow-hidden border border-border/80 bg-card shadow-xs group-hover:shadow-md transition-shadow">
        {/* Browser Mockup Top Bar */}
        <div className="h-6 px-2.5 bg-muted/80 border-b border-border/60 flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-rose-500/70" />
            <span className="size-2 rounded-full bg-amber-500/70" />
            <span className="size-2 rounded-full bg-emerald-500/70" />
          </div>
          <div className="text-[9px] font-mono text-muted-foreground/60 truncate max-w-[140px]">
            {alt}
          </div>
          <div className="w-8" />
        </div>

        {/* Clean, Framed Screenshot */}
        <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-background">
          <img
            src={normalizedSrc}
            alt={alt}
            className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300 ease-out"
            onError={() => setImageError(true)}
          />
        </div>
      </div>
    </div>
  );
}

interface Props {
  title: string;
  href?: string;
  description: string;
  dates: string;
  tags: readonly string[];
  link?: string;
  image?: string;
  video?: string;
  links?: readonly {
    icon: React.ReactNode;
    type: string;
    href: string;
  }[];
  className?: string;
}

function isDirectVideo(url?: string): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)($|\?)/i.test(url) || url.startsWith("data:video");
}

export function ProjectCard({
  title,
  href,
  description,
  dates,
  tags,
  link,
  image,
  video,
  links,
  className,
}: Props) {
  const hasDirectVideo = isDirectVideo(video);
  const primaryLink = href || video || "#";

  return (
    <div
      className={cn(
        "group flex flex-col h-full border border-border/80 bg-card rounded-2xl overflow-hidden hover:border-border hover:shadow-xl hover:ring-1 hover:ring-border transition-all duration-300",
        className
      )}
    >
      {/* Project Media Container with Window Mockup */}
      <div className="relative w-full overflow-hidden shrink-0">
        <Link
          href={primaryLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full overflow-hidden"
        >
          {hasDirectVideo ? (
            <div className="relative w-full bg-muted/40 p-2.5 sm:p-3 pb-0 border-b border-border/60">
              <div className="relative w-full rounded-t-xl overflow-hidden border border-border/80 bg-card shadow-xs">
                <div className="h-6 px-2.5 bg-muted/80 border-b border-border/60 flex items-center justify-between select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-rose-500/70" />
                    <span className="size-2 rounded-full bg-amber-500/70" />
                    <span className="size-2 rounded-full bg-emerald-500/70" />
                  </div>
                  <div className="text-[9px] font-mono text-muted-foreground/60 truncate max-w-[140px]">
                    {title}
                  </div>
                  <div className="w-8" />
                </div>
                <video
                  src={video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-44 sm:h-48 object-cover object-top group-hover:scale-[1.02] transition-transform duration-300 ease-out"
                />
              </div>
            </div>
          ) : image ? (
            <ProjectImage src={image} alt={title} />
          ) : (
            <div className="w-full h-48 bg-muted/30 flex items-center justify-center text-xs text-muted-foreground border-b border-border/60">
              No Preview
            </div>
          )}
        </Link>
      </div>

      {/* Project Info Body */}
      <div className="p-5 sm:p-6 flex flex-col gap-3.5 flex-1">
        {/* Title and Date Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            {dates && (
              <time className="text-xs font-mono text-muted-foreground">{dates}</time>
            )}
          </div>
          <Link
            href={primaryLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            aria-label={`Open ${title}`}
          >
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>

        {/* Markdown Description */}
        <div className="text-xs sm:text-sm flex-1 prose max-w-full text-pretty font-sans leading-relaxed text-muted-foreground dark:prose-invert">
          <Markdown>{description}</Markdown>
        </div>

        {/* Tech Stack Badges */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag) => (
              <Badge
                key={tag}
                className="text-[10px] sm:text-[11px] font-medium border border-border/70 bg-background/60 text-muted-foreground px-2 py-0.5"
                variant="outline"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Action Link Buttons (Website, Source, Demo, etc.) */}
        {links && links.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/50 mt-auto">
            {links.map((actionLink, idx) => (
              <Link
                href={actionLink.href}
                key={idx}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-foreground text-background hover:opacity-90 active:scale-95 transition-all shadow-2xs hover:shadow-xs"
              >
                {actionLink.icon}
                <span>{actionLink.type}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
