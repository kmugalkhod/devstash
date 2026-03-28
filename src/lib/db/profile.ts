import { prisma } from "@/lib/prisma";

export interface ProfileUser {
  name: string;
  email: string;
  image: string | null;
  hasPassword: boolean;
  createdAt: Date;
}

export interface ProfileStats {
  totalItems: number;
  totalCollections: number;
  itemsByType: { name: string; icon: string; color: string; count: number }[];
}

export async function getProfileUser(userId: string): Promise<ProfileUser> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      image: true,
      password: true,
      createdAt: true,
    },
  });

  return {
    name: user.name ?? "",
    email: user.email ?? "",
    image: user.image,
    hasPassword: !!user.password,
    createdAt: user.createdAt,
  };
}

export async function getProfileStats(
  userId: string
): Promise<ProfileStats> {
  const [totalItems, totalCollections, groupedCounts] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.item.groupBy({
      by: ["itemTypeId"],
      where: { userId },
      _count: { _all: true },
    }),
  ]);

  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    select: { id: true, name: true, icon: true, color: true },
  });

  const countMap = new Map<string, number>();
  for (const group of groupedCounts) {
    countMap.set(group.itemTypeId, group._count._all);
  }

  const itemsByType = itemTypes.map((t) => ({
    name: t.name,
    icon: t.icon,
    color: t.color,
    count: countMap.get(t.id) ?? 0,
  }));

  return { totalItems, totalCollections, itemsByType };
}
