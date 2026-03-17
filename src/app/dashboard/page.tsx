import Link from "next/link";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { DashboardItems } from "@/components/dashboard/DashboardItems";
import {
  getUserCollections,
  getDashboardStats,
} from "@/lib/db/collections";
import { getPinnedItems, getRecentItems } from "@/lib/db/items";
import { prisma } from "@/lib/prisma";

// TODO: Replace with actual authenticated user ID
const DEMO_USER_ID = "demo-user-id";

async function getDemoUserId(): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: { id: true },
  });
  return user?.id ?? DEMO_USER_ID;
}

export default async function DashboardPage() {
  const userId = await getDemoUserId();

  const [collections, stats, pinnedItems, recentItems] = await Promise.all([
    getUserCollections(userId),
    getDashboardStats(userId),
    getPinnedItems(userId),
    getRecentItems(userId),
  ]);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <StatsCards
        totalItems={stats.totalItems}
        totalCollections={stats.totalCollections}
        favoriteItems={stats.favoriteItems}
        favoriteCollections={stats.favoriteCollections}
      />

      {/* Collections */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Collections</h2>
          <Link
            href="/collections"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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

      {/* Items */}
      <DashboardItems pinnedItems={pinnedItems} recentItems={recentItems} />
    </div>
  );
}
