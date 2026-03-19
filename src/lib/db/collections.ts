import { prisma } from "@/lib/prisma";

export interface CollectionTypeInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface CollectionWithTypes {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  types: CollectionTypeInfo[];
}

export interface DashboardStats {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
}

/**
 * Fetch collections for a user with item counts and type info.
 * Types are ordered by frequency (most-used first) so the dominant
 * type color can be derived from types[0].
 */
export async function getUserCollections(
  userId: string
): Promise<CollectionWithTypes[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 4,
    include: {
      items: {
        include: {
          item: {
            select: { itemTypeId: true },
          },
        },
      },
    },
  });

  // Fetch all system item types once
  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    select: { id: true, name: true, icon: true, color: true },
  });

  const typeMap = new Map(itemTypes.map((t) => [t.id, t]));

  return collections.map((col) => {
    const itemCount = col.items.length;

    // Count occurrences of each type in this collection
    const typeCounts = new Map<string, number>();
    for (const ic of col.items) {
      const typeId = ic.item.itemTypeId;
      typeCounts.set(typeId, (typeCounts.get(typeId) ?? 0) + 1);
    }

    // Sort types by frequency (most-used first)
    const types = [...typeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([typeId]) => typeMap.get(typeId))
      .filter((t): t is CollectionTypeInfo => t !== undefined);

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount,
      types,
    };
  });
}

/**
 * Fetch dashboard stats for a user.
 */
export async function getDashboardStats(
  userId: string
): Promise<DashboardStats> {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] =
    await Promise.all([
      prisma.item.count({ where: { userId } }),
      prisma.collection.count({ where: { userId } }),
      prisma.item.count({ where: { userId, isFavorite: true } }),
      prisma.collection.count({ where: { userId, isFavorite: true } }),
    ]);

  return { totalItems, totalCollections, favoriteItems, favoriteCollections };
}
