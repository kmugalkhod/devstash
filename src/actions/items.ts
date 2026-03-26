"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { updateItem as updateItemDb, deleteItem as deleteItemDb } from "@/lib/db/items";
import { revalidatePath } from "next/cache";

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
  } catch {
    return { success: false as const, error: "Failed to update item" };
  }
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
