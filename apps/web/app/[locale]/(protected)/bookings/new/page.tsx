import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { BookingForm } from "@features/bookings";
import type { BookingFormCopy } from "@features/bookings";

type BookingNewPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ vehicleId?: string; vehicleLabel?: string }>;
};

export default async function BookingNewPage({
  params,
  searchParams,
}: BookingNewPageProps) {
  const { locale } = await params;
  const { vehicleId, vehicleLabel } = await searchParams;

  if (!vehicleId) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "BookingNewPage" });

  const copy: BookingFormCopy = {
    heading: t("heading"),
    helper: t("helper"),
    vehicleLabel: t("vehicleLabel"),
    dateRangeLabel: t("dateRangeLabel"),
    dateRangePlaceholder: t("dateRangePlaceholder"),
    notesLabel: t("notesLabel"),
    notesPlaceholder: t("notesPlaceholder"),
    submit: t("submit"),
    submitting: t("submitting"),
    submitError: t("submitError"),
    conflictError: t("conflictError"),
  };

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <BookingForm
          vehicleId={vehicleId}
          vehicleLabel={vehicleLabel ?? vehicleId}
          copy={copy}
        />
      </div>
    </main>
  );
}
