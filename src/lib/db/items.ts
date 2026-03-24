import { prisma } from "@/lib/prisma";

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

export interface DashboardItem {
  id: string;
  title: string;
  content: string | null;
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

function mapItem(item: {
  id: string;
  title: string;
  content: string | null;
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
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt.toISOString(),
    type: item.itemType,
    tags: item.tags.map((t) => t.tag.name),
  };
}
