import type { BookingStatusBadgeProps } from "../types";

const STATUS_STYLES = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  confirmed: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-300",
} as const;

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
