"use server";

import { auth } from "@/auth";
import { toggleCollectionFavorite as toggleCollectionFavoriteDb } from "@/lib/db/collections";
import { revalidatePath } from "next/cache";

export async function toggleCollectionFavorite(collectionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const result = await toggleCollectionFavoriteDb(session.user.id, collectionId);
  if (!result) {
    return { success: false as const, error: "Collection not found" };
  }

  revalidatePath("/dashboard/favorites");
  revalidatePath("/collections");
  return { success: true as const, data: result };
}
