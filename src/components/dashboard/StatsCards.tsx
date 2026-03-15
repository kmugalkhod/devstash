"use client";

import { Package, FolderOpen, Star, Heart } from "lucide-react";
import { motion } from "motion/react";
import { items, collections } from "@/lib/mock-data";

const stats = [
  {
    label: "Total Items",
    value: items.length,
    icon: Package,
    color: "#3b82f6",
  },
  {
    label: "Collections",
    value: collections.length,
    icon: FolderOpen,
    color: "#8b5cf6",
  },
  {
    label: "Favorite Items",
    value: items.filter((i) => i.isFavorite).length,
    icon: Star,
    color: "#f97316",
  },
  {
    label: "Favorite Collections",
    value: collections.filter((c) => c.isFavorite).length,
    icon: Heart,
    color: "#ec4899",
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <stat.icon
              className="size-5"
              style={{ color: stat.color }}
            />
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {stat.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
