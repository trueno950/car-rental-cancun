import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import {
  BookingStatusBadge,
  DepositCallToAction,
  getBookingByIdAction,
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

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("heading")}
            </h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {booking.id}
            </p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </header>

        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("vehicleLabel")}</dt>
              <dd className="font-mono text-xs">{booking.vehicleId}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("datesLabel")}</dt>
              <dd>
                {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("createdLabel")}</dt>
              <dd>{formatDate(booking.createdAt)}</dd>
            </div>
            {booking.notes ? (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("notesLabel")}</dt>
                <dd className="max-w-xs text-right">{booking.notes}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        {booking.depositAmount != null ? (
          <DepositCallToAction
            depositAmount={booking.depositAmount}
            totalPrice={booking.totalPrice}
            copy={{
              depositLabel: t("depositLabel"),
              totalLabel: t("totalLabel"),
              helper: t("depositHelper"),
            }}
          />
        ) : null}
      </div>
    </main>
  );
}
