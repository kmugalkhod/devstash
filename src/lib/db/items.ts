import { prisma } from "@/lib/prisma";
import { deleteFromR2, isR2KeyOwnedByUser } from "@/lib/r2";

export interface ItemTypeInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface SidebarCollection {
  id: string;
  name: string;
  isFavorite: boolean;
  dominantColor: string | null;
}

export interface CollectionOption {
  id: string;
  name: string;
}

/**
 * Fetch all system item types (for sidebar navigation).
 */
export async function getSystemItemTypes(): Promise<ItemTypeInfo[]> {
  const types = await prisma.itemType.findMany({
    where: { isSystem: true },
    select: { id: true, name: true, icon: true, color: true },
  });

  const order = ["snippet", "prompt", "command", "note", "file", "image", "link"];
  return types.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
}

/**
 * Fetch sidebar collections: favorites + recent (non-favorite),
 * each with the dominant item type color.
 */
export async function getSidebarCollections(
  userId: string
): Promise<{ favorites: SidebarCollection[]; recents: SidebarCollection[] }> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      isFavorite: true,
      items: {
        select: {
          item: {
            select: {
              itemType: { select: { color: true } },
            },
          },
        },
      },
    },
  });

  function getDominantColor(
    items: { item: { itemType: { color: string } } }[]
  ): string | null {
    if (items.length === 0) return null;
    const counts = new Map<string, number>();
    for (const ic of items) {
      const color = ic.item.itemType.color;
      counts.set(color, (counts.get(color) ?? 0) + 1);
    }
    let max = 0;
    let dominant: string | null = null;
    for (const [color, count] of counts) {
      if (count > max) {
        max = count;
        dominant = color;
      }
    }
    return dominant;
  }

  const mapped = collections.map((col) => ({
    id: col.id,
    name: col.name,
    isFavorite: col.isFavorite,
    dominantColor: getDominantColor(col.items),
  }));

  return {
    favorites: mapped.filter((c) => c.isFavorite),
    recents: mapped.filter((c) => !c.isFavorite).slice(0, 5),
  };
}

/**
 * Fetch all collections available for item assignment.
 */
export async function getAvailableCollections(
  userId: string
): Promise<CollectionOption[]> {
  return prisma.collection.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export interface DashboardItem {
  id: string;
  title: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
  type: ItemTypeInfo;
  tags: string[];
}

/**
 * Fetch items for a user filtered by type name, ordered by most recent.
 */
export async function getItemsByType(
  userId: string,
  typeName: string
): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: {
      userId,
      itemType: { name: typeName },
    },
    orderBy: { createdAt: "desc" },
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });

  return items.map(mapItem);
}

/**
 * Fetch items for a user that belong to a specific collection.
 */
export async function getItemsByCollectionId(
  userId: string,
  collectionId: string
): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: {
      userId,
      collections: {
        some: {
          collectionId,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });

  return items.map(mapItem);
}

/**
 * Fetch pinned items for a user, ordered by most recently updated.
 */
export async function getPinnedItems(userId: string, limit = 8): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });

  return items.map(mapItem);
}

/**
 * Fetch recent items for a user (max 10), ordered by creation date.
 */
export async function getRecentItems(
  userId: string,
  limit = 10
): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });

  return items.map(mapItem);
}

export interface SidebarUser {
  name: string;
  email: string;
  image: string | null;
}

/**
 * Fetch user info for sidebar display.
 */
export async function getSidebarUser(userId: string): Promise<SidebarUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, image: true },
  });

  if (!user) {
    return { name: "User", email: "", image: null };
  }
  return {
    name: user.name ?? "User",
    email: user.email ?? "",
    image: user.image,
  };
}

export interface ItemDetail {
  id: string;
  title: string;
  contentType: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  url: string | null;
  description: string | null;
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  type: ItemTypeInfo;
  tags: string[];
  collections: { id: string; name: string }[];
  availableCollections: CollectionOption[];
}

/**
 * Fetch a single item by ID with full detail (type, tags, collections).
 * Returns null if not found or doesn't belong to the user.
 */
export async function getItemById(
  itemId: string,
  userId: string
): Promise<ItemDetail | null> {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
      collections: {
        include: { collection: { select: { id: true, name: true } } },
      },
    },
  });

  if (!item || item.userId !== userId) return null;

  const availableCollections = await getAvailableCollections(userId);

  return {
    id: item.id,
    title: item.title,
    contentType: item.contentType,
    content: item.content,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    url: item.url,
    description: item.description,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    type: item.itemType,
    tags: item.tags.map((t) => t.tag.name),
    collections: item.collections.map((c) => c.collection),
    availableCollections,
  };
}

async function validateOwnedCollectionIds(
  userId: string,
  collectionIds: string[]
): Promise<string[]> {
  const uniqueIds = [...new Set(collectionIds.map((id) => id.trim()).filter(Boolean))];

  if (uniqueIds.length === 0) {
    return [];
  }

  const owned = await prisma.collection.findMany({
    where: {
      userId,
      id: { in: uniqueIds },
    },
    select: { id: true },
  });

  if (owned.length !== uniqueIds.length) {
    throw new Error("INVALID_COLLECTION_SELECTION");
  }

  return uniqueIds;
}

/**
 * Update an item's editable fields and replace its tags.
 * Returns the full ItemDetail so the drawer can refresh without a second fetch.
 */
export async function updateItem(
  itemId: string,
  userId: string,
  data: {
    title: string;
    description: string | null;
    content: string | null;
    url: string | null;
    language: string | null;
    tags: string[];
    collectionIds: string[];
  }
): Promise<ItemDetail | null> {
  const existing = await prisma.item.findUnique({
    where: { id: itemId },
    select: { userId: true },
  });

  if (!existing || existing.userId !== userId) return null;

  const collectionIds = await validateOwnedCollectionIds(userId, data.collectionIds);

  const item = await prisma.item.update({
    where: { id: itemId },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      tags: {
        deleteMany: {},
        create: data.tags.map((tagName) => ({
          tag: {
            connectOrCreate: {
              where: { name: tagName },
              create: { name: tagName },
            },
          },
        })),
      },
      collections: {
        deleteMany: {},
        create: collectionIds.map((collectionId) => ({
          collection: {
            connect: { id: collectionId },
          },
        })),
      },
    },
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
      collections: {
        include: { collection: { select: { id: true, name: true } } },
      },
    },
  });

  return {
    id: item.id,
    title: item.title,
    contentType: item.contentType,
    content: item.content,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    url: item.url,
    description: item.description,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    type: item.itemType,
    tags: item.tags.map((t) => t.tag.name),
    collections: item.collections.map((c) => c.collection),
    availableCollections: await getAvailableCollections(userId),
  };
}

/**
 * Create a new item with tags. Returns the created item's ID.
 */
export async function createItem(
  userId: string,
  data: {
    title: string;
    description: string | null;
    content: string | null;
    fileUrl: string | null;
    fileName: string | null;
    fileSize: number | null;
    url: string | null;
    language: string | null;
    itemTypeId: string;
    tags: string[];
    collectionIds: string[];
  }
): Promise<string> {
  const itemType = await prisma.itemType.findUnique({
    where: { id: data.itemTypeId },
    select: { name: true },
  });

  const contentType =
    itemType?.name === "link" ? "url" : itemType?.name === "file" || itemType?.name === "image" ? "file" : "text";

  const collectionIds = await validateOwnedCollectionIds(userId, data.collectionIds);

  const item = await prisma.item.create({
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      url: data.url,
      language: data.language,
      contentType,
      userId,
      itemTypeId: data.itemTypeId,
      tags: {
        create: data.tags.map((tagName) => ({
          tag: {
            connectOrCreate: {
              where: { name: tagName },
              create: { name: tagName },
            },
          },
        })),
      },
      collections: {
        create: collectionIds.map((collectionId) => ({
          collection: {
            connect: { id: collectionId },
          },
        })),
      },
    },
    select: { id: true },
  });

  return item.id;
}

/**
 * Delete an item by ID. Returns true if deleted, false if not found/unauthorized.
 */
export async function deleteItem(
  itemId: string,
  userId: string
): Promise<boolean> {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: { userId: true, fileUrl: true },
  });

  if (!item || item.userId !== userId) return false;

  if (item.fileUrl && isR2KeyOwnedByUser(userId, item.fileUrl)) {
    await deleteFromR2(item.fileUrl);
  }

  await prisma.item.delete({ where: { id: itemId } });
  return true;
}

function mapItem(item: {
  id: string;
  title: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  itemType: ItemTypeInfo;
  tags: { tag: { name: string } }[];
}): DashboardItem {
  return {
    id: item.id,
    title: item.title,
    content: item.content,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt.toISOString(),
    type: item.itemType,
    tags: item.tags.map((t) => t.tag.name),
  };
}
