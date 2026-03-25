import { Skeleton } from "@/components/ui/skeleton";

export default function ItemsLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header: icon + title + count */}
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-lg" />
        <div>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="mt-1 h-4 w-16" />
        </div>
      </div>

      {/* Subheader: "All items" + view toggle */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-[72px] rounded-lg" />
      </div>

      {/* Grid of card skeletons */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5"
            style={{ borderLeftWidth: "3px", borderLeftColor: "transparent" }}
          >
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="mt-3 h-16 w-full rounded-md" />
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
            <Skeleton className="mt-3 h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
