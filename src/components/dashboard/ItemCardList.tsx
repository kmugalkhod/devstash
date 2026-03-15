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
import { itemTypes } from "@/lib/mock-data";
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
  typeId: string;
  isFavorite: boolean;
  tags: string[];
  createdAt: string;
}

export function ItemCardList({
  title,
  content,
  typeId,
  isFavorite,
  tags,
  createdAt,
}: ItemCardListProps) {
  const type = itemTypes.find((t) => t.id === typeId);
  if (!type) return null;

  const Icon = iconMap[type.icon];

  return (
    <div
      className="flex items-center gap-5 rounded-xl border border-border bg-card px-5 py-4"
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: type.color,
      }}
    >
      {/* Type badge */}
      <div className="flex w-28 shrink-0 items-center gap-1.5">
        {Icon && (
          <Icon className="size-4" style={{ color: type.color }} />
        )}
        <span
          className="text-xs font-bold uppercase tracking-wide"
          style={{ color: type.color }}
        >
          {type.name}
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
          <div className="rounded-lg bg-black/30 px-4 py-2">
            <p className="truncate font-mono text-xs text-muted-foreground/70">
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
              className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Time */}
      <span className="shrink-0 text-xs text-muted-foreground">
        {getRelativeTime(createdAt)}
      </span>
    </div>
  );
}
