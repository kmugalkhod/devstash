import { Skeleton } from "@/components/ui/skeleton";

export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-3.5"
          style={{ borderLeftWidth: "3px", borderLeftColor: "transparent" }}
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
          <Skeleton className="mt-2 h-7 w-12" />
        </div>
      ))}
    </div>
  );
}

export function CollectionsSkeleton() {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-14" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-6"
            style={{ borderTopWidth: "2px", borderTopColor: "transparent" }}
          >
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-2 h-3 w-16" />
              <Skeleton className="mt-4 h-4 w-full" />
            </div>
            <div className="mt-6 flex gap-2.5">
              <Skeleton className="size-8 rounded" />
              <Skeleton className="size-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ItemsSkeleton() {
  return (
    <div className="space-y-10">
      <section>
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-18 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5"
              style={{ borderLeftWidth: "3px", borderLeftColor: "transparent" }}
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-16 w-full rounded" />
              <div className="mt-3 flex gap-2">
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="mt-3 h-3 w-20" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
