import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { NewCollectionDialog } from "@/components/dashboard/NewCollectionDialog";
import { getAllUserCollections } from "@/lib/db/collections";
import { getAuthUserId } from "@/lib/auth-utils";
import { Library } from "lucide-react";

export default async function CollectionsPage() {
  const userId = await getAuthUserId();
  const collections = await getAllUserCollections(userId);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Library className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Collections</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            View and manage your personalized collections.
            <span className="ml-2 inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
              {collections.length} {collections.length === 1 ? "Total" : "Total"}
            </span>
          </p>
        </div>
        <NewCollectionDialog triggerClassName="gap-2" />
      </div>

      {collections.length === 0 ? (
        <div className="flex min-h-100 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Library className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">No collections found</h3>
          <p className="mb-6 max-w-62.5 text-sm text-muted-foreground">
            You have not created any collections yet. Start organizing your items securely.
          </p>
          <NewCollectionDialog
            showOnMobile
            triggerLabel="Create Collection"
            triggerClassName="gap-2"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collectionId={collection.id}
              name={collection.name}
              itemCount={collection.itemCount}
              description={collection.description}
              types={collection.types}
              href={`/collections/${collection.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
