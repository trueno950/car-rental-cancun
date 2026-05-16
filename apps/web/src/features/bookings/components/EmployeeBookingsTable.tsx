import type { BookingStatus } from "@rental/validations";

import { BOOKING_STATUS_TRANSITIONS } from "../types";
import type { EmployeeBookingsTableProps } from "../types";
import { BookingStatusBadge } from "./BookingStatusBadge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

const ACTION_STYLES: Partial<Record<BookingStatus, string>> = {
  confirmed:
    "rounded-lg bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-500/20 dark:text-blue-300",
  active:
    "rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300",
  completed:
    "rounded-lg bg-muted px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/80",
  cancelled:
    "rounded-lg bg-red-500/10 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-500/20 dark:text-red-300",
};

export function EmployeeBookingsTable({
  bookings,
  copy,
  transitionAction,
}: EmployeeBookingsTableProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">{copy.heading}</h2>

      {bookings.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {[
                  copy.colId,
                  copy.colVehicle,
                  copy.colUser,
                  copy.colDates,
                  copy.colStatus,
                  copy.colTotal,
                  copy.colActions,
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left font-medium text-muted-foreground"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((booking) => {
                const transitions = BOOKING_STATUS_TRANSITIONS[booking.status];
                return (
                  <tr key={booking.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {booking.id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {booking.vehicleId.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {booking.userId.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {formatDate(booking.startDate)} →{" "}
                      {formatDate(booking.endDate)}
                    </td>
                    <td className="px-4 py-3">
                      <BookingStatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(booking.totalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {transitions.map((nextStatus) => {
                          const label = copy.actionLabels[nextStatus];
                          if (!label) return null;
                          const boundAction = transitionAction.bind(
                            null,
                            booking.id,
                            nextStatus,
                          );
                          return (
                            <form key={nextStatus} action={boundAction}>
                              <button
                                type="submit"
                                className={ACTION_STYLES[nextStatus]}
                              >
                                {label}
                              </button>
                            </form>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
