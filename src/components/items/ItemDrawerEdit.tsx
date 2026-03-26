"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateItem } from "@/actions/items";
import type { ItemDetail } from "@/lib/db/items";

interface ItemDrawerEditProps {
  item: ItemDetail;
  onCancel: () => void;
  onSaved: (updated: ItemDetail) => void;
}

export function ItemDrawerEdit({ item, onCancel, onSaved }: ItemDrawerEditProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [content, setContent] = useState(item.content ?? "");
  const [language, setLanguage] = useState(item.language ?? "");
  const [url, setUrl] = useState(item.url ?? "");
  const [tagsInput, setTagsInput] = useState(item.tags.join(", "));

  const typeName = item.type.name;
  const showContent = ["snippet", "prompt", "command", "note"].includes(typeName);
  const showLanguage = ["snippet", "command"].includes(typeName);
  const showUrl = typeName === "link";

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
      {/* Edit action bar */}
      <div className="flex items-center gap-2 border-b border-border px-4 pb-3 pt-4">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !title.trim()}
        >
          <Save className="mr-1.5 size-4" />
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={saving}>
          <X className="mr-1.5 size-4" />
          Cancel
        </Button>
      </div>

      {/* Edit form */}
      <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-6 pt-4">
        {/* Type badge (non-editable) */}
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color: item.type.color }}
          >
            {item.type.name}
          </span>
          <span className="text-xs text-muted-foreground">(cannot be changed)</span>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="edit-title">Title *</Label>
          <Input
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Item title"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="edit-description">Description</Label>
          <textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={2}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {/* Content (text-based types) */}
        {showContent && (
          <div className="space-y-1.5">
            <Label htmlFor="edit-content">Content</Label>
            <textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your code, prompt, command, or note..."
              rows={10}
              className="flex w-full rounded-md border border-input bg-black/40 px-3 py-2 font-mono text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        )}

        {/* Language (snippet, command) */}
        {showLanguage && (
          <div className="space-y-1.5">
            <Label htmlFor="edit-language">Language</Label>
            <Input
              id="edit-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g. javascript, python, bash"
            />
          </div>
        )}

        {/* URL (link type) */}
        {showUrl && (
          <div className="space-y-1.5">
            <Label htmlFor="edit-url">URL</Label>
            <Input
              id="edit-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        )}

        {/* Tags */}
        <div className="space-y-1.5">
          <Label htmlFor="edit-tags">Tags</Label>
          <Input
            id="edit-tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="react, hooks, typescript (comma-separated)"
          />
          <p className="text-xs text-muted-foreground">Separate tags with commas</p>
        </div>

        {/* Non-editable: Collections */}
        {item.collections.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-muted-foreground">Collections</Label>
            <div className="flex flex-wrap gap-2">
              {item.collections.map((col) => (
                <span
                  key={col.id}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-zinc-400"
                >
                  {col.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Non-editable: Dates */}
        <div className="border-t border-border pt-4 text-xs text-muted-foreground">
          <p>Created: {new Date(item.createdAt).toLocaleDateString()}</p>
          <p>Updated: {new Date(item.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </>
  );
}
