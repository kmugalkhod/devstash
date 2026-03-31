import { Suspense } from "react";
import Link from "next/link";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { DashboardItems } from "@/components/dashboard/DashboardItems";
import {
  StatsCardsSkeleton,
  CollectionsSkeleton,
  ItemsSkeleton,
} from "@/components/dashboard/DashboardSkeletons";
import {
  getUserCollections,
  getDashboardStats,
} from "@/lib/db/collections";
import { getPinnedItems, getRecentItems } from "@/lib/db/items";
import { getAuthUserId } from "@/lib/auth-utils";

async function StatsSection({ userId }: { userId: string }) {
  const stats = await getDashboardStats(userId);

  return (
    <StatsCards
      totalItems={stats.totalItems}
      totalCollections={stats.totalCollections}
      favoriteItems={stats.favoriteItems}
      favoriteCollections={stats.favoriteCollections}
    />
  );
}

async function CollectionsSection({ userId }: { userId: string }) {
  const collections = await getUserCollections(userId);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Collections</h2>
        <Link
          href="/collections"
          className="text-sm text-zinc-400 transition-colors hover:text-foreground"
        >
          View all
        </Link>
      </div>
      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">No collections yet</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Create your first collection to organize your items
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collectionId={collection.id}
              name={collection.name}
              itemCount={collection.itemCount}
              description={collection.description}
              isFavorite={collection.isFavorite}
              types={collection.types}
              href={`/collections/${collection.id}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

async function ItemsSection({ userId }: { userId: string }) {
  const [pinnedItems, recentItems] = await Promise.all([
    getPinnedItems(userId),
    getRecentItems(userId),
  ]);

  return <DashboardItems pinnedItems={pinnedItems} recentItems={recentItems} />;
}

export default async function DashboardPage() {
  const userId = await getAuthUserId();

  return (
    <div className="space-y-10">
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsSection userId={userId} />
      </Suspense>

      <Suspense fallback={<CollectionsSkeleton />}>
        <CollectionsSection userId={userId} />
      </Suspense>

      <Suspense fallback={<ItemsSkeleton />}>
        <ItemsSection userId={userId} />
      </Suspense>
    </div>
  );
}
