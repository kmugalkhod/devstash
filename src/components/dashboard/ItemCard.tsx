"use client";

import type { LucideProps } from "lucide-react";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link as LinkIcon,
  File,
  Image,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { getRelativeTime } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link: LinkIcon,
  File,
  Image,
};

interface ItemCardProps {
  title: string;
  content: string | null;
  typeName: string;
  typeIcon: string;
  typeColor: string;
  isFavorite: boolean;
  tags: string[];
  createdAt: string;
}

export function ItemCard({
  title,
  content,
  typeName,
  typeIcon,
  typeColor,
  isFavorite,
  tags,
  createdAt,
}: ItemCardProps) {
  const Icon = iconMap[typeIcon];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-5"
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: typeColor,
      }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {Icon && (
              <Icon className="size-4" style={{ color: typeColor }} />
            )}
            <span
              className="text-xs font-bold uppercase tracking-wide"
              style={{ color: typeColor }}
            >
              {typeName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isFavorite && (
              <Star className="size-3.5 fill-yellow-500 text-yellow-500" />
            )}
            <span
              className="text-xs text-muted-foreground"
              suppressHydrationWarning
            >
              {getRelativeTime(createdAt)}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-4 font-bold text-foreground">{title}</h3>

        {/* Content preview */}
        {content && (
          <div className="mt-4 rounded-lg bg-black/30 px-4 py-3">
            <p className="line-clamp-3 font-mono text-xs leading-relaxed text-muted-foreground/70">
              {content}
            </p>
          </div>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
