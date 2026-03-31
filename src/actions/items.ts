"use server";

import { z } from "zod";
import { auth } from "@/auth";
import {
  createItem as createItemDb,
  updateItem as updateItemDb,
  deleteItem as deleteItemDb,
  toggleItemFavorite as toggleItemFavoriteDb,
  toggleItemPin as toggleItemPinDb,
} from "@/lib/db/items";
import { isR2KeyOwnedByUser } from "@/lib/r2";
import { revalidatePath } from "next/cache";

const createItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional().transform((v) => v || null),
  content: z.string().nullable().optional().transform((v) => v || null),
  fileUrl: z.string().trim().nullable().optional().transform((v) => v || null),
  fileName: z.string().trim().nullable().optional().transform((v) => v || null),
  fileSize: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  url: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .nullable()
    .optional()
    .transform((v) => v || null),
  language: z.string().trim().nullable().optional().transform((v) => v || null),
  itemTypeId: z.string().min(1, "Item type is required"),
  tags: z.array(z.string().trim().min(1)).default([]),
  collectionIds: z.array(z.string().min(1)).default([]),
});

export async function createItem(formData: z.input<typeof createItemSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = createItemSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Validation failed",
    };
  }

  try {
    const fileUrl = parsed.data.fileUrl?.trim() ?? null;
    const hasFileName = parsed.data.fileName !== null;
    const hasFileSize = parsed.data.fileSize !== null;

    if (fileUrl && !isR2KeyOwnedByUser(session.user.id, fileUrl)) {
      return { success: false as const, error: "Invalid uploaded file reference" };
    }

    if (!fileUrl && (hasFileName || hasFileSize)) {
      return { success: false as const, error: "Invalid file metadata" };
    }

    if (fileUrl && (!hasFileName || !hasFileSize)) {
      return { success: false as const, error: "Missing file metadata" };
    }

    const id = await createItemDb(session.user.id, {
      ...parsed.data,
      fileUrl,
    });
    revalidatePath("/dashboard");
    return { success: true as const, data: { id } };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_COLLECTION_SELECTION"
    ) {
      return { success: false as const, error: "Invalid collection selection" };
    }

    return { success: false as const, error: "Failed to create item" };
  }
}

const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional().transform((v) => v || null),
  content: z.string().nullable().optional().transform((v) => v || null),
  url: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .nullable()
    .optional()
    .transform((v) => v || null),
  language: z.string().trim().nullable().optional().transform((v) => v || null),
  tags: z.array(z.string().trim().min(1)).default([]),
  collectionIds: z.array(z.string().min(1)).default([]),
});

export async function updateItem(
  itemId: string,
  formData: z.input<typeof updateItemSchema>
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = updateItemSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Validation failed",
    };
  }

  try {
    const updated = await updateItemDb(itemId, session.user.id, parsed.data);
    if (!updated) {
      return { success: false as const, error: "Item not found" };
    }
    return { success: true as const, data: updated };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_COLLECTION_SELECTION"
    ) {
      return { success: false as const, error: "Invalid collection selection" };
    }

    return { success: false as const, error: "Failed to update item" };
  }
}

export async function toggleFavorite(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const result = await toggleItemFavoriteDb(itemId, session.user.id);
  if (!result) {
    return { success: false as const, error: "Item not found" };
  }

  revalidatePath("/dashboard/favorites");
  return { success: true as const, data: result };
}

export async function togglePin(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const result = await toggleItemPinDb(itemId, session.user.id);
  if (!result) {
    return { success: false as const, error: "Item not found" };
  }

  revalidatePath("/", "layout");
  return { success: true as const, data: result };
}

export async function deleteItem(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  try {
    const deleted = await deleteItemDb(itemId, session.user.id);
    if (!deleted) {
      return { success: false as const, error: "Item not found" };
    }
    revalidatePath("/dashboard");
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Failed to delete item" };
  }
}
