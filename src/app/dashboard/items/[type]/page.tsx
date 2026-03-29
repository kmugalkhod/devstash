import { notFound, redirect } from "next/navigation";
import { getAuthUserId } from "@/lib/auth-utils";
import {
  getAvailableCollections,
  getPaginatedItemsByType,
  getSystemItemTypes,
} from "@/lib/db/items";
import { ItemsListView } from "@/components/items/ItemsListView";
import { NewItemDialog } from "@/components/items/NewItemDialog";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { iconMap } from "@/lib/icons";
import { ITEMS_PER_PAGE } from "@/lib/limits";

const typeSlugToName: Record<string, string> = {
  snippets: "snippet",
  prompts: "prompt",
  commands: "command",
  notes: "note",
  files: "file",
  images: "image",
  links: "link",
};

const typeDisplayNames: Record<string, string> = {
  snippet: "Snippets",
  prompt: "Prompts",
  command: "Commands",
  note: "Notes",
  file: "Files",
  image: "Images",
  link: "Links",
};

const typeCreateLabels: Record<string, string> = {
  snippet: "New Snippet",
  prompt: "New Prompt",
  command: "New Command",
  note: "New Note",
  file: "New File",
  image: "New Image",
  link: "New Link",
};

export default async function ItemsTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { type: slug } = await params;
  const resolvedSearchParams = await searchParams;
  const typeName = typeSlugToName[slug];

  if (!typeName) {
    notFound();
  }

  const requestedPage = Number.parseInt(resolvedSearchParams.page ?? "1", 10);
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const userId = await getAuthUserId();
  const [paginatedItems, itemTypes, availableCollections] = await Promise.all([
    getPaginatedItemsByType(userId, typeName, currentPage, ITEMS_PER_PAGE),
    getSystemItemTypes(),
    getAvailableCollections(userId),
  ]);

  const totalPages = Math.max(1, Math.ceil(paginatedItems.totalItems / ITEMS_PER_PAGE));
  if (currentPage > totalPages) {
    if (totalPages === 1) {
      redirect(`/dashboard/items/${slug}`);
    }

    redirect(`/dashboard/items/${slug}?page=${totalPages}`);
  }

  const items = paginatedItems.items;

  const displayName = typeDisplayNames[typeName] ?? typeName;
  const typeInfo = items[0]?.type ?? itemTypes.find((type) => type.name === typeName);
  const iconName = typeInfo?.icon;
  const typeColor = typeInfo?.color;
  const createLabel = typeCreateLabels[typeName] ?? "New Item";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          {iconName && iconMap[iconName] && (
            <div
              className="flex size-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${typeColor}20` }}
            >
              {(() => {
                const Icon = iconMap[iconName];
                return <Icon className="size-5" style={{ color: typeColor }} />;
              })()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
            <p className="text-sm text-muted-foreground">
              {paginatedItems.totalItems} {paginatedItems.totalItems === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        <NewItemDialog
          itemTypes={itemTypes}
          collections={availableCollections}
          defaultTypeName={typeName}
          triggerLabel={createLabel}
          triggerClassName="gap-2 self-start"
        />
      </div>

      <ItemsListView items={items} typeName={displayName} typeKey={typeName} />
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pathname={`/dashboard/items/${slug}`}
        searchParams={resolvedSearchParams}
      />
    </div>
  );
}
