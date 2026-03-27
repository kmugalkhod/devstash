"use client";

import { useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Star,
  Pin,
  Copy,
  Pencil,
  Trash2,
  X,
  ExternalLink,
  FolderOpen,
} from "lucide-react";
import { cn, getRelativeTime } from "@/lib/utils";
import { iconMap } from "@/lib/icons";
import type { ItemDetail } from "@/lib/db/items";
import { ItemDrawerEdit } from "./ItemDrawerEdit";
import { deleteItem } from "@/actions/items";
import { toast } from "sonner";
import { CodeEditor } from "./CodeEditor";
import { MarkdownEditor } from "./MarkdownEditor";

interface ItemDrawerProps {
  item: ItemDetail | null;
  loading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemUpdated: (updated: ItemDetail) => void;
  onItemDeleted: () => void;
}

export function ItemDrawer({ item, loading, open, onOpenChange, onItemUpdated, onItemDeleted }: ItemDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleCopy() {
    if (!item?.content) return;
    await navigator.clipboard.writeText(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const TypeIcon = item?.type ? iconMap[item.type.icon] : null;

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) setEditing(false);
    onOpenChange(isOpen);
  }

  function handleSaved(updated: ItemDetail) {
    setEditing(false);
    onItemUpdated(updated);
  }

  async function handleDelete() {
    if (!item) return;
    setDeleting(true);
    const result = await deleteItem(item.id);
    setDeleting(false);
    if (result.success) {
      toast.success("Item deleted");
      onItemDeleted();
    } else {
      toast.error(result.error ?? "Failed to delete item");
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-y-auto sm:max-w-2xl"
        showCloseButton={false}
      >
        {loading ? (
          <DrawerSkeleton />
        ) : item && editing ? (
          <ItemDrawerEdit
            item={item}
            onCancel={() => setEditing(false)}
            onSaved={handleSaved}
          />
        ) : item ? (
          <>
            {/* Action bar */}
            <div className="flex items-center gap-1 border-b border-border/70 px-4 pb-3 pt-4">
              <ActionButton
                icon={Star}
                label="Favorite"
                active={item.isFavorite}
                activeClassName="fill-yellow-500 text-yellow-500"
              />
              <ActionButton
                icon={Pin}
                label="Pin"
                active={item.isPinned}
                activeClassName="fill-foreground text-foreground"
              />
              <ActionButton
                icon={Copy}
                label={copied ? "Copied!" : "Copy"}
                onClick={handleCopy}
                disabled={!item.content}
              />
              <ActionButton
                icon={Pencil}
                label="Edit"
                onClick={() => setEditing(true)}
              />
              <div className="flex-1" />
              <AlertDialog>
                <AlertDialogTrigger
                  className="rounded-md p-2 text-red-400/90 transition-colors hover:bg-red-500/10 hover:text-red-300"
                  render={<button title="Delete" />}
                >
                  <Trash2 className="size-4" />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete item</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{item.title}&quot;? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleting}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
                <SheetClose
                  className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-800/70 hover:text-zinc-100"
                >
                <X className="size-4" />
                <span className="sr-only">Close</span>
              </SheetClose>
            </div>

            {/* Header */}
            <SheetHeader className="space-y-2 px-4 pt-3">
              <div className="flex items-center gap-2">
                {TypeIcon && (
                  <TypeIcon
                    className="size-4"
                    style={{ color: item.type.color }}
                  />
                )}
                <span
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: item.type.color }}
                >
                  {item.type.name}
                </span>
              </div>
              <SheetTitle className="text-lg font-bold">
                {item.title}
              </SheetTitle>
              {item.description && (
                <SheetDescription>{item.description}</SheetDescription>
              )}
            </SheetHeader>

            {/* Content */}
            <div className="flex-1 space-y-7 px-4 pb-6 pt-1">
              {/* URL for link types */}
              {item.url && (
                <div>
                  <SectionLabel>URL</SectionLabel>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 break-all text-sm text-blue-400 hover:underline"
                  >
                    {item.url}
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                </div>
              )}

              {/* Text content */}
              {item.content && (
                <div>
                  {["snippet", "command"].includes(item.type.name) ? (
                    <CodeEditor
                      value={item.content}
                      language={item.language ?? undefined}
                      readOnly
                    />
                  ) : ["prompt", "note"].includes(item.type.name) ? (
                    <MarkdownEditor value={item.content} readOnly />
                  ) : (
                    <>
                      <SectionLabel>
                        {item.language ? `Content (${item.language})` : "Content"}
                      </SectionLabel>
                      <div className="rounded-lg bg-black/35 p-4">
                        <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-300">
                          {item.content}
                        </pre>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* File info */}
              {item.fileName && (
                <div>
                  <SectionLabel>File</SectionLabel>
                  <p className="text-sm text-foreground">{item.fileName}</p>
                  {item.fileSize && (
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(item.fileSize)}
                    </p>
                  )}
                </div>
              )}

              {/* Tags */}
              {item.tags.length > 0 && (
                <div>
                  <SectionLabel>Tags</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/8 px-2.5 py-0.5 text-xs text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Collections */}
              {item.collections.length > 0 && (
                <div>
                  <SectionLabel>Collections</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {item.collections.map((col) => (
                      <span
                        key={col.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-zinc-300"
                      >
                        <FolderOpen className="size-3" />
                        {col.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="border-t border-border/60 pt-4">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span suppressHydrationWarning>
                    Created {getRelativeTime(item.createdAt)}
                  </span>
                  <span suppressHydrationWarning>
                    Updated {getRelativeTime(item.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">Item not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ActionButton({
  icon: Icon,
  label,
  active,
  activeClassName,
  className,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  activeClassName?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-800/70 hover:text-zinc-100 disabled:opacity-50",
        active && activeClassName,
        className
      )}
      title={label}
    >
      <Icon className="size-4" />
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Action bar skeleton */}
      <div className="flex items-center gap-1 border-b border-border pb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="size-8 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
      {/* Type badge */}
      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      {/* Title */}
      <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
      {/* Content block */}
      <div className="h-40 animate-pulse rounded-lg bg-muted" />
      {/* Tags */}
      <div className="flex gap-2">
        <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
        <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
        <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
