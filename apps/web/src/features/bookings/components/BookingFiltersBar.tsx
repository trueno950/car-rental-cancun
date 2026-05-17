"use client";

import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";

import type { BookingStatus } from "@rental/validations";

import { cn } from "@shared/lib";

const STATUS_CHIP: Record<BookingStatus, { idle: string; active: string }> = {
  pending: {
    idle: "hover:bg-yellow-500/10 hover:text-yellow-700 hover:border-yellow-300 dark:hover:text-yellow-300",
    active: "bg-yellow-500/15 text-yellow-700 border-yellow-400 dark:text-yellow-300 dark:border-yellow-700",
  },
  confirmed: {
    idle: "hover:bg-blue-500/10 hover:text-blue-700 hover:border-blue-300 dark:hover:text-blue-300",
    active: "bg-blue-500/15 text-blue-700 border-blue-400 dark:text-blue-300 dark:border-blue-700",
  },
  active: {
    idle: "hover:bg-emerald-500/10 hover:text-emerald-700 hover:border-emerald-300 dark:hover:text-emerald-300",
    active: "bg-emerald-500/15 text-emerald-700 border-emerald-400 dark:text-emerald-300 dark:border-emerald-700",
  },
  completed: {
    idle: "hover:bg-muted hover:text-foreground hover:border-border",
    active: "bg-muted text-foreground border-border",
  },
  cancelled: {
    idle: "hover:bg-red-500/10 hover:text-red-700 hover:border-red-300 dark:hover:text-red-300",
    active: "bg-red-500/15 text-red-700 border-red-400 dark:text-red-300 dark:border-red-700",
  },
};

type BookingFiltersBarProps = {
  statuses: BookingStatus[];
  selectedStatuses: BookingStatus[];
  statusLabels: Record<BookingStatus, string>;
  counts: Partial<Record<BookingStatus, number>>;
  from: string;
  to: string;
  filteredCount: number;
  totalCount: number;
  copy: {
    showing: string;
    clearAll: string;
    fromLabel: string;
    toLabel: string;
  };
};

export function BookingFiltersBar({
  statuses,
  selectedStatuses,
  statusLabels,
  counts,
  from,
  to,
  filteredCount,
  totalCount,
  copy,
}: BookingFiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const hasFilters = selectedStatuses.length > 0 || from || to;

  function buildUrl(
    nextStatuses: BookingStatus[],
    nextFrom: string,
    nextTo: string,
  ) {
    const sp = new URLSearchParams();
    if (nextStatuses.length > 0) sp.set("status", nextStatuses.join(","));
    if (nextFrom) sp.set("from", nextFrom);
    if (nextTo) sp.set("to", nextTo);
    const query = sp.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  function toggleStatus(status: BookingStatus) {
    const next = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];
    router.push(buildUrl(next, from, to));
  }

  function handleDateChange(key: "from" | "to", value: string) {
    const nextFrom = key === "from" ? value : from;
    const nextTo = key === "to" ? value : to;
    router.push(buildUrl(selectedStatuses, nextFrom, nextTo));
  }

  const dateInputClass =
    "h-8 rounded-lg border border-input bg-background px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 text-muted-foreground dark:bg-input/30";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        {statuses.map((status) => {
          const isActive = selectedStatuses.includes(status);
          const count = counts[status] ?? 0;
          return (
            <button
              key={status}
              type="button"
              onClick={() => toggleStatus(status)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                "border-border text-muted-foreground",
                isActive ? STATUS_CHIP[status].active : STATUS_CHIP[status].idle,
              )}
            >
              {statusLabels[status]}
              <span className="opacity-60">{count}</span>
            </button>
          );
        })}

        <div className="flex items-center gap-1.5 ml-auto">
          <input
            type="date"
            value={from}
            onChange={(e) => handleDateChange("from", e.target.value)}
            aria-label={copy.fromLabel}
            title={copy.fromLabel}
            className={dateInputClass}
          />
          <span className="text-muted-foreground text-xs">→</span>
          <input
            type="date"
            value={to}
            onChange={(e) => handleDateChange("to", e.target.value)}
            aria-label={copy.toLabel}
            title={copy.toLabel}
            className={dateInputClass}
          />
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={() => router.push(pathname)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-3" />
            {copy.clearAll}
          </button>
        )}
      </div>

      {hasFilters && (
        <p className="text-xs text-muted-foreground">
          {copy.showing
            .replace("{filtered}", String(filteredCount))
            .replace("{total}", String(totalCount))}
        </p>
      )}
    </div>
  );
}
