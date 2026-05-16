import { getTranslations } from "next-intl/server";

import { VehicleGrid, listVehiclesAction } from "@features/vehicles";
import type { VehicleCatalogPageCopy } from "@features/vehicles";

type VehicleCatalogPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function VehicleCatalogPage({
  params,
}: VehicleCatalogPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "VehicleCatalogPage" });

  const copy: VehicleCatalogPageCopy = {
    heading: t("heading"),
    helper: t("helper"),
    emptyTitle: t("emptyTitle"),
    emptyDescription: t("emptyDescription"),
    availabilityAvailable: t("availabilityAvailable"),
    availabilityUnavailable: t("availabilityUnavailable"),
    perDay: t("perDay"),
    yearLabel: t("yearLabel"),
    bookButton: t("bookButton"),
  };

  const vehicles = await listVehiclesAction();

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {copy.heading}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {copy.helper}
          </p>
        </header>
        <VehicleGrid vehicles={vehicles} copy={copy} locale={locale} />
      </div>
    </main>
  );
}
