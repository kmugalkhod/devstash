import { StatsCards } from "@/components/dashboard/StatsCards";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { DashboardItems } from "@/components/dashboard/DashboardItems";
import {
  getUserCollections,
  getDashboardStats,
} from "@/lib/db/collections";

// TODO: Replace with actual authenticated user ID
const DEMO_USER_ID = "demo-user-id";

async function getDemoUserId(): Promise<string> {
  // Temporary: look up the demo user by email
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: { id: true },
  });
  return user?.id ?? DEMO_USER_ID;
}

export default async function DashboardPage() {
  const userId = await getDemoUserId();

  const [collections, stats] = await Promise.all([
    getUserCollections(userId),
    getDashboardStats(userId),
  ]);

  return (
    <div className="space-y-12">
      {/* Stats Cards */}
      <StatsCards
        totalItems={stats.totalItems}
        totalCollections={stats.totalCollections}
        favoriteItems={stats.favoriteItems}
        favoriteCollections={stats.favoriteCollections}
      />

      {/* Collections */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Collections</h2>
          <button className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            View all
          </button>
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

      {/* Items (still using mock data — will be replaced later) */}
      <DashboardItems />
    </div>
  );
}
