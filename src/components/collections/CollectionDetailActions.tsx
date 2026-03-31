"use client";

import { useState } from "react";
import { Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CollectionEditDialog } from "@/components/collections/CollectionEditDialog";
import { DeleteCollectionDialog } from "@/components/collections/DeleteCollectionDialog";
import { toggleCollectionFavorite } from "@/actions/collections";

interface CollectionDetailActionsProps {
  collectionId: string;
  collectionName: string;
  collectionDescription: string | null;
  isFavorite: boolean;
}

export function CollectionDetailActions({
  collectionId,
  collectionName,
  collectionDescription,
  isFavorite: initialFavorite,
}: CollectionDetailActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [toggling, setToggling] = useState(false);

  async function handleFavoriteClick() {
    setToggling(true);
    setIsFavorite((prev) => !prev);
    const result = await toggleCollectionFavorite(collectionId);
    setToggling(false);
    if (result.success) {
      toast.success(result.data.isFavorite ? "Added to favorites" : "Removed from favorites");
    } else {
      setIsFavorite((prev) => !prev);
      toast.error(result.error ?? "Failed to update favorite");
    }
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 self-start">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handleFavoriteClick}
        disabled={toggling}
      >
        <Star
          className={cn(
            "size-4",
            isFavorite && "fill-yellow-500 text-yellow-500"
          )}
        />
        <span>{isFavorite ? "Unfavorite" : "Favorite"}</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setEditOpen(true)}
      >
        <Pencil className="size-4" />
        <span>Edit</span>
      </Button>

      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="gap-2"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="size-4" />
        <span>Delete</span>
      </Button>

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
        redirectTo="/collections"
      />
    </div>
  );
}
