"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Star,
  Clock,
  ChevronLeft,
  Folder,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSidebar } from "./SidebarContext";
import { cn } from "@/lib/utils";
import { iconMap } from "@/lib/icons";
import type { ItemTypeInfo, SidebarCollection, SidebarUser } from "@/lib/db/items";

const proTypes = new Set(["file", "image"]);

function getTypeSlug(name: string): string {
  return name.toLowerCase() + "s";
}

function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .map((n) => n[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

interface SidebarProps {
  itemTypes: ItemTypeInfo[];
  favoriteCollections: SidebarCollection[];
  recentCollections: SidebarCollection[];
  user: SidebarUser;
}

function SidebarContent({
  collapsed,
  itemTypes,
  favoriteCollections,
  recentCollections,
  user,
}: {
  collapsed: boolean;
} & SidebarProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Item Types */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className={cn("mb-2", collapsed ? "px-0" : "px-2")}>
          {!collapsed && (
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Item Types
            </span>
          )}
        </div>
        <nav className="flex flex-col gap-1">
          {itemTypes.map((type) => {
            const Icon = iconMap[type.icon];
            const isPro = proTypes.has(type.name);

            const linkContent = (
              <Link
                href={`/dashboard/items/${getTypeSlug(type.name)}`}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                {Icon && (
                  <Icon
                    className="size-4 shrink-0"
                    style={{ color: type.color }}
                  />
                )}
                {!collapsed && (
                  <>
                    <span className="flex-1 capitalize">{type.name}</span>
                    {isPro && (
                      <span className="rounded border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                        PRO
                      </span>
                    )}
                  </>
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={type.id}>
                  <TooltipTrigger render={<div />}>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <span className="capitalize">{type.name}</span>
                    {isPro && " (Pro)"}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={type.id}>{linkContent}</div>;
          })}
        </nav>

        <Separator className="my-5" />

        {/* Collections */}
        <div className={cn("mb-2", collapsed ? "px-0" : "px-2")}>
          {!collapsed && (
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Collections
            </span>
          )}
        </div>
        <nav className="flex flex-col gap-1">
          {/* Favorites */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger render={<div />}>
                <Link
                  href="/collections/favorites"
                  className="flex items-center justify-center rounded-md px-2 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <Star className="size-4 shrink-0 text-yellow-500" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Favorites</TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/collections/favorites"
              className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Star className="size-4 shrink-0 text-yellow-500" />
              <span>Favorites</span>
            </Link>
          )}

          {/* Favorite Collections */}
          {!collapsed &&
            favoriteCollections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.id}`}
                className="flex items-center gap-3 rounded-md px-2 py-2 pl-5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Star className="size-3.5 shrink-0 text-yellow-500" />
                <span className="truncate">{collection.name}</span>
              </Link>
            ))}

          {/* Recent */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger render={<div />}>
                <Link
                  href="/collections/recent"
                  className="flex items-center justify-center rounded-md px-2 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <Clock className="size-4 shrink-0 text-sky-400" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Recent</TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/collections/recent"
              className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Clock className="size-4 shrink-0 text-sky-400" />
              <span>Recent</span>
            </Link>
          )}

          {/* Recent Collections with colored circles */}
          {!collapsed &&
            recentCollections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.id}`}
                className="flex items-center gap-3 rounded-md px-2 py-2 pl-5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{
                    backgroundColor: collection.dominantColor ?? "#6b7280",
                  }}
                />
                <span className="truncate">{collection.name}</span>
              </Link>
            ))}

          {/* View all collections */}
          {!collapsed && (
            <Link
              href="/collections"
              className="mt-1 flex items-center gap-3 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Folder className="size-4 shrink-0" />
              <span>View all collections</span>
            </Link>
          )}
        </nav>
      </div>

      {/* User Avatar Area */}
      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex w-full cursor-pointer items-center rounded-md p-1 transition-colors hover:bg-sidebar-accent",
              collapsed ? "justify-center" : "gap-3"
            )}
          >
            <Avatar size={collapsed ? "sm" : "default"}>
              {user.image && <AvatarImage src={user.image} />}
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 overflow-hidden text-left">
                <p className="truncate text-sm font-medium text-foreground">
                  {user.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" sideOffset={8}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
              <User className="size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
            >
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function Sidebar({ itemTypes, favoriteCollections, recentCollections, user }: SidebarProps) {
  const { isCollapsed, isMobileOpen, toggleCollapsed, closeMobile } = useSidebar();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 md:flex",
          isCollapsed ? "w-14" : "w-64"
        )}
      >
        {/* Sidebar Header */}
        <div
          className={cn(
            "flex h-14 items-center border-b border-sidebar-border",
            isCollapsed ? "justify-center px-2" : "justify-between px-4"
          )}
        >
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
                D
              </div>
              <span className="text-base font-semibold text-foreground">
                DevStash
              </span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={cn(
                "size-4 transition-transform",
                isCollapsed && "rotate-180"
              )}
            />
          </Button>
        </div>

        <SidebarContent
          collapsed={isCollapsed}
          itemTypes={itemTypes}
          favoriteCollections={favoriteCollections}
          recentCollections={recentCollections}
          user={user}
        />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isMobileOpen} onOpenChange={closeMobile}>
        <SheetContent side="left" className="w-64 bg-sidebar p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          {/* Mobile Header */}
          <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2"
              onClick={closeMobile}
            >
              <div className="flex size-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
                D
              </div>
              <span className="text-base font-semibold text-foreground">
                DevStash
              </span>
            </Link>
          </div>
          <SidebarContent
            collapsed={false}
            itemTypes={itemTypes}
            favoriteCollections={favoriteCollections}
            recentCollections={recentCollections}
            user={user}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
