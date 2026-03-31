import { prisma } from "@/lib/prisma";
import { DASHBOARD_COLLECTIONS_LIMIT } from "@/lib/limits";

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

export interface PaginatedCollections {
  collections: CollectionWithTypes[];
  totalCollections: number;
}

export interface DashboardStats {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
}

export interface CreateCollectionInput {
  name: string;
  description: string | null;
}

export interface UpdateCollectionInput {
  name: string;
  description: string | null;
}

export interface CreatedCollection {
  id: string;
  name: string;
  description: string | null;
}

type CollectionWithItemTypeIds = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  items: { item: { itemTypeId: string } }[];
};

async function mapCollectionsWithTypes(
  collections: CollectionWithItemTypeIds[]
): Promise<CollectionWithTypes[]> {
  if (collections.length === 0) {
    return [];
  }

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
    take: DASHBOARD_COLLECTIONS_LIMIT,
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

  return mapCollectionsWithTypes(collections);
}

/**
 * Fetch all collections for a user with item counts and type info.
 */
export async function getAllUserCollections(
  userId: string
): Promise<CollectionWithTypes[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
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

  return mapCollectionsWithTypes(collections);
}

/**
 * Fetch one page of collections for a user with item counts and type info.
 */
export async function getPaginatedUserCollections(
  userId: string,
  page: number,
  pageSize: number
): Promise<PaginatedCollections> {
  const safePage = Math.max(1, Math.trunc(page));
  const safePageSize = Math.max(1, Math.trunc(pageSize));
  const skip = (safePage - 1) * safePageSize;

  const where = { userId };

  const [collections, totalCollections] = await Promise.all([
    prisma.collection.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: safePageSize,
      include: {
        items: {
          include: {
            item: {
              select: { itemTypeId: true },
            },
          },
        },
      },
    }),
    prisma.collection.count({ where }),
  ]);

  return {
    collections: await mapCollectionsWithTypes(collections),
    totalCollections,
  };
}

/**
 * Fetch a single collection by ID for the authenticated user.
 */
export async function getCollectionById(
  userId: string,
  collectionId: string
): Promise<CollectionWithTypes | null> {
  const collection = await prisma.collection.findFirst({
    where: {
      id: collectionId,
      userId,
    },
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

  if (!collection) {
    return null;
  }

  const [mapped] = await mapCollectionsWithTypes([collection]);
  return mapped ?? null;
}

/**
 * Create a collection for a user. Returns null if a case-insensitive
 * duplicate name already exists for the same user.
 */
export async function createCollection(
  userId: string,
  data: CreateCollectionInput
): Promise<CreatedCollection | null> {
  const existing = await prisma.collection.findFirst({
    where: {
      userId,
      name: {
        equals: data.name,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  if (existing) {
    return null;
  }

  return prisma.collection.create({
    data: {
      userId,
      name: data.name,
      description: data.description,
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });
}

/**
 * Update collection metadata for a user.
 */
export async function updateCollection(
  userId: string,
  collectionId: string,
  data: UpdateCollectionInput
): Promise<CreatedCollection | "NOT_FOUND" | "DUPLICATE"> {
  const existing = await prisma.collection.findFirst({
    where: {
      id: collectionId,
      userId,
    },
    select: { id: true },
  });

  if (!existing) {
    return "NOT_FOUND";
  }

  const duplicate = await prisma.collection.findFirst({
    where: {
      userId,
      id: { not: collectionId },
      name: {
        equals: data.name,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  if (duplicate) {
    return "DUPLICATE";
  }

  return prisma.collection.update({
    where: { id: collectionId },
    data: {
      name: data.name,
      description: data.description,
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });
}

/**
 * Delete a collection for a user.
 * This removes item-to-collection links, but keeps the items.
 */
export async function deleteCollection(
  userId: string,
  collectionId: string
): Promise<boolean> {
  const result = await prisma.collection.deleteMany({
    where: {
      id: collectionId,
      userId,
    },
  });

  return result.count > 0;
}

/**
 * Toggle isFavorite on a collection. Returns new value or null if not found/unauthorized.
 */
export async function toggleCollectionFavorite(
  userId: string,
  collectionId: string
): Promise<{ isFavorite: boolean } | null> {
  const existing = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    select: { isFavorite: true },
  });

  if (!existing) return null;

  const updated = await prisma.collection.update({
    where: { id: collectionId },
    data: { isFavorite: !existing.isFavorite },
    select: { isFavorite: true },
  });

  return { isFavorite: updated.isFavorite };
}

export interface FavoriteCollection {
  id: string;
  name: string;
  itemCount: number;
  updatedAt: string;
}

/**
 * Fetch all favorited collections for a user, sorted by most recently updated.
 */
export async function getFavoriteCollections(
  userId: string
): Promise<FavoriteCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId, isFavorite: true },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      updatedAt: true,
      _count: { select: { items: true } },
    },
  });

  return collections.map((col) => ({
    id: col.id,
    name: col.name,
    itemCount: col._count.items,
    updatedAt: col.updatedAt.toISOString(),
  }));
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
