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
  MoreVertical,
} from "lucide-react";
import { motion } from "motion/react";
const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link: LinkIcon,
  File,
  Image,
};

interface TypeInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface CollectionCardProps {
  name: string;
  itemCount: number;
  description: string | null;
  types: TypeInfo[];
}

export function CollectionCard({
  name,
  itemCount,
  description,
  types,
}: CollectionCardProps) {
  const rawColor = types[0]?.color || "#94a3b8";
  // Gray colors are invisible as overlays — use green tint instead
  const dominantColor = rawColor === "#6b7280" ? "#10b981" : rawColor;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-muted-foreground/30 hover:shadow-md hover:shadow-white/3"
      style={{
        borderTopWidth: "2px",
        borderTopColor: dominantColor,
      }}
    >
      {/* Color overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.07]"
        style={{ backgroundColor: dominantColor }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-foreground transition-colors group-hover:text-white">
              {name}
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              {itemCount} items
            </p>
          </div>
          <button className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-white/5 hover:text-foreground group-hover:opacity-100">
            <MoreVertical className="size-4" />
          </button>
        </div>
        {description && (
          <p className="mt-5 text-sm text-zinc-400">{description}</p>
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
