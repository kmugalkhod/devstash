import { prisma } from "@/lib/prisma";
import {
  DEFAULT_EDITOR_PREFERENCES,
  normalizeEditorPreferences,
  type EditorPreferences,
} from "@/lib/editor-preferences";

export async function getUserEditorPreferences(
  userId: string
): Promise<EditorPreferences> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { editorPreferences: true },
    });

    return normalizeEditorPreferences(user?.editorPreferences);
  } catch (error) {
    console.warn("Falling back to default editor preferences", error);
    return DEFAULT_EDITOR_PREFERENCES;
  }
}
