"use client";

import { useState } from "react";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { ItemCardList } from "@/components/dashboard/ItemCardList";
import { Pin, Clock } from "lucide-react";
import type { DashboardItem } from "@/lib/db/items";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import { ViewToggle } from "@/components/shared/ViewToggle";

type ViewMode = "grid" | "list";

function ItemSection({
  title,
  icon: Icon,
  items,
  view,
  onViewChange,
  onItemClick,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: DashboardItem[];
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  onItemClick: (id: string) => void;
}) {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-4 text-muted-foreground" />}
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
        </div>
        <ViewToggle view={view} onChange={onViewChange} />
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
          {Icon && <Icon className="mb-2 size-5 text-muted-foreground/50" />}
          <p className="text-sm text-muted-foreground">No {title.toLowerCase()} yet</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Create your first item to get started
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              title={item.title}
              content={item.content}
              typeName={item.type.name}
              typeIcon={item.type.icon}
              typeColor={item.type.color}
              isFavorite={item.isFavorite}
              isPinned={item.isPinned}
              tags={item.tags}
              createdAt={item.createdAt}
              onClick={() => onItemClick(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <ItemCardList
              key={item.id}
              title={item.title}
              content={item.content}
              typeName={item.type.name}
              typeIcon={item.type.icon}
              typeColor={item.type.color}
              isFavorite={item.isFavorite}
              isPinned={item.isPinned}
              tags={item.tags}
              createdAt={item.createdAt}
              onClick={() => onItemClick(item.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface DashboardItemsProps {
  pinnedItems: DashboardItem[];
  recentItems: DashboardItem[];
}

export function DashboardItems({
  pinnedItems,
  recentItems,
}: DashboardItemsProps) {
  const [pinnedView, setPinnedView] = useState<ViewMode>("grid");
  const [recentView, setRecentView] = useState<ViewMode>("grid");
  const { openDrawer } = useItemDrawer();

  return (
    <div className="space-y-10">
      {pinnedItems.length > 0 && (
        <ItemSection
          title="Pinned Items"
          icon={Pin}
          items={pinnedItems}
          view={pinnedView}
          onViewChange={setPinnedView}
          onItemClick={openDrawer}
        />
      )}

      <ItemSection
        title="Recent Items"
        icon={Clock}
        items={recentItems}
        view={recentView}
        onViewChange={setRecentView}
        onItemClick={openDrawer}
      />
    </div>
  );
}
