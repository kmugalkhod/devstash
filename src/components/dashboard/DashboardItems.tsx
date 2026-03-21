"use client";

import { useState } from "react";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { ItemCardList } from "@/components/dashboard/ItemCardList";
import { Pin, Clock, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardItem } from "@/lib/db/items";

type ViewMode = "grid" | "list";

function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
      <button
        onClick={() => onChange("grid")}
        className={cn(
          "rounded-md p-1.5 transition-colors",
          view === "grid"
            ? "bg-muted text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Grid view"
      >
        <LayoutGrid className="size-4" />
      </button>
      <button
        onClick={() => onChange("list")}
        className={cn(
          "rounded-md p-1.5 transition-colors",
          view === "list"
            ? "bg-muted text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="List view"
      >
        <List className="size-4" />
      </button>
    </div>
  );
}

function ItemSection({
  title,
  icon: Icon,
  items,
  view,
  onViewChange,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: DashboardItem[];
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
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
      {view === "grid" ? (
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
              tags={item.tags}
              createdAt={item.createdAt}
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
              tags={item.tags}
              createdAt={item.createdAt}
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

  return (
    <>
      {pinnedItems.length > 0 && (
        <ItemSection
          title="Pinned Items"
          icon={Pin}
          items={pinnedItems}
          view={pinnedView}
          onViewChange={setPinnedView}
        />
      )}

      <ItemSection
        title="Recent Items"
        icon={Clock}
        items={recentItems}
        view={recentView}
        onViewChange={setRecentView}
      />
    </>
  );
}
