"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  editorPreferencesSchema,
  type EditorPreferences,
} from "@/lib/editor-preferences";

export async function updateEditorPreferences(preferences: EditorPreferences) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = editorPreferencesSchema.safeParse(preferences);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid editor preferences" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        editorPreferences: parsed.data,
      },
    });

    return { success: true as const, data: parsed.data };
  } catch (error) {
    console.error("Failed to update editor preferences", error);
    return {
      success: false as const,
      error: "Failed to save editor preferences",
    };
  }
}
