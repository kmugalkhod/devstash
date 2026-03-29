"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const inputClass =
  "w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-600";

const textareaClass =
  "w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-600";

interface UpdatedCollection {
  id: string;
  name: string;
  description: string | null;
}

interface UpdateCollectionResponse {
  success?: boolean;
  error?: string;
  collection?: UpdatedCollection;
}

interface CollectionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string;
  initialName: string;
  initialDescription: string | null;
  onSaved?: (collection: UpdatedCollection) => void;
}

export function CollectionEditDialog({
  open,
  onOpenChange,
  collectionId,
  initialName,
  initialDescription,
  onSaved,
}: CollectionEditDialogProps) {
  const router = useRouter();
  const nameInputId = useId();
  const descriptionInputId = useId();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setDescription(initialDescription ?? "");
  }, [open, initialName, initialDescription]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Collection name is required");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          description: description.trim() || null,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | UpdateCollectionResponse
        | null;

      if (!response.ok || !payload?.collection) {
        toast.error(payload?.error ?? "Failed to update collection");
        return;
      }

      toast.success("Collection updated");
      onOpenChange(false);
      onSaved?.(payload.collection);
      router.refresh();
    } catch {
      toast.error("Failed to update collection");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-130">
        <div className="px-6 pb-4 pt-6">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-zinc-100">
              Edit Collection
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-sm text-zinc-400">
              Update your collection metadata.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="space-y-4 px-6 pb-6">
            <div className="space-y-2">
              <label
                htmlFor={nameInputId}
                className="block text-sm font-semibold text-zinc-200"
              >
                Name
              </label>
              <input
                id={nameInputId}
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. API Patterns"
                required
                maxLength={120}
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <label
                  htmlFor={descriptionInputId}
                  className="text-sm font-semibold text-zinc-200"
                >
                  Description
                </label>
                <span className="text-xs text-zinc-500">optional</span>
              </div>
              <textarea
                id={descriptionInputId}
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What belongs in this collection?"
                rows={4}
                maxLength={500}
                className={textareaClass}
              />
            </div>
          </div>

          <DialogFooter className="border-zinc-800 bg-zinc-950/40 px-6 py-4 sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              className="text-zinc-300"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Pencil className="size-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
