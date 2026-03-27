"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

type Tab = "write" | "preview";

export function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  placeholder,
}: MarkdownEditorProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("write");

  const showPreview = readOnly || activeTab === "preview";

  async function handleCopy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-neutral-800/90 bg-[#1e1e1e] transition-all focus-within:border-zinc-600 focus-within:ring-2 focus-within:ring-zinc-700/40">
      <div className="flex items-center gap-3 border-b border-neutral-800/80 bg-[#2d2d2d] px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-full bg-[#ff5f57]" />
          <div className="size-3 rounded-full bg-[#febc2e]" />
          <div className="size-3 rounded-full bg-[#28c840]" />
        </div>

        <div className="flex flex-1 justify-center">
          {readOnly ? (
            <span className="rounded-full border border-zinc-700/70 bg-zinc-800/80 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-zinc-300">
              Preview
            </span>
          ) : (
            <div className="flex items-center gap-1 rounded-full border border-zinc-700/70 bg-zinc-800/80 p-0.5">
              <button
                type="button"
                onClick={() => setActiveTab("write")}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide transition-colors ${
                  activeTab === "write"
                    ? "bg-zinc-200 text-zinc-900"
                    : "text-zinc-300 hover:text-zinc-100"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide transition-colors ${
                  activeTab === "preview"
                    ? "bg-zinc-200 text-zinc-900"
                    : "text-zinc-300 hover:text-zinc-100"
                }`}
              >
                Preview
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          title="Copy markdown"
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

      {!readOnly && !showPreview ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder ?? "Write markdown..."}
          spellCheck={false}
          rows={8}
          className="block max-h-100 min-h-40 w-full resize-y bg-[#1e1e1e] px-4 py-3 font-mono text-sm leading-relaxed text-zinc-200 outline-none placeholder:text-zinc-500"
        />
      ) : (
        <div className="max-h-100 overflow-y-auto px-4 py-3">
          {value.trim() ? (
            <div className="markdown-preview">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}