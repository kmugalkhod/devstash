"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Folder, Sparkles, Star } from "lucide-react";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import { iconMap } from "@/lib/icons";
import { getRelativeTime } from "@/lib/utils";
import type { FavoriteItem } from "@/lib/db/items";
import type { FavoriteCollection } from "@/lib/db/collections";

interface FavoritesViewProps {
  favoriteItems: FavoriteItem[];
  favoriteCollections: FavoriteCollection[];
}

interface SectionShellProps {
  eyebrow: string;
  title: string;
  description: string;
  count: number;
  children: React.ReactNode;
}

function SectionShell({
  eyebrow,
  title,
  description,
  count,
  children,
}: SectionShellProps) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
      <div className="border-b border-white/8 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
              {title}
            </h2>
            <p className="mt-1 text-sm text-zinc-400">{description}</p>
          </div>
          <div className="inline-flex h-fit items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-zinc-300">
            {count} {count === 1 ? "entry" : "entries"}
          </div>
        </div>
      </div>
      <div>{children}</div>
    </section>
  );
}

export function FavoritesView({
  favoriteItems,
  favoriteCollections,
}: FavoritesViewProps) {
  const { openDrawer } = useItemDrawer();
  const router = useRouter();

  const isEmpty = favoriteItems.length === 0 && favoriteCollections.length === 0;

  if (isEmpty) {
    return (
      <div className="relative overflow-hidden rounded-[28px] border border-dashed border-white/10 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.08),transparent_45%),rgba(255,255,255,0.02)] px-6 py-20 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center">
          <div className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-400/10">
            <Star className="size-6 text-amber-300" />
          </div>
          <p className="text-lg font-semibold text-white">No favorites yet</p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Start starring the items and collections you revisit most often. They will gather here in one quiet, high-signal view.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
            <Sparkles className="size-3.5 text-amber-300" />
            Your starred content will appear here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {favoriteItems.length > 0 && (
        <SectionShell
          eyebrow="Items"
          title="Saved references"
          description="Fast access to the snippets, notes, prompts, and links you keep coming back to."
          count={favoriteItems.length}
        >
          <div className="divide-y divide-white/8">
            {favoriteItems.map((item, index) => {
              const Icon = iconMap[item.type.icon];

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openDrawer(item.id)}
                  className="group flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.035] sm:gap-4 sm:px-6"
                >
                  <div className="hidden w-8 shrink-0 font-mono text-[11px] text-zinc-600 sm:block">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/8"
                    style={{ backgroundColor: `${item.type.color}14` }}
                  >
                    {Icon ? (
                      <Icon className="size-4" style={{ color: item.type.color }} />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-zinc-100 transition-colors group-hover:text-white sm:text-[15px]">
                        {item.title}
                      </span>
                      <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                      <span className="font-mono uppercase tracking-[0.18em]">
                        {item.type.name}
                      </span>
                      <span className="hidden h-1 w-1 rounded-full bg-zinc-700 sm:block" />
                      <span suppressHydrationWarning>
                        Updated {getRelativeTime(item.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="hidden items-center gap-3 sm:flex">
                    <span
                      className="rounded-full border border-white/8 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em]"
                      style={{
                        backgroundColor: `${item.type.color}12`,
                        color: item.type.color,
                      }}
                    >
                      {item.type.name}
                    </span>
                    <ArrowRight className="size-4 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-300" />
                  </div>
                </button>
              );
            })}
          </div>
        </SectionShell>
      )}

      {favoriteCollections.length > 0 && (
        <SectionShell
          eyebrow="Collections"
          title="Pinned groupings"
          description="Collections you marked as essential, kept visible with useful context instead of extra noise."
          count={favoriteCollections.length}
        >
          <div className="divide-y divide-white/8">
            {favoriteCollections.map((col, index) => (
              <button
                key={col.id}
                type="button"
                onClick={() => router.push(`/collections/${col.id}`)}
                className="group flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.035] sm:gap-4 sm:px-6"
              >
                <div className="hidden w-8 shrink-0 font-mono text-[11px] text-zinc-600 sm:block">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-amber-300/10 bg-amber-400/10">
                  <Folder className="size-4 text-amber-300" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-zinc-100 transition-colors group-hover:text-white sm:text-[15px]">
                      {col.name}
                    </span>
                    <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                    <span className="font-mono uppercase tracking-[0.18em]">
                      Collection
                    </span>
                    <span className="hidden h-1 w-1 rounded-full bg-zinc-700 sm:block" />
                    <span>{col.itemCount} {col.itemCount === 1 ? "item" : "items"}</span>
                    <span className="hidden h-1 w-1 rounded-full bg-zinc-700 sm:block" />
                    <span suppressHydrationWarning>
                      Updated {getRelativeTime(col.updatedAt)}
                    </span>
                  </div>
                </div>

                <div className="hidden items-center gap-3 sm:flex">
                  <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                    {col.itemCount} {col.itemCount === 1 ? "item" : "items"}
                  </span>
                  <ArrowRight className="size-4 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-300" />
                </div>
              </button>
            ))}
          </div>
        </SectionShell>
      )}
    </div>
  );
}
