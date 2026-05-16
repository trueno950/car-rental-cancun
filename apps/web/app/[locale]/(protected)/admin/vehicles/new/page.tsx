import { getTranslations } from "next-intl/server";

import { VehicleForm, createVehicleAction } from "@features/vehicles";

type NewVehiclePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NewVehiclePage({ params }: NewVehiclePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "VehicleAdminPage" });

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <VehicleForm mode="create" onSubmit={createVehicleAction} />
      </div>
    </main>
  );
}
