"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, PanelLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./SidebarContext";
import { NewItemDialog } from "@/components/items/NewItemDialog";
import { NewCollectionDialog } from "@/components/dashboard/NewCollectionDialog";
import { GlobalCommandPalette } from "@/components/dashboard/GlobalCommandPalette";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import type { CollectionOption, ItemTypeInfo } from "@/lib/db/items";
import type { GlobalSearchData } from "@/lib/db/search";

interface TopBarProps {
  itemTypes: ItemTypeInfo[];
  availableCollections: CollectionOption[];
  searchData: GlobalSearchData;
}

export function TopBar({
  itemTypes,
  availableCollections,
  searchData,
}: TopBarProps) {
  const { toggleMobile } = useSidebar();
  const { openDrawer } = useItemDrawer();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMacShortcut, setIsMacShortcut] = useState(false);

  const openPalette = useCallback(() => {
    setPaletteOpen(true);
  }, []);

  const handlePaletteOpenChange = useCallback((nextOpen: boolean) => {
    setPaletteOpen(nextOpen);
    if (!nextOpen) {
      setSearchQuery("");
    }
  }, []);

  useEffect(() => {
    const platform = window.navigator.platform.toLowerCase();
    const isMac = platform.includes("mac") || platform.includes("iphone") || platform.includes("ipad");
    if (isMac !== isMacShortcut) {
      setIsMacShortcut(isMac);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key !== "k") {
        return;
      }

      if (!event.metaKey && !event.ctrlKey) {
        return;
      }

      event.preventDefault();
      openPalette();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openPalette]);

  useEffect(() => {
    if (!paletteOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [paletteOpen]);

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMobile}
          aria-label="Open sidebar"
        >
          <PanelLeft className="size-5" />
        </Button>

        {/* Mobile brand logomark */}
        <Link href="/dashboard" className="flex items-center md:hidden">
          <div className="flex size-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
            D
          </div>
        </Link>

        <div className="relative flex-1 max-w-[700px]">
          <div className="fixed left-1/2 top-[8px] z-[60] w-[min(760px,calc(100vw-2rem))] -translate-x-1/2">
            <Search className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 ${paletteOpen ? "text-foreground" : "text-muted-foreground"}`} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onClick={openPalette}
              onChange={(event) => {
                if (!paletteOpen) {
                  openPalette();
                }
                setSearchQuery(event.target.value);
              }}
              aria-label="Search snippets, prompts, notes"
              placeholder="Search snippets, prompts, notes..."
              className={`${
                paletteOpen 
                  ? "rounded-b-none border-border/80 bg-card/95 backdrop-blur-xl shadow-sm" 
                  : "rounded-md border-border/40 bg-muted/50 hover:bg-muted/70 hover:border-border/60"
              } h-10 w-full border pl-10 pr-16 text-left text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground`}
            />
            {!paletteOpen && (
              <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-5 items-center gap-0.5 rounded border border-border/80 bg-background/80 px-1.5 font-mono text-[10px] text-muted-foreground">
                {isMacShortcut ? (
                  <>
                    <span className="text-xs">⌘</span>K
                  </>
                ) : (
                  <>
                    <span>Ctrl</span>
                    <span>K</span>
                  </>
                )}
              </kbd>
            )}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Settings">
            <Settings className="size-4" />
          </Button>
          <NewCollectionDialog />
          <NewItemDialog
            itemTypes={itemTypes}
            collections={availableCollections}
          />
        </div>
      </header>

      <GlobalCommandPalette
        open={paletteOpen}
        onOpenChange={handlePaletteOpenChange}
        searchData={searchData}
        onSelectItem={openDrawer}
        search={searchQuery}
      />
    </>
  );
}
