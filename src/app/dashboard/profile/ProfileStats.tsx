import { Package, FolderOpen } from "lucide-react";
import { iconMap } from "@/lib/icons";
import type { ProfileStats as ProfileStatsType } from "@/lib/db/profile";

export function ProfileStats({ stats }: { stats: ProfileStatsType }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Usage</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Package className="size-4" />
            Total Items
          </div>
          <p className="mt-1 text-2xl font-bold">{stats.totalItems}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <FolderOpen className="size-4" />
            Collections
          </div>
          <p className="mt-1 text-2xl font-bold">{stats.totalCollections}</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-4">
        <p className="mb-3 text-sm font-medium text-zinc-400">Items by Type</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
          {stats.itemsByType.map((type) => {
            const Icon = iconMap[type.icon];
            return (
              <div key={type.name} className="flex items-center gap-2">
                {Icon && (
                  <Icon className="size-4 shrink-0" style={{ color: type.color }} />
                )}
                <span className="text-sm capitalize text-zinc-300">
                  {type.name}s
                </span>
                <span className="text-sm font-medium tabular-nums text-zinc-400">
                  {type.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
