import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowLeft, Calendar, Car, Clock, FileText } from "lucide-react";

import {
  BookingStatusBadge,
  DepositCallToAction,
  getBookingByIdAction,
  redirectToCheckoutAction,
} from "@features/bookings";

type BookingDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "BookingDetailPage" });

  const booking = await getBookingByIdAction(id);
  if (!booking) {
    notFound();
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const checkoutAction = redirectToCheckoutAction.bind(null, booking.id);

  const details = [
    {
      icon: Car,
      label: t("vehicleLabel"),
      value: <span className="font-mono text-xs">{booking.vehicleId}</span>,
    },
    {
      icon: Calendar,
      label: t("datesLabel"),
      value: `${formatDate(booking.startDate)} → ${formatDate(booking.endDate)}`,
    },
    {
      icon: Clock,
      label: t("createdLabel"),
      value: formatDate(booking.createdAt),
    },
    ...(booking.notes
      ? [
          {
            icon: FileText,
            label: t("notesLabel"),
            value: booking.notes,
          },
        ]
      : []),
  ];

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Link
            href={`/${locale}/bookings`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Mis reservas
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                Reserva
              </p>
              <h1 className="text-2xl font-bold tracking-tight">
                {t("heading")}
              </h1>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {booking.id}
              </p>
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/20">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Detalles
            </p>
          </div>
          <dl className="divide-y divide-border">
            {details.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-start gap-4 px-6 py-4"
              >
                <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex flex-1 items-start justify-between gap-4 min-w-0">
                  <dt className="text-sm text-muted-foreground flex-shrink-0">{label}</dt>
                  <dd className="text-sm font-medium text-foreground text-right">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {booking.depositAmount != null && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/20">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Resumen de pago
              </p>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("depositLabel")}</span>
                <span className="font-semibold">{formatCurrency(booking.depositAmount)}</span>
              </div>
              <div className="flex justify-between text-sm pt-3 border-t border-border">
                <span className="text-muted-foreground">{t("totalLabel")}</span>
                <span className="font-bold text-lg">{formatCurrency(booking.totalPrice)}</span>
              </div>
            </div>
          </div>
        )}

        {booking.depositAmount != null && (
          <DepositCallToAction
            depositAmount={booking.depositAmount}
            totalPrice={booking.totalPrice}
            copy={{
              depositLabel: t("depositLabel"),
              totalLabel: t("totalLabel"),
              helper: t("depositHelper"),
            }}
          />
        )}

        {booking.status === "pending" && (
          <form action={checkoutAction}>
            <button
              type="submit"
              className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:scale-[1.01]"
            >
              {t("payDepositButton")}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
