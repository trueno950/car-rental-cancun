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
    viewDetails: t("viewDetails"),
  };

  const vehicles = await listVehiclesAction();

  return (
    <main className="overflow-x-hidden min-h-screen">
      <div className="relative bg-foreground pt-32 pb-16 px-6">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 50% 100%, var(--color-primary) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            Cancún · México
          </p>
          <h1
            className="font-bold text-background leading-[1.08] max-w-2xl"
            style={{ fontSize: "clamp(2.2rem, 4.5vw, 4rem)" }}
          >
            {copy.heading}
          </h1>
          <p className="mt-4 text-background/60 text-base max-w-xl leading-relaxed">
            {copy.helper}
          </p>

          <div className="flex gap-8 mt-8 pt-8 border-t border-background/10">
            {[
              { value: `${vehicles.length}`, label: "Vehículos disponibles" },
              { value: "Desde $41", label: "Por día, todo incluido" },
              { value: "24h", label: "Atención al cliente" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-bold text-background">{stat.value}</p>
                <p className="text-xs text-background/50 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-12 max-w-7xl mx-auto">
        <VehicleGrid vehicles={vehicles} copy={copy} locale={locale} />
      </div>
    </main>
  );
}
