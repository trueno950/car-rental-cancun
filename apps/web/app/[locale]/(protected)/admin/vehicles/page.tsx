import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Pagination } from "@shared/components/ui";
import { VehicleAdminTable, listVehiclesAction } from "@features/vehicles";

const PAGE_SIZE = 20;

type AdminVehiclesPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminVehiclesPage({
  params,
  searchParams,
}: AdminVehiclesPageProps) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  const t = await getTranslations({ locale, namespace: "VehicleAdminPage" });
  const tPag = await getTranslations({ locale, namespace: "Pagination" });

  const vehicles = await listVehiclesAction();

  const page = Math.max(1, parseInt(pageParam ?? "1") || 1);
  const totalPages = Math.ceil(vehicles.length / PAGE_SIZE);
  const paged = vehicles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Link
            href={`/${locale}/admin/vehicles/new`}
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t("createCta")}
          </Link>
        </header>

        <VehicleAdminTable vehicles={paged} locale={locale} />

        <Pagination
          page={page}
          totalPages={totalPages}
          buildHref={(p) => `/${locale}/admin/vehicles?page=${p}`}
          labels={{ previous: tPag("previous"), next: tPag("next") }}
        />
      </div>
    </main>
  );
}
