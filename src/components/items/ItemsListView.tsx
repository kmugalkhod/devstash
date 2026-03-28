"use client";

import { useState } from "react";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { ItemCardList } from "@/components/dashboard/ItemCardList";
import { ImageThumbnailCard } from "@/components/items/ImageThumbnailCard";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardItem } from "@/lib/db/items";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";

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

interface ItemsListViewProps {
  items: DashboardItem[];
  typeName: string;
  typeKey: string;
}

export function ItemsListView({ items, typeName, typeKey }: ItemsListViewProps) {
  const [view, setView] = useState<ViewMode>("grid");
  const { openDrawer } = useItemDrawer();
  const isImageGallery = typeKey === "image";

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isImageGallery ? "Image gallery" : `All ${typeName.toLowerCase()}`}
        </p>
        {!isImageGallery && <ViewToggle view={view} onChange={setView} />}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No {typeName.toLowerCase()} yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Create your first item to get started
          </p>
        </div>
      ) : isImageGallery ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ImageThumbnailCard
              key={item.id}
              id={item.id}
              title={item.title}
              fileUrl={item.fileUrl}
              fileName={item.fileName}
              isFavorite={item.isFavorite}
              createdAt={item.createdAt}
              onClick={() => openDrawer(item.id)}
            />
          ))}
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
              onClick={() => openDrawer(item.id)}
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
              onClick={() => openDrawer(item.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
