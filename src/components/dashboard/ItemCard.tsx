import { Star } from "lucide-react";
import { getRelativeTime } from "@/lib/utils";
import { iconMap } from "@/lib/icons";

interface ItemCardProps {
  title: string;
  content: string | null;
  typeName: string;
  typeIcon: string;
  typeColor: string;
  isFavorite: boolean;
  tags: string[];
  createdAt: string;
  onClick?: () => void;
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
  onClick,
}: ItemCardProps) {
  const Icon = iconMap[typeIcon];

  return (
    <div
      onClick={onClick}
      className="group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-muted-foreground/20 hover:shadow-md hover:shadow-white/3"
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: typeColor,
      }}
    >
      <div className="relative z-10">
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
              className="text-xs text-zinc-500"
              suppressHydrationWarning
            >
              {getRelativeTime(createdAt)}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-4 line-clamp-2 font-bold text-foreground">{title}</h3>

        {/* Content preview */}
        {content && (
          <div className="mt-4 rounded-lg bg-black/40 px-4 py-3">
            <p className="line-clamp-3 font-mono text-xs leading-relaxed text-zinc-400">
              {content}
            </p>
          </div>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="relative z-10 mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/8 px-2.5 py-0.5 text-xs text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
