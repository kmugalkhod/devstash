"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { iconMap } from "@/lib/icons";
import { createItem } from "@/actions/items";
import type { ItemTypeInfo } from "@/lib/db/items";
import { CodeEditor } from "./CodeEditor";
import { MarkdownEditor } from "./MarkdownEditor";

const FREE_TYPES = ["snippet", "prompt", "command", "note", "link"];

const CONTENT_PLACEHOLDER: Record<string, string> = {
  snippet: "Paste your code here...",
  command: "Enter your command...",
  prompt: "Enter your prompt...",
  note: "Write your note...",
};

interface NewItemDialogProps {
  itemTypes: ItemTypeInfo[];
}

const inputClass =
  "w-full rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-all focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600";

export function NewItemDialog({ itemTypes }: NewItemDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedTypeName, setSelectedTypeName] = useState("");
  const [codeContent, setCodeContent] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");

  const availableTypes = itemTypes.filter((t) => FREE_TYPES.includes(t.name));
  const selectedType = availableTypes.find((t) => t.name === selectedTypeName);

  const showContent =
    selectedType &&
    ["snippet", "prompt", "command", "note"].includes(selectedType.name);
  const showLanguage =
    selectedType && ["snippet", "command"].includes(selectedType.name);
  const showUrl = selectedType?.name === "link";

  const showCodeEditor =
    selectedType && ["snippet", "command"].includes(selectedType.name);
  const showMarkdownEditor =
    selectedType && ["prompt", "note"].includes(selectedType.name);

  function handleTypeSelect(typeName: string) {
    if (typeName !== selectedTypeName) {
      setCodeContent("");
      setCodeLanguage("");
      setMarkdownContent("");
    }
    setSelectedTypeName(typeName);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedType) return;

    const form = new FormData(e.currentTarget);
    const tagsRaw = (form.get("tags") as string) ?? "";
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Use controlled state for code editor types, FormData for others
    const content = showCodeEditor
      ? codeContent || null
      : showMarkdownEditor
        ? markdownContent || null
      : (form.get("content") as string) || null;
    const language = showCodeEditor
      ? codeLanguage || null
      : (form.get("language") as string) || null;

    setSaving(true);
    const result = await createItem({
      title: form.get("title") as string,
      description: (form.get("description") as string) || null,
      content,
      url: (form.get("url") as string) || null,
      language,
      itemTypeId: selectedType.id,
      tags,
    });
    setSaving(false);

    if (result.success) {
      toast.success("Item created");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSelectedTypeName("");
      setCodeContent("");
      setCodeLanguage("");
      setMarkdownContent("");
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        <span className="sm:hidden">New</span>
        <span className="hidden sm:inline">New Item</span>
      </Button>
      {open && <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={`gap-0 p-0 transition-all duration-200 ${showCodeEditor ? "sm:max-w-175" : "sm:max-w-130"}`}>
        {/* Header */}
        <div className="px-6 pb-4 pt-6">
          <h2 className="text-base font-semibold text-zinc-100">New Item</h2>
          <p className="mt-0.5 text-sm text-zinc-400">
            Add a new item to your collection.
          </p>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto space-y-4 px-6 pb-6">
            {/* Type pills */}
            <div className="space-y-2.5">
              <label className="block text-sm font-semibold text-zinc-200">
                Type
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTypes.map((type) => {
                  const Icon = iconMap[type.icon];
                  const isSelected = selectedTypeName === type.name;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleTypeSelect(type.name)}
                      className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all"
                      style={{
                        borderColor: isSelected
                          ? type.color
                          : "rgba(255,255,255,0.08)",
                        backgroundColor: isSelected
                          ? `${type.color}18`
                          : "transparent",
                        color: isSelected
                          ? type.color
                          : "rgba(161,161,170,1)",
                        boxShadow: isSelected
                          ? `0 0 16px ${type.color}25`
                          : "none",
                      }}
                    >
                      {Icon && <Icon className="size-3.5" />}
                      <span className="capitalize">{type.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-zinc-200"
              >
                Title
              </label>
              <input
                id="title"
                name="title"
                placeholder="Give your item a name"
                required
                className={inputClass}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <label
                  htmlFor="description"
                  className="text-sm font-semibold text-zinc-200"
                >
                  Description
                </label>
                <span className="text-xs text-zinc-500">optional</span>
              </div>
              <input
                id="description"
                name="description"
                placeholder="Brief description"
                className={inputClass}
              />
            </div>

            {/* Language — shown BEFORE content so highlighting applies on mount */}
            {showLanguage && (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <label
                    htmlFor="language"
                    className="text-sm font-semibold text-zinc-200"
                  >
                    Language
                  </label>
                  <span className="text-xs text-zinc-500">optional</span>
                </div>
                <input
                  id="language"
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  placeholder="e.g. javascript, python, bash"
                  className={inputClass}
                />
              </div>
            )}

            {/* Content - Code Editor for snippet/command, textarea for others */}
            {showContent && (
              <div className="space-y-2">
                <label
                  htmlFor={showCodeEditor ? undefined : "content"}
                  className="block text-sm font-semibold text-zinc-200"
                >
                  Content
                </label>
                {showCodeEditor ? (
                  <div className="min-h-40">
                    <CodeEditor
                      value={codeContent}
                      onChange={setCodeContent}
                      language={codeLanguage}
                    />
                  </div>
                ) : showMarkdownEditor ? (
                  <MarkdownEditor
                    value={markdownContent}
                    onChange={setMarkdownContent}
                    placeholder={
                      CONTENT_PLACEHOLDER[selectedType.name] ?? "Write markdown..."
                    }
                  />
                ) : (
                  <textarea
                    id="content"
                    name="content"
                    placeholder={
                      CONTENT_PLACEHOLDER[selectedType.name] ?? "Enter content..."
                    }
                    rows={6}
                    className={`${inputClass} resize-y font-mono`}
                  />
                )}
              </div>
            )}

            {/* URL */}
            {showUrl && (
              <div className="space-y-2">
                <label
                  htmlFor="url"
                  className="block text-sm font-semibold text-zinc-200"
                >
                  URL
                </label>
                <input
                  id="url"
                  name="url"
                  type="url"
                  placeholder="https://..."
                  required
                  className={inputClass}
                />
              </div>
            )}

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <label
                  htmlFor="tags"
                  className="text-sm font-semibold text-zinc-200"
                >
                  Tags
                </label>
                <span className="text-xs text-zinc-500">comma-separated</span>
              </div>
              <input
                id="tags"
                name="tags"
                placeholder="react, hooks, typescript"
                className={inputClass}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t border-zinc-800/60 px-6 py-4">
            <Button
              type="submit"
              disabled={saving || !selectedType}
              style={
                selectedType && !saving
                  ? { backgroundColor: selectedType.color, color: "#fff" }
                  : undefined
              }
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Create Item
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
      </Dialog>}
    </>
  );
}
