import { Star } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { getFavoriteItems } from "@/lib/db/items";
import { getFavoriteCollections } from "@/lib/db/collections";
import { FavoritesView } from "@/components/favorites/FavoritesView";

export default async function FavoritesPage() {
  const userId = await getAuthUserId();

  const [favoriteItems, favoriteCollections] = await Promise.all([
    getFavoriteItems(userId),
    getFavoriteCollections(userId),
  ]);

  const totalFavorites = favoriteItems.length + favoriteCollections.length;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_32%),linear-gradient(135deg,rgba(24,24,27,0.96),rgba(17,24,39,0.94))] px-6 py-7 sm:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.02))]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/90">
              <Star className="size-3.5 fill-amber-300 text-amber-300" />
              Favorites
            </div>
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-400/10 shadow-[0_18px_50px_rgba(251,191,36,0.14)]">
                <Star className="size-6 fill-amber-300 text-amber-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-[2.1rem]">
                  A curated shelf of your best finds
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-300">
                  Keep important snippets, references, and collections within quick reach. This view stays compact, but the hierarchy is sharper and easier to scan.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[340px]">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                Total starred
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">{totalFavorites}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                Items
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">{favoriteItems.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                Collections
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">{favoriteCollections.length}</p>
            </div>
          </div>
        </div>
      </section>

      <FavoritesView
        favoriteItems={favoriteItems}
        favoriteCollections={favoriteCollections}
      />
    </div>
  );
}
