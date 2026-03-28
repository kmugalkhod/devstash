"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, X } from "lucide-react";
import { updateItem } from "@/actions/items";
import type { ItemDetail } from "@/lib/db/items";
import { CodeEditor } from "./CodeEditor";
import { MarkdownEditor } from "./MarkdownEditor";

interface ItemDrawerEditProps {
  item: ItemDetail;
  onCancel: () => void;
  onSaved: (updated: ItemDetail) => void;
}

const fieldClass =
  "w-full rounded-lg border border-neutral-800 bg-[#121212] px-3 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-600 outline-none transition-all focus:ring-1 focus:ring-neutral-600";

export function ItemDrawerEdit({ item, onCancel, onSaved }: ItemDrawerEditProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [content, setContent] = useState(item.content ?? "");
  const [language, setLanguage] = useState(item.language ?? "");
  const [url, setUrl] = useState(item.url ?? "");
  const [tagsInput, setTagsInput] = useState(item.tags.join(", "));
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(
    item.collections.map((collection) => collection.id)
  );

  const typeName = item.type.name;
  const showContent = ["snippet", "prompt", "command", "note"].includes(typeName);
  const showLanguage = ["snippet", "command"].includes(typeName);
  const showMarkdownEditor = ["prompt", "note"].includes(typeName);
  const showUrl = typeName === "link";

  function toggleCollection(collectionId: string) {
    setSelectedCollectionIds((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    );
  }

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await updateItem(item.id, {
      title,
      description: description || null,
      content: showContent ? content || null : item.content,
      language: showLanguage ? language || null : item.language,
      url: showUrl ? url || null : item.url,
      tags,
      collectionIds: selectedCollectionIds,
    });

    setSaving(false);

    if (result.success) {
      toast.success("Item updated");
      onSaved(result.data);
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to update");
    }
  }

  return (
    <>
      {/* Sticky action bar */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-neutral-800/60 bg-[#0a0a0a] px-4 py-3">
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="flex items-center gap-1.5 rounded-md bg-neutral-100 px-4 py-1.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-white disabled:opacity-40"
        >
          <Save className="size-4" />
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-neutral-300 transition-colors hover:text-white disabled:opacity-40"
        >
          <X className="size-4" />
          Cancel
        </button>
      </div>

      {/* Scrollable form body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-5">
          {/* Type badge */}
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: item.type.color }}
            >
              {item.type.name}
            </span>
            <span className="text-sm text-neutral-500">(cannot be changed)</span>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="edit-title" className="block text-sm font-medium text-neutral-200">
              Title <span className="text-neutral-500">*</span>
            </label>
            <input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Item title"
              className={fieldClass}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="edit-description" className="block text-sm font-medium text-neutral-200">
              Description
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className={`${fieldClass} min-h-20 resize-y`}
            />
          </div>

          {/* Content */}
          {showContent && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-200">
                Content
              </label>
              {showLanguage ? (
                <CodeEditor
                  value={content}
                  onChange={setContent}
                  language={language}
                />
              ) : showMarkdownEditor ? (
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write markdown..."
                />
              ) : (
                <textarea
                  id="edit-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your code, prompt, command, or note..."
                  spellCheck={false}
                  className={`${fieldClass} min-h-55 resize-y font-mono leading-relaxed`}
                />
              )}
            </div>
          )}

          {/* Language */}
          {showLanguage && (
            <div className="space-y-2">
              <label htmlFor="edit-language" className="block text-sm font-medium text-neutral-200">
                Language
              </label>
              <input
                id="edit-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g. javascript, python, bash"
                className={fieldClass}
              />
            </div>
          )}

          {/* URL */}
          {showUrl && (
            <div className="space-y-2">
              <label htmlFor="edit-url" className="block text-sm font-medium text-neutral-200">
                URL
              </label>
              <input
                id="edit-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className={fieldClass}
              />
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <label htmlFor="edit-tags" className="block text-sm font-medium text-neutral-200">
              Tags
            </label>
            <input
              id="edit-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="react, hooks, typescript"
              className={fieldClass}
            />
            <p className="text-xs text-neutral-500">Separate tags with commas</p>
          </div>

          {/* Collections */}
          <div className="space-y-2.5">
            <label className="block text-sm font-medium text-neutral-200">
              Collections
            </label>

            {item.availableCollections.length === 0 ? (
              <p className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-500">
                No collections available yet.
              </p>
            ) : (
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-900/60 p-2">
                {item.availableCollections.map((collection) => {
                  const checked = selectedCollectionIds.includes(collection.id);

                  return (
                    <label
                      key={collection.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800/80"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCollection(collection.id)}
                        className="size-4 rounded border-neutral-700 bg-neutral-900 text-neutral-100"
                      />
                      <span className="truncate">{collection.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Meta dates */}
          <div className="mt-2 space-y-1.5 border-t border-neutral-800/60 pt-6">
            <p className="text-xs text-neutral-500">
              Created: {new Date(item.createdAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-neutral-500">
              Updated: {new Date(item.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
