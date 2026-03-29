import { getAllUserCollections } from "@/lib/db/collections";
import { prisma } from "@/lib/prisma";

export interface SearchItemType {
  name: string;
  icon: string;
  color: string;
}

export interface SearchableItem {
  id: string;
  title: string;
  contentPreview: string;
  type: SearchItemType;
}

export interface SearchableCollection {
  id: string;
  name: string;
  itemCount: number;
}

export interface GlobalSearchData {
  items: SearchableItem[];
  collections: SearchableCollection[];
}

function toSingleLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function toPreview(value: string): string {
  const normalized = toSingleLine(value);
  if (normalized.length <= 120) {
    return normalized;
  }
  return `${normalized.slice(0, 117)}...`;
}

function getItemPreview(item: {
  content: string | null;
  fileName: string | null;
  url: string | null;
}): string {
  if (item.content) {
    return toPreview(item.content);
  }

  if (item.fileName) {
    return item.fileName;
  }

  if (item.url) {
    return item.url;
  }

  return "";
}

export async function getGlobalSearchData(
  userId: string
): Promise<GlobalSearchData> {
  const [items, collections] = await Promise.all([
    prisma.item.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        fileName: true,
        url: true,
        itemType: {
          select: {
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    }),
    getAllUserCollections(userId),
  ]);

  return {
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      contentPreview: getItemPreview(item),
      type: item.itemType,
    })),
    collections: collections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      itemCount: collection.itemCount,
    })),
  };
}
