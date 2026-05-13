import { getTranslations } from "next-intl/server";

import { MapView } from "@features/map";
import {
  ReservationRequestForm,
  RESERVATION_BLOCKED_DATES,
  RESERVATION_PICKUP_LOCATIONS,
} from "@features/reservations";

type ReservationPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ReservationPage({ params }: ReservationPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ReservationPage" });

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <ReservationRequestForm
          blockedDates={RESERVATION_BLOCKED_DATES}
          copy={{
            blockedDatesLabel: t("dateRangeLabel"),
            dateRangeDescription: t("dateRangeDescription"),
            heading: t("heading"),
            helper: t("helper"),
            locationDescription: t("locationDescription"),
            locationLabel: t("locationLabel"),
            submit: t("submit"),
            submitError: t("submitError"),
            success: t("success"),
            timezoneDescription: t("timezoneDescription"),
            timezoneLabel: t("timezoneLabel"),
          }}
        />
        <MapView
          description={t("mapDescription")}
          emptyLabel={t("mapEmpty")}
          locations={RESERVATION_PICKUP_LOCATIONS}
          title={t("mapHeading")}
        />
      </div>
    </main>
  );
}
