"use client";

import { useState } from "react";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { ItemCardList } from "@/components/dashboard/ItemCardList";
import { Pin, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { items } from "@/lib/mock-data";

const pinnedItems = items.filter((i) => i.isPinned);
const recentItems = [...items]
  .sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  .slice(0, 10);

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
            ? "bg-muted text-foreground"
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
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="List view"
      >
        <List className="size-4" />
      </button>
    </div>
  );
}

export function DashboardItems() {
  const [pinnedView, setPinnedView] = useState<ViewMode>("grid");
  const [recentView, setRecentView] = useState<ViewMode>("grid");

  return (
    <>
      {/* Pinned Items */}
      {pinnedItems.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pin className="size-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">
                Pinned Items
              </h2>
            </div>
            <ViewToggle view={pinnedView} onChange={setPinnedView} />
          </div>
          {pinnedView === "grid" ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {pinnedItems.map((item) => (
                <ItemCard
                  key={item.id}
                  title={item.title}
                  content={item.content}
                  typeId={item.typeId}
                  isFavorite={item.isFavorite}
                  tags={item.tags}
                  createdAt={item.createdAt}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pinnedItems.map((item) => (
                <ItemCardList
                  key={item.id}
                  title={item.title}
                  content={item.content}
                  typeId={item.typeId}
                  isFavorite={item.isFavorite}
                  tags={item.tags}
                  createdAt={item.createdAt}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Recent Items */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Items
          </h2>
          <ViewToggle view={recentView} onChange={setRecentView} />
        </div>
        {recentView === "grid" ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recentItems.map((item) => (
              <ItemCard
                key={item.id}
                title={item.title}
                content={item.content}
                typeId={item.typeId}
                isFavorite={item.isFavorite}
                tags={item.tags}
                createdAt={item.createdAt}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentItems.map((item) => (
              <ItemCardList
                key={item.id}
                title={item.title}
                content={item.content}
                typeId={item.typeId}
                isFavorite={item.isFavorite}
                tags={item.tags}
                createdAt={item.createdAt}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
