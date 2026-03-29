"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { iconMap } from "@/lib/icons";
import { createItem } from "@/actions/items";
import type { CollectionOption, ItemTypeInfo } from "@/lib/db/items";
import { CodeEditor } from "./CodeEditor";
import { MarkdownEditor } from "./MarkdownEditor";
import { FileUpload, type UploadedFileMeta } from "./FileUpload";
import type { UploadItemType } from "@/lib/upload-constraints";
import { cn } from "@/lib/utils";

const FREE_TYPES = ["snippet", "prompt", "command", "note", "file", "image", "link"];

const CONTENT_PLACEHOLDER: Record<string, string> = {
  snippet: "Paste your code here...",
  command: "Enter your command...",
  prompt: "Enter your prompt...",
  note: "Write your note...",
};

interface NewItemDialogProps {
  itemTypes: ItemTypeInfo[];
  collections: CollectionOption[];
  defaultTypeName?: string;
  defaultCollectionIds?: string[];
  triggerLabel?: string;
  triggerIcon?: React.ReactNode;
  triggerVariant?: React.ComponentProps<typeof Button>["variant"];
  triggerClassName?: string;
}

const inputClass =
  "w-full rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-all focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600";

export function NewItemDialog({
  itemTypes,
  collections,
  defaultTypeName,
  defaultCollectionIds,
  triggerLabel,
  triggerIcon,
  triggerVariant = "default",
  triggerClassName,
}: NewItemDialogProps) {
  const router = useRouter();
  const availableTypes = useMemo(
    () => itemTypes.filter((t) => FREE_TYPES.includes(t.name)),
    [itemTypes]
  );
  const normalizedDefaultTypeName =
    defaultTypeName && availableTypes.some((type) => type.name === defaultTypeName)
      ? defaultTypeName
      : "";
  const normalizedDefaultCollectionIds = useMemo(
    () => [...new Set((defaultCollectionIds ?? []).map((id) => id.trim()).filter(Boolean))],
    [defaultCollectionIds]
  );

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedTypeName, setSelectedTypeName] = useState(normalizedDefaultTypeName);
  const [codeContent, setCodeContent] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFileMeta | null>(null);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(
    normalizedDefaultCollectionIds
  );

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
  const showFileUpload =
    selectedType && ["file", "image"].includes(selectedType.name);
  const selectedUploadType: UploadItemType | null =
    selectedType?.name === "file" || selectedType?.name === "image"
      ? selectedType.name
      : null;

  function resetDialogState() {
    setSelectedTypeName(normalizedDefaultTypeName);
    setCodeContent("");
    setCodeLanguage("");
    setMarkdownContent("");
    setUploadedFile(null);
    setSelectedCollectionIds(normalizedDefaultCollectionIds);
  }

  function toggleCollection(collectionId: string) {
    setSelectedCollectionIds((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    );
  }

  function handleTypeSelect(typeName: string) {
    if (typeName !== selectedTypeName) {
      setCodeContent("");
      setCodeLanguage("");
      setMarkdownContent("");
      setUploadedFile(null);
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

    if (showFileUpload && !uploadedFile) {
      toast.error("Please upload a file before creating this item");
      return;
    }

    // Use controlled state for code editor types, FormData for others
    const content = showFileUpload
      ? null
      : showCodeEditor
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
      fileUrl: showFileUpload ? uploadedFile?.key ?? null : null,
      fileName: showFileUpload ? uploadedFile?.fileName ?? null : null,
      fileSize: showFileUpload ? uploadedFile?.fileSize ?? null : null,
      url: (form.get("url") as string) || null,
      language,
      itemTypeId: selectedType.id,
      tags,
      collectionIds: selectedCollectionIds,
    });
    setSaving(false);

    if (result.success) {
      toast.success("Item created");
      resetDialogState();
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetDialogState();
    }
  }

  return (
    <>
      <Button
        variant={triggerVariant}
        className={cn(triggerClassName)}
        onClick={() => {
          resetDialogState();
          setOpen(true);
        }}
      >
        {triggerIcon ?? <Plus className="size-4" />}
        {triggerLabel ? (
          <span>{triggerLabel}</span>
        ) : (
          <>
            <span className="sm:hidden">New</span>
            <span className="hidden sm:inline">New Item</span>
          </>
        )}
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

            {/* File upload */}
            {showFileUpload && selectedUploadType && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-200">
                  Upload
                </label>
                <FileUpload
                  itemType={selectedUploadType}
                  value={uploadedFile}
                  onChange={setUploadedFile}
                  disabled={saving}
                />
              </div>
            )}

            {/* Collections */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <label className="text-sm font-semibold text-zinc-200">
                  Collections
                </label>
                <span className="text-xs text-zinc-500">optional</span>
              </div>

              {collections.length === 0 ? (
                <p className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-500">
                  No collections yet. Create one to organize items.
                </p>
              ) : (
                <div className="max-h-36 space-y-2 overflow-y-auto rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-2">
                  {collections.map((collection) => {
                    const checked = selectedCollectionIds.includes(collection.id);

                    return (
                      <label
                        key={collection.id}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800/70"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCollection(collection.id)}
                          className="size-4 rounded border-zinc-700 bg-zinc-900 text-zinc-100"
                        />
                        <span className="truncate">{collection.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

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
              disabled={saving || !selectedType || (showFileUpload && !uploadedFile)}
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
