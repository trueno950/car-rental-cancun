import { getTranslations } from "next-intl/server";
import Link from "next/link";

import type { BookingResponse } from "@rental/validations";

import { auth } from "@core/auth";
import {
  BookingStatusBadge,
  EmployeeBookingsTable,
  getAllBookingsAction,
  getMyBookingsAction,
  updateBookingStatusAction,
} from "@features/bookings";
import type { EmployeeBookingsTableCopy } from "@features/bookings";

type BookingsPageProps = {
  params: Promise<{ locale: string }>;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
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

type CustomerTableCopy = {
  empty: string;
  colId: string;
  colDates: string;
  colTotal: string;
  colStatus: string;
  viewDetail: string;
};

function CustomerBookingsTable({
  bookings,
  locale,
  copy,
}: {
  bookings: BookingResponse[];
  locale: string;
  copy: CustomerTableCopy;
}) {
  if (bookings.length === 0) {
    return <p className="text-sm text-muted-foreground">{copy.empty}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/30">
          <tr>
            {[copy.colId, copy.colDates, copy.colTotal, copy.colStatus, ""].map(
              (col, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left font-medium text-muted-foreground"
                >
                  {col}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {bookings.map((booking) => (
            <tr
              key={booking.id}
              className="hover:bg-muted/20 transition-colors"
            >
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {booking.id.slice(0, 8)}…
              </td>
              <td className="px-4 py-3">
                {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
              </td>
              <td className="px-4 py-3 font-medium">
                {formatCurrency(booking.totalPrice)}
              </td>
              <td className="px-4 py-3">
                <BookingStatusBadge status={booking.status} />
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/${locale}/bookings/${booking.id}`}
                  className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  {copy.viewDetail}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function BookingsPage({ params }: BookingsPageProps) {
  const { locale } = await params;
  const session = await auth();
  const role = session?.user?.role ?? "customer";
  const isEmployee =
    role === "employee" || role === "manager" || role === "admin";

  if (isEmployee) {
    const t = await getTranslations({
      locale,
      namespace: "EmployeeBookingsPage",
    });

    const copy: EmployeeBookingsTableCopy = {
      heading: t("heading"),
      colId: t("colId"),
      colVehicle: t("colVehicle"),
      colUser: t("colUser"),
      colDates: t("colDates"),
      colStatus: t("colStatus"),
      colTotal: t("colTotal"),
      colActions: t("colActions"),
      empty: t("empty"),
      actionLabels: {
        confirmed: t("actionConfirm"),
        active: t("actionActivate"),
        completed: t("actionComplete"),
        cancelled: t("actionCancel"),
      },
    };

    const bookings = await getAllBookingsAction();

    return (
      <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {t("heading")}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {t("helper")}
            </p>
          </header>
          <EmployeeBookingsTable
            bookings={bookings}
            copy={copy}
            transitionAction={updateBookingStatusAction}
          />
        </div>
      </main>
    );
  }

  const t = await getTranslations({ locale, namespace: "BookingsPage" });
  const bookings = await getMyBookingsAction();

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("customerHeading")}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("customerHelper")}
          </p>
        </header>
        <CustomerBookingsTable
          bookings={bookings}
          locale={locale}
          copy={{
            empty: t("customerEmpty"),
            colId: t("colId"),
            colDates: t("colDates"),
            colTotal: t("colTotal"),
            colStatus: t("colStatus"),
            viewDetail: t("viewDetail"),
          }}
        />
      </div>
    </main>
  );
}
