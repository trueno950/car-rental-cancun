import { Check, X } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import {
  BookingConfirmationPoller,
  getBookingByIdAction,
} from "@features/bookings";

type BookingConfirmationPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function BookingConfirmationPage({
  params,
}: BookingConfirmationPageProps) {
  const { locale, id } = await params;
  const t = await getTranslations({
    locale,
    namespace: "BookingConfirmationPage",
  });

  const booking = await getBookingByIdAction(id);
  if (!booking) notFound();

  if (booking.status === "confirmed") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("confirmedHeading")}
            </h1>
            <p className="max-w-sm text-sm text-muted-foreground">
              {t("confirmedHelper")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${locale}/bookings/${booking.id}`}
              className="rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("viewBooking")}
            </Link>
            <Link
              href={`/${locale}/vehicles`}
              className="rounded-2xl border border-border px-6 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
            >
              {t("browseVehicles")}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (booking.status === "cancelled") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <X className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("cancelledHeading")}
            </h1>
            <p className="max-w-sm text-sm text-muted-foreground">
              {t("cancelledHelper")}
            </p>
          </div>
          <Link
            href={`/${locale}/vehicles`}
            className="rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t("browseVehicles")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <BookingConfirmationPoller
        bookingId={booking.id}
        locale={locale}
        copy={{
          pendingHeading: t("pendingHeading"),
          pendingHelper: t("pendingHelper"),
          timeoutHeading: t("timeoutHeading"),
          timeoutHelper: t("timeoutHelper"),
          viewBooking: t("viewBooking"),
        }}
      />
    </main>
  );
}
