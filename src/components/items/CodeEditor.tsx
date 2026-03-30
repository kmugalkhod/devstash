"use client";

import { useRef, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Copy, Check } from "lucide-react";
import { useEditorPreferences } from "@/components/settings/EditorPreferencesContext";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}

const LINE_HEIGHT = 19;
const EDITOR_PADDING = 24; // top + bottom inner padding
const MIN_LINES = 3;
const MAX_HEIGHT = 400;
let customThemesRegistered = false;

const LANGUAGE_MAP: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  jsx: "javascript",
  tsx: "typescript",
  py: "python",
  rb: "ruby",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  yml: "yaml",
  yaml: "yaml",
  md: "markdown",
  json: "json",
  sql: "sql",
  html: "html",
  css: "css",
  go: "go",
  rs: "rust",
  java: "java",
  cpp: "cpp",
  c: "c",
  cs: "csharp",
  php: "php",
  swift: "swift",
  kt: "kotlin",
  dockerfile: "dockerfile",
};

function normalizeLanguage(lang?: string): string {
  if (!lang) return "plaintext";
  const lower = lang.toLowerCase().trim();
  return LANGUAGE_MAP[lower] ?? lower;
}

/** Heuristic language detection from content when no language is stored. */
function detectLanguage(code: string): string {
  if (!code?.trim()) return "plaintext";
  // JSON
  if (/^\s*[\[{]/.test(code) && /[\]}]\s*$/.test(code)) {
    try { JSON.parse(code); return "json"; } catch { /* not json */ }
  }
  // HTML/JSX
  if (/<\/?[a-zA-Z][^>]*>/.test(code)) return "html";
  // SQL
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|WITH)\b/im.test(code)) return "sql";
  // Shell/bash
  if (/^#!\/bin\/(ba)?sh/.test(code) || /^\s*(apt|brew|npm|yarn|pip|docker|kubectl|git|cd|ls|echo|export)\s/m.test(code)) return "shell";
  // Python
  if (/\bdef \w+\(|import \w+|from \w+ import|\bprint\(/.test(code)) return "python";
  // TypeScript (before JS — more specific)
  if (/:\s*(string|number|boolean|void|any|unknown|never|Record|Promise)\b|<[A-Z]\w*>|interface \w+|type \w+ =/.test(code)) return "typescript";
  // JavaScript / JSX
  if (/\b(const|let|var|function|=>\s*[\({]|import |require\(|module\.exports)/.test(code)) return "javascript";
  // Go
  if (/\bfunc \w+|package main|:=/.test(code)) return "go";
  // Rust
  if (/\bfn \w+|let mut |use std::/.test(code)) return "rust";
  // CSS
  if (/[.#]?\w+\s*\{[^}]*:\s*[^}]+\}/.test(code)) return "css";
  // YAML
  if (/^\s*\w[\w-]*:\s+\S/m.test(code) && !/{/.test(code)) return "yaml";

  return "plaintext";
}

function registerCustomThemes(monaco: Parameters<OnMount>[1]) {
  if (customThemesRegistered) {
    return;
  }

  monaco.editor.defineTheme("monokai", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "75715e" },
      { token: "string", foreground: "e6db74" },
      { token: "number", foreground: "ae81ff" },
      { token: "keyword", foreground: "f92672" },
      { token: "type", foreground: "66d9ef" },
    ],
    colors: {
      "editor.background": "#272822",
      "editor.foreground": "#f8f8f2",
      "editorLineNumber.foreground": "#75715e",
      "editor.selectionBackground": "#49483e",
      "editor.inactiveSelectionBackground": "#3e3d32",
      "editorCursor.foreground": "#f8f8f0",
    },
  });

  monaco.editor.defineTheme("github-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "8b949e" },
      { token: "string", foreground: "a5d6ff" },
      { token: "number", foreground: "79c0ff" },
      { token: "keyword", foreground: "ff7b72" },
      { token: "type", foreground: "ffa657" },
    ],
    colors: {
      "editor.background": "#0d1117",
      "editor.foreground": "#c9d1d9",
      "editorLineNumber.foreground": "#6e7681",
      "editor.selectionBackground": "#264f78",
      "editor.inactiveSelectionBackground": "#1f3552",
      "editorCursor.foreground": "#58a6ff",
    },
  });

  customThemesRegistered = true;
}

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [editorHeight, setEditorHeight] = useState(120);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const { preferences: editorPreferences } = useEditorPreferences();

  async function handleCopy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    registerCustomThemes(monaco);

    function updateHeight() {
      const lineCount = Math.max(
        MIN_LINES,
        editor.getModel()?.getLineCount() ?? MIN_LINES,
      );
      const newHeight = Math.min(
        MAX_HEIGHT,
        lineCount * LINE_HEIGHT + EDITOR_PADDING,
      );
      setEditorHeight(newHeight);
    }

    updateHeight();
    editor.onDidChangeModelContent(updateHeight);
  };

  const normalizedLang = normalizeLanguage(language) === "plaintext" && value
    ? detectLanguage(value)
    : normalizeLanguage(language);

  // Label shown in header: prefer stored language, fall back to detected
  const displayLang = language?.trim() || (value ? detectLanguage(value) : "plaintext");

  return (
    <div className="group relative overflow-hidden rounded-xl border border-neutral-800/90 bg-[#1e1e1e] transition-all focus-within:border-zinc-600 focus-within:ring-2 focus-within:ring-zinc-700/40">
      {/* macOS-style header */}
      <div className="flex items-center gap-3 border-b border-neutral-800/80 bg-linear-to-r from-zinc-900/60 to-zinc-900/20 px-4 py-2.5">
        {/* Window dots */}
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-full bg-[#ff5f57]" />
          <div className="size-3 rounded-full bg-[#febc2e]" />
          <div className="size-3 rounded-full bg-[#28c840]" />
        </div>

        {/* Language label */}
        <div className="flex flex-1 justify-center">
          <span className="rounded-full border border-zinc-700/70 bg-zinc-800/80 px-2.5 py-0.5 text-[11px] font-medium capitalize tracking-wide text-zinc-300">
            {displayLang}
          </span>
        </div>

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          title="Copy code"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-700/50 hover:text-zinc-100"
        >
          {copied ? (
            <>
              <Check className="size-3 text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Monaco Editor */}
      <Editor
        height={editorHeight}
        value={value}
        language={normalizedLang}
        theme={editorPreferences.theme}
        loading={
          <div className="flex items-center justify-center bg-[#1e1e1e]" style={{ height: editorHeight }}>
            <span className="text-xs text-neutral-600 animate-pulse">Loading editor...</span>
          </div>
        }
        options={{
          readOnly,
          domReadOnly: readOnly,
          minimap: { enabled: editorPreferences.minimap },
          fontSize: editorPreferences.fontSize,
          tabSize: editorPreferences.tabSize,
          lineHeight: LINE_HEIGHT,
          padding: { top: 20, bottom: 20 },
          scrollBeyondLastLine: false,
          wordWrap: editorPreferences.wordWrap,
          folding: false,
          lineNumbers: readOnly ? "off" : "on",
          glyphMargin: false,
          lineDecorationsWidth: readOnly ? 24 : 16,
          lineNumbersMinChars: readOnly ? 0 : 3,
          renderLineHighlight: readOnly ? "none" : "line",
          scrollbar: {
            vertical: "auto",
            horizontal: "hidden",
            verticalScrollbarSize: 6,
            useShadows: false,
          },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          contextmenu: false,
          renderWhitespace: "none",
          automaticLayout: true,
        }}
        onChange={(val) => onChange?.(val ?? "")}
        onMount={handleMount}
      />
      {!readOnly && !value.trim() && (
        <div className="pointer-events-none absolute bottom-3 left-4 text-xs text-zinc-500">
          Start typing your code...
        </div>
      )}
    </div>
  );
}
