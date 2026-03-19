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

interface ItemCardListProps {
  title: string;
  content: string | null;
  typeName: string;
  typeIcon: string;
  typeColor: string;
  isFavorite: boolean;
  tags: string[];
  createdAt: string;
}

export function ItemCardList({
  title,
  content,
  typeName,
  typeIcon,
  typeColor,
  isFavorite,
  tags,
  createdAt,
}: ItemCardListProps) {
  const Icon = iconMap[typeIcon];

  return (
    <div
      className="group flex cursor-pointer items-center gap-5 rounded-xl border border-border bg-card px-6 py-5 transition-all hover:border-muted-foreground/20 hover:bg-card/80 hover:shadow-md hover:shadow-white/3"
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
      </div>

      {/* Content preview */}
      {content && (
        <div className="hidden min-w-0 flex-1 lg:block">
          <div className="rounded-lg bg-black/40 px-4 py-2">
            <p className="truncate font-mono text-xs text-zinc-400">
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
              className="rounded-full border border-white/10 bg-white/8 px-2.5 py-0.5 text-xs text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Time */}
      <span
        className="shrink-0 text-xs text-zinc-500"
        suppressHydrationWarning
      >
        {getRelativeTime(createdAt)}
      </span>
    </div>
  );
}
