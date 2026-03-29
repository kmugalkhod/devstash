"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-all focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600";

const textareaClass =
  "w-full resize-y rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-all focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600";

interface CreateCollectionResponse {
  success?: boolean;
  error?: string;
}

interface NewCollectionDialogProps {
  triggerLabel?: string;
  triggerVariant?: React.ComponentProps<typeof Button>["variant"];
  triggerClassName?: string;
  showOnMobile?: boolean;
}

export function NewCollectionDialog({
  triggerLabel = "New Collection",
  triggerVariant = "outline",
  triggerClassName,
  showOnMobile = false,
}: NewCollectionDialogProps = {}) {
  const router = useRouter();
  const nameInputId = useId();
  const descriptionInputId = useId();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function resetDialogState() {
    setName("");
    setDescription("");
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetDialogState();
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Collection name is required");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          description: description.trim() || null,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | CreateCollectionResponse
        | null;

      if (!response.ok) {
        toast.error(payload?.error ?? "Failed to create collection");
        return;
      }

      toast.success("Collection created");
      resetDialogState();
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to create collection");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button
        variant={triggerVariant}
        className={cn(
          "border-muted-foreground/20",
          showOnMobile ? "inline-flex" : "hidden sm:inline-flex",
          triggerClassName
        )}
        onClick={() => {
          resetDialogState();
          setOpen(true);
        }}
      >
        <FolderPlus className="size-4" />
        {triggerLabel}
      </Button>

      {open && (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent className="gap-0 p-0 sm:max-w-130">
            <div className="px-6 pb-4 pt-6">
              <h2 className="text-base font-semibold text-zinc-100">
                New Collection
              </h2>
              <p className="mt-0.5 text-sm text-zinc-400">
                Group related items in one place.
              </p>
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
                    onChange={(e) => setName(e.target.value)}
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
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What belongs in this collection?"
                    rows={4}
                    maxLength={500}
                    className={textareaClass}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-zinc-800 bg-zinc-950/40 px-6 py-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-zinc-300"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FolderPlus className="size-4" />
                      Create Collection
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
