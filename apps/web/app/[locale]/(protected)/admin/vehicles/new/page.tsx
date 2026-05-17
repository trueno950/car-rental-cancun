import { VehicleForm, createVehicleAction } from "@features/vehicles";

type NewVehiclePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NewVehiclePage({ params }: NewVehiclePageProps) {
  const { locale } = await params;

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <VehicleForm mode="create" locale={locale} onSubmit={createVehicleAction} />
      </div>
    </main>
  );
}
