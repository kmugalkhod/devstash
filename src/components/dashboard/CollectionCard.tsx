"use client";

import { MoreVertical } from "lucide-react";
import { motion } from "motion/react";
import { iconMap } from "@/lib/icons";
import { Button } from "@/components/ui/button";

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
  // Low-chroma colors (e.g. gray for file type) are invisible as overlays — use fallback
  const LOW_CHROMA_COLORS = new Set(["#6b7280", "#94a3b8"]);
  const dominantColor = LOW_CHROMA_COLORS.has(rawColor) ? "#10b981" : rawColor;

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
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Collection options"
            className="opacity-0 transition-opacity hover:bg-white/5 group-hover:opacity-100"
          >
            <MoreVertical className="size-4" />
          </Button>
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
