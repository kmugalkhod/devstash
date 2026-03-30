import { z } from "zod";

export const FONT_SIZE_OPTIONS = [12, 13, 14, 16, 18] as const;
export const TAB_SIZE_OPTIONS = [2, 4, 8] as const;
export const WORD_WRAP_OPTIONS = ["on", "off"] as const;
export const THEME_OPTIONS = ["vs-dark", "monokai", "github-dark"] as const;

export type EditorWordWrap = (typeof WORD_WRAP_OPTIONS)[number];
export type EditorTheme = (typeof THEME_OPTIONS)[number];

export interface EditorPreferences {
  fontSize: number;
  tabSize: number;
  wordWrap: EditorWordWrap;
  minimap: boolean;
  theme: EditorTheme;
}

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  fontSize: 13,
  tabSize: 2,
  wordWrap: "on",
  minimap: false,
  theme: "vs-dark",
};

export const THEME_LABELS: Record<EditorTheme, string> = {
  "vs-dark": "VS Dark",
  monokai: "Monokai",
  "github-dark": "GitHub Dark",
};

function isAllowedFontSize(value: number): boolean {
  return FONT_SIZE_OPTIONS.includes(value as (typeof FONT_SIZE_OPTIONS)[number]);
}

function isAllowedTabSize(value: number): boolean {
  return TAB_SIZE_OPTIONS.includes(value as (typeof TAB_SIZE_OPTIONS)[number]);
}

export const editorPreferencesSchema = z.object({
  fontSize: z
    .number()
    .int()
    .refine((value) => isAllowedFontSize(value), { message: "Invalid font size" }),
  tabSize: z
    .number()
    .int()
    .refine((value) => isAllowedTabSize(value), { message: "Invalid tab size" }),
  wordWrap: z.enum(WORD_WRAP_OPTIONS),
  minimap: z.boolean(),
  theme: z.enum(THEME_OPTIONS),
});

const partialEditorPreferencesSchema = editorPreferencesSchema.partial();

export function normalizeEditorPreferences(input: unknown): EditorPreferences {
  const parsed = partialEditorPreferencesSchema.safeParse(input);

  if (!parsed.success) {
    return DEFAULT_EDITOR_PREFERENCES;
  }

  const merged = {
    ...DEFAULT_EDITOR_PREFERENCES,
    ...parsed.data,
  };

  const normalized = editorPreferencesSchema.safeParse(merged);
  if (!normalized.success) {
    return DEFAULT_EDITOR_PREFERENCES;
  }

  return normalized.data;
}
