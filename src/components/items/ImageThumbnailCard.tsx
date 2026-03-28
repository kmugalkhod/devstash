import { Image as ImageIcon, Star } from "lucide-react";
import { getRelativeTime } from "@/lib/utils";

interface ImageThumbnailCardProps {
  id: string;
  title: string;
  fileUrl: string | null;
  fileName: string | null;
  isFavorite: boolean;
  createdAt: string;
  onClick?: () => void;
}

export function ImageThumbnailCard({
  id,
  title,
  fileUrl,
  fileName,
  isFavorite,
  createdAt,
  onClick,
}: ImageThumbnailCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full cursor-pointer text-left"
    >
      <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-card">
        {fileUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/items/download/${id}?download=0`}
              alt={fileName ?? title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-900/40 text-zinc-500">
            <ImageIcon className="size-6" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground">{title}</h3>
        {isFavorite && (
          <Star className="size-3.5 shrink-0 fill-yellow-500 text-yellow-500" />
        )}
      </div>

      <p className="mt-1 text-xs text-zinc-400" suppressHydrationWarning>
        {getRelativeTime(createdAt)}
      </p>
    </button>
  );
}
