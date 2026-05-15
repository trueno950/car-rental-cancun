import { getTranslations } from "next-intl/server";

import {
  EmployeeBookingsTable,
  getAllBookingsAction,
} from "@features/bookings";
import type { EmployeeBookingsTableCopy } from "@features/bookings";

type EmployeeBookingsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function EmployeeBookingsPage({
  params,
}: EmployeeBookingsPageProps) {
  const { locale } = await params;
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
    empty: t("empty"),
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
        <EmployeeBookingsTable bookings={bookings} copy={copy} />
      </div>
    </main>
  );
}
