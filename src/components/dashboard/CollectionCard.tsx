"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { iconMap } from "@/lib/icons";
import { CollectionActionsMenu } from "@/components/collections/CollectionActionsMenu";

interface TypeInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
}

function isLowChroma(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  return saturation < 0.15;
}

interface CollectionCardProps {
  collectionId: string;
  name: string;
  itemCount: number;
  description: string | null;
  isFavorite: boolean;
  types: TypeInfo[];
  href?: string;
}

export function CollectionCard({
  collectionId,
  name,
  itemCount,
  description,
  isFavorite,
  types,
  href,
}: CollectionCardProps) {
  const router = useRouter();
  const rawColor = types[0]?.color || "#94a3b8";
  const dominantColor = isLowChroma(rawColor) ? "#10b981" : rawColor;

  function handleCardClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest('[data-collection-actions="true"]')) {
      return;
    }

    if (href) {
      router.push(href);
    }
  }

  function handleCardKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest('[data-collection-actions="true"]')) {
      return;
    }

    if (!href) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      router.push(href);
    }
  }

  return (
    <motion.div
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role={href ? "link" : undefined}
      tabIndex={href ? 0 : undefined}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative flex h-[200px] cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-white/10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-white/5"
      style={{
        borderTopWidth: "2px",
        borderTopColor: dominantColor,
      }}
    >
      {/* Color overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] transition-opacity group-hover:opacity-[0.12]"
        style={{ backgroundColor: dominantColor }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-2">
            <h3 className="line-clamp-2 font-bold text-foreground transition-colors group-hover:text-white">
              {name}
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              {itemCount} items
            </p>
          </div>
          <CollectionActionsMenu
            collectionId={collectionId}
            collectionName={name}
            collectionDescription={description}
            isFavorite={isFavorite}
          />
        </div>
        {description && (
          <p className="mt-4 line-clamp-3 text-sm text-zinc-400">{description}</p>
        )}
      </div>

      <div className="relative z-10 mt-6 flex gap-2.5">
        {types.map((type) => {
          if (!type) return null;
          const Icon = iconMap[type.icon];
          if (!Icon) return null;
          return (
            <div
              key={type.id}
              className="flex size-8 items-center justify-center rounded"
              style={{ backgroundColor: `${type.color}15`, color: type.color }}
            >
              <Icon className="size-4" />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
