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

export function EmployeeBookingsTable({
  bookings,
  copy,
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
              {bookings.map((booking) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
