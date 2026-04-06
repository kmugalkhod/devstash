"use client";

import { useState } from "react";
import { Check, Copy, Star, Pin } from "lucide-react";
import { getRelativeTime } from "@/lib/utils";
import { iconMap } from "@/lib/icons";

interface ItemCardListProps {
  title: string;
  content: string | null;
  typeName: string;
  typeIcon: string;
  typeColor: string;
  isFavorite: boolean;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  onClick?: () => void;
}

export function ItemCardList({
  title,
  content,
  typeName,
  typeIcon,
  typeColor,
  isFavorite,
  isPinned,
  tags,
  createdAt,
  onClick,
}: ItemCardListProps) {
  const [copied, setCopied] = useState(false);
  const Icon = iconMap[typeIcon];

  async function handleQuickCopy(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer items-center gap-5 rounded-xl border border-border bg-card px-6 py-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-white/5"
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: typeColor,
      }}
    >
      {/* Type badge */}
      <div className="flex w-28 shrink-0 items-center gap-1.5">
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

      {/* Title + Favorite */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <h3 className="truncate font-bold text-foreground">
          {title}
        </h3>
        {isFavorite && (
          <Star className="size-3.5 shrink-0 fill-yellow-500 text-yellow-500" />
        )}
        {isPinned && (
          <Pin className="size-3.5 shrink-0 fill-foreground text-foreground" />
        )}
      </div>

      {/* Content preview */}
      {content && (
        <div className="hidden min-w-0 flex-1 lg:block">
          <div className="rounded-lg bg-zinc-900/50 px-4 py-2">
            <p className="truncate font-mono text-xs text-zinc-300">
              {content}
            </p>
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/5 bg-white/10 px-2.5 py-0.5 text-xs font-medium text-zinc-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Time */}
      {content && (
        <button
          type="button"
          onClick={handleQuickCopy}
          className="rounded-md p-1 text-zinc-400 opacity-0 transition hover:bg-zinc-800/70 hover:text-zinc-100 group-hover:opacity-100 focus-visible:opacity-100"
          title={copied ? "Copied" : "Copy content"}
          aria-label={copied ? "Copied" : "Copy content"}
        >
          {copied ? (
            <Check className="size-3.5 text-green-400" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      )}

      <span
        className="shrink-0 text-xs text-zinc-400"
        suppressHydrationWarning
      >
        {getRelativeTime(createdAt)}
      </span>
    </div>
  );
}
