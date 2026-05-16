import Link from "next/link";
import { getTranslations } from "next-intl/server";

import {
  VehicleAdminTable,
  listVehiclesAction,
} from "@features/vehicles";

type AdminVehiclesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminVehiclesPage({
  params,
}: AdminVehiclesPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "VehicleAdminPage" });

  const vehicles = await listVehiclesAction();

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>
          <Link
            href={`/${locale}/admin/vehicles/new`}
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t("createCta")}
          </Link>
        </header>

        <VehicleAdminTable vehicles={vehicles} locale={locale} />
      </div>
    </main>
  );
}
