"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type EditorTheme,
  FONT_SIZE_OPTIONS,
  TAB_SIZE_OPTIONS,
  THEME_LABELS,
  THEME_OPTIONS,
} from "@/lib/editor-preferences";
import { useEditorPreferences } from "@/components/settings/EditorPreferencesContext";

const selectClassName =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary w-full disabled:opacity-50 disabled:cursor-not-allowed";

export function EditorPreferencesSection() {
  const { preferences, setPreference, saving } = useEditorPreferences();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Editor Preferences</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Changes are saved automatically and applied across code editors.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {saving ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Auto-save enabled</span>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-4">
          <PreferenceRow
            label="Font Size"
            description="Choose the editor text size."
            control={
              <select
                className={selectClassName}
                value={String(preferences.fontSize)}
                onChange={(event) =>
                  setPreference("fontSize", Number(event.target.value))
                }
              >
                {FONT_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}px
                  </option>
                ))}
              </select>
            }
          />

          <PreferenceRow
            label="Tab Size"
            description="Set how many spaces each tab represents."
            control={
              <select
                className={selectClassName}
                value={String(preferences.tabSize)}
                onChange={(event) =>
                  setPreference("tabSize", Number(event.target.value))
                }
              >
                {TAB_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option} spaces
                  </option>
                ))}
              </select>
            }
          />

          <PreferenceRow
            label="Theme"
            description="Pick a theme for Monaco code editors."
            control={
              <select
                className={selectClassName}
                value={preferences.theme}
                onChange={(event) =>
                  setPreference("theme", event.target.value as EditorTheme)
                }
              >
                {THEME_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {THEME_LABELS[option]}
                  </option>
                ))}
              </select>
            }
          />

          <PreferenceRow
            label="Word Wrap"
            description="Wrap long lines inside the editor viewport."
            control={
              <div className="inline-flex rounded-lg border border-border p-1 bg-muted/20">
                <Button
                  type="button"
                  size="sm"
                  variant={preferences.wordWrap === "on" ? "secondary" : "ghost"}
                  onClick={() => setPreference("wordWrap", "on")}
                >
                  On
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={preferences.wordWrap === "off" ? "secondary" : "ghost"}
                  onClick={() => setPreference("wordWrap", "off")}
                >
                  Off
                </Button>
              </div>
            }
          />

          <PreferenceRow
            label="Minimap"
            description="Show the code minimap on the right side."
            control={
              <div className="inline-flex rounded-lg border border-border p-1 bg-muted/20">
                <Button
                  type="button"
                  size="sm"
                  variant={preferences.minimap ? "secondary" : "ghost"}
                  onClick={() => setPreference("minimap", true)}
                >
                  On
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={!preferences.minimap ? "secondary" : "ghost"}
                  onClick={() => setPreference("minimap", false)}
                >
                  Off
                </Button>
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}

function PreferenceRow({
  label,
  description,
  control,
}: {
  label: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 border-t border-border pt-4 first:border-t-0 first:pt-0 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
      <div>
        <h3 className="text-sm font-medium">{label}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <div>{control}</div>
    </div>
  );
}
