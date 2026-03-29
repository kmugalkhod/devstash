"use client";

import { iconMap } from "@/lib/icons";
import { NewItemDialog } from "@/components/items/NewItemDialog";
import type { CollectionOption, ItemTypeInfo } from "@/lib/db/items";

interface CollectionTypeCreateButtonsProps {
  types: ItemTypeInfo[];
  itemTypes: ItemTypeInfo[];
  collections: CollectionOption[];
  defaultCollectionId?: string;
}

function toLabel(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function CollectionTypeCreateButtons({
  types,
  itemTypes,
  collections,
  defaultCollectionId,
}: CollectionTypeCreateButtonsProps) {
  if (types.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <span className="mr-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        Create by type:
      </span>
      {types.map((type) => {
        const Icon = iconMap[type.icon];

        return (
          <NewItemDialog
            key={type.id}
            itemTypes={itemTypes}
            collections={collections}
            defaultTypeName={type.name}
            defaultCollectionIds={defaultCollectionId ? [defaultCollectionId] : []}
            triggerLabel={toLabel(type.name)}
            triggerIcon={
              Icon ? <Icon className="size-3.5" style={{ color: type.color }} /> : undefined
            }
            triggerVariant="outline"
            triggerClassName="h-7 gap-1 rounded-[min(var(--radius-md),12px)] border-border/50 bg-background/50 px-2.5 text-[0.8rem] capitalize hover:bg-background"
          />
        );
      })}
    </div>
  );
}
