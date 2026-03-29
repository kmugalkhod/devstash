import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Folder } from "lucide-react";
import { CollectionItemsView } from "@/components/collections/CollectionItemsView";
import { CollectionTypeCreateButtons } from "@/components/collections/CollectionTypeCreateButtons";
import { CollectionDetailActions } from "@/components/collections/CollectionDetailActions";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { getCollectionById } from "@/lib/db/collections";
import {
  getAvailableCollections,
  getPaginatedItemsByCollectionId,
  getSystemItemTypes,
} from "@/lib/db/items";
import { getAuthUserId } from "@/lib/auth-utils";
import { COLLECTIONS_PER_PAGE } from "@/lib/limits";

export default async function CollectionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const userId = await getAuthUserId();
  const requestedPage = Number.parseInt(resolvedSearchParams.page ?? "1", 10);
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [collection, paginatedItems, itemTypes, availableCollections] = await Promise.all([
    getCollectionById(userId, id),
    getPaginatedItemsByCollectionId(userId, id, currentPage, COLLECTIONS_PER_PAGE),
    getSystemItemTypes(),
    getAvailableCollections(userId),
  ]);

  if (!collection) {
    notFound();
  }

  const totalPages = Math.max(1, Math.ceil(paginatedItems.totalItems / COLLECTIONS_PER_PAGE));
  if (currentPage > totalPages) {
    if (totalPages === 1) {
      redirect(`/collections/${id}`);
    }

    redirect(`/collections/${id}?page=${totalPages}`);
  }

  const items = paginatedItems.items;

  return (
    <div className="mx-auto w-full max-w-7xl animate-in fade-in duration-500">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/collections"
          className="inline-flex h-7 items-center gap-2 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] text-muted-foreground transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Collections</span>
        </Link>
      </div>

      <div className="relative mb-10 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-background to-background opacity-50" />
        <div className="relative p-6 sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-inner">
                  <Folder className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {collection.name}
                  </h1>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground px-2 py-0.5 rounded-full bg-secondary/80">
                      {paginatedItems.totalItems} {paginatedItems.totalItems === 1 ? "item" : "items"}
                    </span>
                  </p>
                </div>
              </div>

              {collection.description && (
                <p className="max-w-3xl text-base text-muted-foreground/90 leading-relaxed">
                  {collection.description}
                </p>
              )}

              {collection.types.length > 0 && (
                <CollectionTypeCreateButtons
                  types={collection.types}
                  itemTypes={itemTypes}
                  collections={availableCollections}
                  defaultCollectionId={collection.id}
                />
              )}
            </div>

            <CollectionDetailActions
              collectionId={collection.id}
              collectionName={collection.name}
              collectionDescription={collection.description}
              isFavorite={collection.isFavorite}
            />
          </div>
        </div>
      </div>

      <CollectionItemsView items={items} />
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pathname={`/collections/${id}`}
        searchParams={resolvedSearchParams}
      />
    </div>
  );
}
