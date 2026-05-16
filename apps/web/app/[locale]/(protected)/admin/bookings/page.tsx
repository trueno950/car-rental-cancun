import { getTranslations } from "next-intl/server";

import type { BookingStatus } from "@rental/validations";

import {
  EmployeeBookingsTable,
  getAllBookingsAction,
  updateBookingStatusAction,
} from "@features/bookings";
import type { EmployeeBookingsTableCopy } from "@features/bookings";

type AdminBookingsPageProps = {
  params: Promise<{ locale: string }>;
};

const STATUS_DOT: Record<BookingStatus, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  active: "bg-emerald-500",
  completed: "bg-slate-400",
  cancelled: "bg-red-500",
};

function StatCard({
  label,
  count,
  dotClass,
}: {
  label: string;
  count: number;
  dotClass: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3">
      <span className={`size-2.5 rounded-full shrink-0 ${dotClass}`} />
      <div>
        <p className="text-2xl font-semibold leading-none">{count}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default async function AdminBookingsPage({
  params,
}: AdminBookingsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminBookingsPage" });

  const bookings = await getAllBookingsAction();

  const counts = bookings.reduce(
    (acc, b) => {
      acc[b.status] = (acc[b.status] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<BookingStatus, number>>,
  );

  const statuses: BookingStatus[] = [
    "pending",
    "confirmed",
    "active",
    "completed",
    "cancelled",
  ];

  const copy: EmployeeBookingsTableCopy = {
    heading: t("tableHeading"),
    colId: t("table.colId"),
    colVehicle: t("table.colVehicle"),
    colUser: t("table.colUser"),
    colDates: t("table.colDates"),
    colStatus: t("table.colStatus"),
    colTotal: t("table.colTotal"),
    colActions: t("table.colActions"),
    empty: t("emptyState"),
    actionLabels: {
      confirmed: t("actions.confirm"),
      active: t("actions.activate"),
      completed: t("actions.complete"),
      cancelled: t("actions.cancel"),
    },
  };

  async function handleTransition(bookingId: string, status: BookingStatus) {
    "use server";
    await updateBookingStatusAction(bookingId, status);
  }

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {statuses.map((status) => (
            <StatCard
              key={status}
              label={t(`statusLabels.${status}`)}
              count={counts[status] ?? 0}
              dotClass={STATUS_DOT[status]}
            />
          ))}
        </div>

        <EmployeeBookingsTable
          bookings={bookings}
          copy={copy}
          transitionAction={handleTransition}
        />
      </div>
    </main>
  );
}
