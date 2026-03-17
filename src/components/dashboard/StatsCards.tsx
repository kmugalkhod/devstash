"use client";

import { Package, FolderOpen, Star, Heart } from "lucide-react";
import { motion } from "motion/react";

interface StatsCardsProps {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
}

export function StatsCards({
  totalItems,
  totalCollections,
  favoriteItems,
  favoriteCollections,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Total Items",
      value: totalItems,
      icon: Package,
      color: "#3b82f6",
    },
    {
      label: "Collections",
      value: totalCollections,
      icon: FolderOpen,
      color: "#8b5cf6",
    },
    {
      label: "Favorite Items",
      value: favoriteItems,
      icon: Star,
      color: "#f97316",
    },
    {
      label: "Favorite Collections",
      value: favoriteCollections,
      icon: Heart,
      color: "#ec4899",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="group rounded-xl border border-border bg-card p-5 transition-all hover:bg-card/80 hover:shadow-md"
          style={{
            borderLeftWidth: "3px",
            borderLeftColor: stat.color,
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <div
              className="flex size-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${stat.color}0d` }}
            >
              <stat.icon
                className="size-5"
                style={{ color: stat.color }}
              />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {stat.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
