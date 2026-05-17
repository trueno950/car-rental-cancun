import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

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
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
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
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-20 text-center">
        <CalendarDays className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
        <p className="text-sm font-medium text-muted-foreground">{copy.empty}</p>
        <Link
          href={`/${locale}/vehicles`}
          className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Ver flota disponible
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/30">
          <tr>
            {[copy.colId, copy.colDates, copy.colTotal, copy.colStatus, ""].map(
              (col, i) => (
                <th
                  key={i}
                  className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {col}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {bookings.map((booking) => (
            <tr key={booking.id} className="hover:bg-muted/20 transition-colors">
              <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                {booking.id.slice(0, 8)}…
              </td>
              <td className="px-5 py-4 text-sm">
                <span className="text-foreground">{formatDate(booking.startDate)}</span>
                <span className="text-muted-foreground mx-2">→</span>
                <span className="text-foreground">{formatDate(booking.endDate)}</span>
              </td>
              <td className="px-5 py-4 font-semibold text-foreground">
                {formatCurrency(booking.totalPrice)}
              </td>
              <td className="px-5 py-4">
                <BookingStatusBadge status={booking.status} />
              </td>
              <td className="px-5 py-4 text-right">
                <Link
                  href={`/${locale}/bookings/${booking.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  {copy.viewDetail}
                  <ArrowRight className="h-3 w-3" />
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
      colNotes: t("colNotes"),
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
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
              Panel de gestión
            </p>
            <h1 className="text-3xl font-bold tracking-tight">{t("heading")}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">
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
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
              Tu cuenta
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("customerHeading")}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {t("customerHelper")}
            </p>
          </div>
          <Link
            href={`/${locale}/vehicles`}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Reservar otro
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
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
