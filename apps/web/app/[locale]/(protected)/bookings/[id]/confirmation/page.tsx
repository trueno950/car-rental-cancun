import { Check, X, ArrowRight } from "lucide-react";
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
      <main className="flex min-h-screen items-center justify-center px-4 pt-20">
        <div className="text-center max-w-md w-full">
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: "oklch(0.92 0.06 165)" }}
          >
            <Check className="h-10 w-10 text-emerald-700" strokeWidth={2.5} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            Listo
          </p>
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            {t("confirmedHeading")}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed mb-10">
            {t("confirmedHelper")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/${locale}/bookings/${booking.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
            >
              {t("viewBooking")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/${locale}/vehicles`}
              className="inline-flex items-center justify-center rounded-full border border-border px-7 py-3.5 text-sm font-semibold hover:bg-muted transition-colors"
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
      <main className="flex min-h-screen items-center justify-center px-4 pt-20">
        <div className="text-center max-w-md w-full">
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10"
          >
            <X className="h-10 w-10 text-destructive" strokeWidth={2.5} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Estado
          </p>
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            {t("cancelledHeading")}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed mb-10">
            {t("cancelledHelper")}
          </p>
          <Link
            href={`/${locale}/vehicles`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
          >
            {t("browseVehicles")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 pt-20">
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
