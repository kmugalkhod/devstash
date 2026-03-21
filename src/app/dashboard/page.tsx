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
import { getDemoUserId } from "@/lib/demo-user";

async function StatsSection() {
  const userId = await getDemoUserId();
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

async function CollectionsSection() {
  const userId = await getDemoUserId();
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            name={collection.name}
            itemCount={collection.itemCount}
            description={collection.description}
            types={collection.types}
          />
        ))}
      </div>
    </section>
  );
}

async function ItemsSection() {
  const userId = await getDemoUserId();
  const [pinnedItems, recentItems] = await Promise.all([
    getPinnedItems(userId),
    getRecentItems(userId),
  ]);

  return <DashboardItems pinnedItems={pinnedItems} recentItems={recentItems} />;
}

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsSection />
      </Suspense>

      <Suspense fallback={<CollectionsSkeleton />}>
        <CollectionsSection />
      </Suspense>

      <Suspense fallback={<ItemsSkeleton />}>
        <ItemsSection />
      </Suspense>
    </div>
  );
}
