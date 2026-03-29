"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Folder, SearchX } from "lucide-react";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { iconMap } from "@/lib/icons";
import type { GlobalSearchData } from "@/lib/db/search";

interface GlobalCommandPaletteProps {
  onOpenChange: (open: boolean) => void;
  searchData: GlobalSearchData;
  onSelectItem: (itemId: string) => void;
  search: string;
}

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function fuzzyScore(query: string, value: string): number {
  const q = normalize(query);
  const v = normalize(value);

  if (!q) {
    return 1;
  }

  const directMatchIndex = v.indexOf(q);
  if (directMatchIndex !== -1) {
    return 1000 - directMatchIndex;
  }

  let score = 0;
  let queryIndex = 0;
  let streak = 0;

  for (let i = 0; i < v.length && queryIndex < q.length; i += 1) {
    if (v[i] === q[queryIndex]) {
      queryIndex += 1;
      streak += 1;
      score += 8 + streak * 3;
      continue;
    }

    streak = 0;
  }

  if (queryIndex !== q.length) {
    return 0;
  }

  return score;
}

export function GlobalCommandPalette({
  onOpenChange,
  searchData,
  onSelectItem,
  search,
}: GlobalCommandPaletteProps) {
  const router = useRouter();

  const results = useMemo(() => {
    const query = search.trim();

    if (!query) {
      return {
        items: searchData.items.slice(0, 8),
        collections: searchData.collections.slice(0, 6),
      };
    }

    const rankedItems = searchData.items
      .map((item) => ({
        item,
        score: fuzzyScore(
          query,
          `${item.title} ${item.type.name} ${item.contentPreview}`
        ),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((entry) => entry.item);

    const rankedCollections = searchData.collections
      .map((collection) => ({
        collection,
        score: fuzzyScore(query, `${collection.name} collection`),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((entry) => entry.collection);

    return {
      items: rankedItems,
      collections: rankedCollections,
    };
  }, [search, searchData]);

  return (
    <>
      <CommandList className="max-h-[62vh] space-y-1 p-2">
        <CommandEmpty className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted/40 ring-1 ring-border/50">
            <SearchX className="size-5 text-muted-foreground/70" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="font-medium text-foreground">No results found</p>
            <p className="text-xs">We couldn&apos;t find anything matching &quot;{search}&quot;</p>
          </div>
        </CommandEmpty>

        {results.items.length > 0 && (
          <CommandGroup heading="Items" className="px-1 text-xs font-medium text-muted-foreground">
                {results.items.map((item) => {
                  const ItemIcon = iconMap[item.type.icon];

                  return (
                    <CommandItem
                      key={item.id}
                      value={`item-${item.id}`}
                      onSelect={() => {
                        onOpenChange(false);
                        onSelectItem(item.id);
                      }}
                      className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 outline-none data-[selected=true]:bg-muted/80 data-[selected=true]:text-foreground"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background/50 text-muted-foreground shadow-sm transition-colors group-data-[selected=true]:bg-background">
                        {ItemIcon ? (
                          <ItemIcon
                            className="size-4"
                            style={{ color: item.type.color }}
                          />
                        ) : (
                          <div className="size-4" />
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                        <p className="truncate text-sm font-medium leading-none text-foreground">
                          {item.title}
                        </p>
                        {item.contentPreview && (
                          <p className="truncate text-xs text-muted-foreground">
                            {item.contentPreview}
                          </p>
                        )}
                      </div>

                      <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground/80 ring-1 ring-inset ring-border/50">
                        {item.type.name}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {results.items.length > 0 && results.collections.length > 0 && (
              <CommandSeparator className="my-2 h-px bg-border/50" />
            )}

        {results.collections.length > 0 && (
          <CommandGroup heading="Collections" className="px-1 text-xs font-medium text-muted-foreground">
            {results.collections.map((collection) => (
              <CommandItem
                key={collection.id}
                value={`collection-${collection.id}`}
                onSelect={() => {
                  onOpenChange(false);
                  router.push(`/collections/${collection.id}`);
                }}
                className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 outline-none data-[selected=true]:bg-muted/80 data-[selected=true]:text-foreground"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background/50 text-muted-foreground shadow-sm transition-colors group-data-[selected=true]:bg-background">
                  <Folder className="size-4" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                  <p className="truncate text-sm font-medium leading-none text-foreground">
                    {collection.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
      <div className="flex items-center justify-end border-t border-border/40 bg-muted/20 px-4 py-2 text-[10px] text-muted-foreground/80 sm:text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 hidden sm:flex">
            <kbd className="flex h-4 w-4 items-center justify-center rounded-[3px] border border-border/60 bg-muted/60 font-sans text-[10px] font-medium text-muted-foreground">
              ↑
            </kbd>
            <kbd className="flex h-4 w-4 items-center justify-center rounded-[3px] border border-border/60 bg-muted/60 font-sans text-[10px] font-medium text-muted-foreground shadow-sm">
              ↓
            </kbd>
            <span className="ml-0.5">navigate</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="flex h-4 min-w-[20px] items-center justify-center rounded-[3px] border border-border/60 bg-muted/60 px-1 font-sans text-[10px] font-medium text-muted-foreground shadow-sm">
              ↵
            </kbd>
            <span className="ml-0.5">select</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="flex h-4 min-w-[24px] items-center justify-center rounded-[3px] border border-border/60 bg-muted/60 px-1 font-sans text-[9px] font-medium tracking-wide text-muted-foreground uppercase shadow-sm">
              esc
            </kbd>
            <span className="ml-0.5">close</span>
          </span>
        </div>
      </div>
    </>
  );
}
