"use client";

import Link from "next/link";
import { Search, Plus, FolderPlus, PanelLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebar } from "./SidebarContext";

export function TopBar() {
  const { toggleMobile } = useSidebar();

  return (
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

      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search snippets, prompts, notes..."
          className="pl-9 pr-16"
          readOnly
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="size-4" />
        </Button>
<Button variant="outline" className="hidden border-muted-foreground/20 sm:inline-flex">
          <FolderPlus className="size-4" />
          New Collection
        </Button>
        <Button>
          <Plus className="size-4" />
          <span className="sm:hidden">New</span>
          <span className="hidden sm:inline">New Item</span>
        </Button>
      </div>
    </header>
  );
}
