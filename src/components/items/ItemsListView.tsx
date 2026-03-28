"use client";

import { useState } from "react";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { ItemCardList } from "@/components/dashboard/ItemCardList";
import { ImageThumbnailCard } from "@/components/items/ImageThumbnailCard";
import { FileListRow } from "@/components/items/FileListRow";
import type { DashboardItem } from "@/lib/db/items";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import { ViewToggle } from "@/components/shared/ViewToggle";

type ViewMode = "grid" | "list";

interface ItemsListViewProps {
  items: DashboardItem[];
  typeName: string;
  typeKey: string;
}

export function ItemsListView({ items, typeName, typeKey }: ItemsListViewProps) {
  const [view, setView] = useState<ViewMode>("grid");
  const { openDrawer } = useItemDrawer();
  const isImageGallery = typeKey === "image";
  const isFileList = typeKey === "file";

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isImageGallery
            ? "Image gallery"
            : isFileList
              ? "File list"
              : `All ${typeName.toLowerCase()}`}
        </p>
        {!isImageGallery && !isFileList && (
          <ViewToggle view={view} onChange={setView} />
        )}
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
      ) : isFileList ? (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <FileListRow
              key={item.id}
              id={item.id}
              title={item.title}
              fileName={item.fileName}
              fileSize={item.fileSize}
              createdAt={item.createdAt}
              fileUrl={item.fileUrl}
              onOpen={() => openDrawer(item.id)}
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
