import { prisma } from "@/lib/prisma";

const PRO_ITEM_TYPES = new Set(["file", "image"]);

export function isProItemType(typeName: string): boolean {
  return PRO_ITEM_TYPES.has(typeName);
}

export async function isUserPro(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true, proExpiresAt: true },
  });
  if (!user?.isPro) return false;
  if (user.proExpiresAt && user.proExpiresAt.getTime() < Date.now()) return false;
  return true;
}

export async function requirePro(userId: string): Promise<void> {
  const pro = await isUserPro(userId);
  if (!pro) {
    throw new ProRequiredError();
  }
}

export class ProRequiredError extends Error {
  constructor(message = "Pro subscription required") {
    super(message);
    this.name = "ProRequiredError";
  }
}
