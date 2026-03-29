import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pathname: string;
  searchParams?: Record<string, string | string[] | undefined>;
}

type PageToken = number | "ellipsis";

function buildPageTokens(currentPage: number, totalPages: number): PageToken[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}

export function PaginationControls({
  currentPage,
  totalPages,
  pathname,
  searchParams,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pageTokens = buildPageTokens(currentPage, totalPages);

  const buildHref = (page: number) => {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams ?? {})) {
      if (value === undefined || key === "page") {
        continue;
      }

      if (Array.isArray(value)) {
        for (const entry of value) {
          params.append(key, entry);
        }
      } else {
        params.set(key, value);
      }
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const itemBaseClass =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-border px-2 text-sm transition-colors";

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className={cn(itemBaseClass, "text-muted-foreground hover:bg-muted hover:text-foreground")}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
          <span className="sr-only">Previous</span>
        </Link>
      ) : (
        <span
          className={cn(itemBaseClass, "cursor-not-allowed text-muted-foreground/50")}
          aria-disabled="true"
        >
          <ChevronLeft className="size-4" />
          <span className="sr-only">Previous</span>
        </span>
      )}

      {pageTokens.map((token, index) => {
        if (token === "ellipsis") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex h-8 min-w-8 items-center justify-center text-sm text-muted-foreground"
              aria-hidden="true"
            >
              ...
            </span>
          );
        }

        const isCurrent = token === currentPage;
        return (
          <Link
            key={token}
            href={buildHref(token)}
            className={cn(
              itemBaseClass,
              isCurrent
                ? "border-primary bg-primary/15 text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-current={isCurrent ? "page" : undefined}
            aria-label={`Page ${token}`}
          >
            {token}
          </Link>
        );
      })}

      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1)}
          className={cn(itemBaseClass, "text-muted-foreground hover:bg-muted hover:text-foreground")}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
          <span className="sr-only">Next</span>
        </Link>
      ) : (
        <span
          className={cn(itemBaseClass, "cursor-not-allowed text-muted-foreground/50")}
          aria-disabled="true"
        >
          <ChevronRight className="size-4" />
          <span className="sr-only">Next</span>
        </span>
      )}
    </nav>
  );
}