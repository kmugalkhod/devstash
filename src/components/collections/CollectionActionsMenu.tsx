"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CollectionEditDialog } from "@/components/collections/CollectionEditDialog";
import { DeleteCollectionDialog } from "@/components/collections/DeleteCollectionDialog";
import { toggleCollectionFavorite } from "@/actions/collections";

interface CollectionActionsMenuProps {
  collectionId: string;
  collectionName: string;
  collectionDescription: string | null;
  isFavorite?: boolean;
  triggerClassName?: string;
  onDeleted?: () => void;
}

export function CollectionActionsMenu({
  collectionId,
  collectionName,
  collectionDescription,
  isFavorite: initialFavorite = false,
  triggerClassName,
  onDeleted,
}: CollectionActionsMenuProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  async function handleFavoriteClick() {
    setIsFavorite((prev) => !prev);
    const result = await toggleCollectionFavorite(collectionId);
    if (result.success) {
      toast.success(result.data.isFavorite ? "Added to favorites" : "Removed from favorites");
    } else {
      setIsFavorite((prev) => !prev);
      toast.error(result.error ?? "Failed to update favorite");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          data-collection-actions="true"
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-[min(var(--radius-md),12px)] text-foreground outline-none transition-colors hover:bg-white/5 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
            triggerClassName
          )}
          aria-label="Collection options"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <MoreVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          data-collection-actions="true"
          align="end"
          sideOffset={6}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              setEditOpen(true);
            }}
          >
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              setDeleteOpen(true);
            }}
            variant="destructive"
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              handleFavoriteClick();
            }}
          >
            <Star className={cn("size-4", isFavorite && "fill-yellow-500 text-yellow-500")} />
            {isFavorite ? "Unfavorite" : "Favorite"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CollectionEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        collectionId={collectionId}
        initialName={collectionName}
        initialDescription={collectionDescription}
      />

      <DeleteCollectionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        collectionId={collectionId}
        collectionName={collectionName}
        onDeleted={onDeleted}
      />
    </>
  );
}
