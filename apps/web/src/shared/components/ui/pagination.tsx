import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@shared/lib";

function getPageRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: (number | "...")[] = [1];

  if (current - 1 > 2) items.push("...");

  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  ) {
    items.push(i);
  }

  if (current + 1 < total - 1) items.push("...");

  items.push(total);

  return items;
}

const base =
  "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-sm font-medium transition-colors";

type PaginationProps = {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  labels: { previous: string; next: string };
};

export function Pagination({
  page,
  totalPages,
  buildHref,
  labels,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const range = getPageRange(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 py-2"
    >
      {page > 1 ? (
        <Link
          href={buildHref(page - 1)}
          className={cn(base, "border-border text-muted-foreground hover:bg-muted hover:text-foreground")}
          aria-label={labels.previous}
        >
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={cn(base, "border-transparent text-muted-foreground/30 cursor-not-allowed")}>
          <ChevronLeft className="size-4" />
        </span>
      )}

      {range.map((item, idx) =>
        item === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={buildHref(item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              base,
              item === page
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={buildHref(page + 1)}
          className={cn(base, "border-border text-muted-foreground hover:bg-muted hover:text-foreground")}
          aria-label={labels.next}
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={cn(base, "border-transparent text-muted-foreground/30 cursor-not-allowed")}>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
