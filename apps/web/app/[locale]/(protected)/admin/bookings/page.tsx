import { getTranslations } from "next-intl/server";

import { BOOKING_STATUS } from "@rental/validations";
import type { BookingStatus } from "@rental/validations";

import { Pagination } from "@shared/components/ui";
import {
  EmployeeBookingsTable,
  BookingFiltersBar,
  getAllBookingsAction,
  updateBookingStatusAction,
} from "@features/bookings";
import type { EmployeeBookingsTableCopy } from "@features/bookings";

const PAGE_SIZE = 20;

type AdminBookingsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    status?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
};

const STATUSES = Object.values(BOOKING_STATUS) as BookingStatus[];

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
  searchParams,
}: AdminBookingsPageProps) {
  const { locale } = await params;
  const {
    status: statusParam,
    from = "",
    to = "",
    page: pageParam,
  } = await searchParams;
  const t = await getTranslations({ locale, namespace: "AdminBookingsPage" });
  const tPag = await getTranslations({ locale, namespace: "Pagination" });

  const bookings = await getAllBookingsAction();

  const selectedStatuses: BookingStatus[] = statusParam
    ? (statusParam
        .split(",")
        .filter((s): s is BookingStatus =>
          STATUSES.includes(s as BookingStatus),
        ))
    : [];

  const filteredBookings = bookings.filter((b) => {
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(b.status)) {
      return false;
    }
    if (from) {
      const start = new Date(b.startDate);
      if (start < new Date(from)) return false;
    }
    if (to) {
      const start = new Date(b.startDate);
      if (start > new Date(to)) return false;
    }
    return true;
  });

  const page = Math.max(1, parseInt(pageParam ?? "1") || 1);
  const totalPages = Math.ceil(filteredBookings.length / PAGE_SIZE);
  const pagedBookings = filteredBookings.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const counts = bookings.reduce(
    (acc, b) => {
      acc[b.status] = (acc[b.status] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<BookingStatus, number>>,
  );

  const statusLabels = Object.fromEntries(
    STATUSES.map((s) => [s, t(`statusLabels.${s}`)]),
  ) as Record<BookingStatus, string>;

  const copy: EmployeeBookingsTableCopy = {
    heading: t("tableHeading"),
    colId: t("table.colId"),
    colVehicle: t("table.colVehicle"),
    colUser: t("table.colUser"),
    colDates: t("table.colDates"),
    colStatus: t("table.colStatus"),
    colTotal: t("table.colTotal"),
    colNotes: t("table.colNotes"),
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
          {STATUSES.map((status) => (
            <StatCard
              key={status}
              label={statusLabels[status]}
              count={counts[status] ?? 0}
              dotClass={STATUS_DOT[status]}
            />
          ))}
        </div>

        <BookingFiltersBar
          statuses={STATUSES}
          selectedStatuses={selectedStatuses}
          statusLabels={statusLabels}
          counts={counts}
          from={from}
          to={to}
          filteredCount={filteredBookings.length}
          totalCount={bookings.length}
          copy={{
            showing: t("filters.showing"),
            clearAll: t("filters.clearAll"),
            fromLabel: t("filters.fromLabel"),
            toLabel: t("filters.toLabel"),
          }}
        />

        <EmployeeBookingsTable
          bookings={pagedBookings}
          copy={copy}
          transitionAction={handleTransition}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          buildHref={(p) => {
            const sp = new URLSearchParams();
            if (statusParam) sp.set("status", statusParam);
            if (from) sp.set("from", from);
            if (to) sp.set("to", to);
            sp.set("page", String(p));
            return `/${locale}/admin/bookings?${sp.toString()}`;
          }}
          labels={{ previous: tPag("previous"), next: tPag("next") }}
        />
      </div>
    </main>
  );
}
