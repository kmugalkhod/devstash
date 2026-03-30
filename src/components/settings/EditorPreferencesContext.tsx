"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { updateEditorPreferences } from "@/actions/editor-preferences";
import {
  DEFAULT_EDITOR_PREFERENCES,
  type EditorPreferences,
} from "@/lib/editor-preferences";

interface EditorPreferencesContextValue {
  preferences: EditorPreferences;
  setPreference: <K extends keyof EditorPreferences>(
    key: K,
    value: EditorPreferences[K]
  ) => void;
  saving: boolean;
}

const EditorPreferencesContext =
  createContext<EditorPreferencesContextValue | null>(null);

const noopSetPreference: EditorPreferencesContextValue["setPreference"] = () => {};

export function EditorPreferencesProvider({
  children,
  initialPreferences,
}: {
  children: React.ReactNode;
  initialPreferences: EditorPreferences;
}) {
  const [preferences, setPreferences] = useState<EditorPreferences>(
    initialPreferences
  );
  const [saving, setSaving] = useState(false);
  const isFirstRender = useRef(true);
  const lastRequestId = useRef(0);

  const setPreference = useCallback(
    <K extends keyof EditorPreferences>(
      key: K,
      value: EditorPreferences[K]
    ) => {
      setPreferences((current) => {
        if (current[key] === value) {
          return current;
        }

        setSaving(true);

        return {
          ...current,
          [key]: value,
        };
      });
    },
    []
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      const requestId = ++lastRequestId.current;
      const result = await updateEditorPreferences(preferences);

      if (requestId !== lastRequestId.current) {
        return;
      }

      setSaving(false);

      if (!result.success) {
        toast.error(result.error ?? "Failed to save editor preferences");
        return;
      }

      toast.success("Editor preferences saved");
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [preferences]);

  const value = useMemo(
    () => ({ preferences, setPreference, saving }),
    [preferences, setPreference, saving]
  );

  return (
    <EditorPreferencesContext value={value}>
      {children}
    </EditorPreferencesContext>
  );
}

export function useEditorPreferences() {
  const context = useContext(EditorPreferencesContext);

  if (!context) {
    return {
      preferences: DEFAULT_EDITOR_PREFERENCES,
      setPreference: noopSetPreference,
      saving: false,
    };
  }

  return context;
}
