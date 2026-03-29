"use client";

import { useMemo, useState } from "react";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { ItemCardList } from "@/components/dashboard/ItemCardList";
import { ImageThumbnailCard } from "@/components/items/ImageThumbnailCard";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import type { DashboardItem } from "@/lib/db/items";
import { iconMap } from "@/lib/icons";

type ViewMode = "grid" | "list";
const TYPE_ORDER = ["snippet", "prompt", "command", "note", "file", "image", "link"];

interface ItemGroup {
  typeKey: string;
  typeName: string;
  typeIcon: string;
  typeColor: string;
  items: DashboardItem[];
}

function groupItemsByType(items: DashboardItem[]): ItemGroup[] {
  const groups = new Map<string, ItemGroup>();

  for (const item of items) {
    const typeKey = item.type.name.toLowerCase();
    const existing = groups.get(typeKey);

    if (existing) {
      existing.items.push(item);
      continue;
    }

    groups.set(typeKey, {
      typeKey,
      typeName: item.type.name,
      typeIcon: item.type.icon,
      typeColor: item.type.color,
      items: [item],
    });
  }

  return [...groups.values()].sort((a, b) => {
    const aIndex = TYPE_ORDER.indexOf(a.typeKey);
    const bIndex = TYPE_ORDER.indexOf(b.typeKey);
    const normalizedA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const normalizedB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
    if (normalizedA !== normalizedB) return normalizedA - normalizedB;
    return a.typeName.localeCompare(b.typeName);
  });
}

interface CollectionItemsViewProps {
  items: DashboardItem[];
}

export function CollectionItemsView({ items }: CollectionItemsViewProps) {
  const [view, setView] = useState<ViewMode>("grid");
  const { openDrawer } = useItemDrawer();
  const groupedItems = useMemo(() => groupItemsByType(items), [items]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-sm text-muted-foreground">No items in this collection yet</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Add items to this collection from the item forms or editor drawer
        </p>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Grouped by item type</p>
        <ViewToggle view={view} onChange={setView} />
      </div>

      <div className="space-y-8">
        {groupedItems.map((group) => {
          const GroupIcon = iconMap[group.typeIcon];
          const isImageGroup = group.typeKey === "image";

          return (
            <div key={group.typeKey}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {GroupIcon && (
                    <GroupIcon
                      className="size-4"
                      style={{ color: group.typeColor }}
                    />
                  )}
                  <h3 className="text-sm font-semibold capitalize text-foreground">
                    {group.typeName}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {group.items.length} {group.items.length === 1 ? "item" : "items"}
                </p>
              </div>

              {isImageGroup ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => (
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
                  {group.items.map((item) => (
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
                  {group.items.map((item) => (
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
            </div>
          );
        })}
      </div>
    </section>
  );
}
